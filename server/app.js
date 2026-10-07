import express from "express";
import cors from "cors";

const PROMPT_IDS = ["P01", "P02", "P03", "P04", "P05"];
const MODEL_IDS = ["gpt", "g25", "g31"];
const RATING_KEYS = ["adherence", "culture", "clarity", "quality"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const text = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/**
 * Builds the API. `db` is a MongoDB Db (or anything with the same collection methods).
 * Passwords never live here — the connection is made in index.js from the .env file.
 */
export function createApp(db, { adminKey = "", corsOrigin = "" } = {}) {
  const app = express();
  app.use(cors(corsOrigin ? { origin: corsOrigin.split(",").map((s) => s.trim()) } : undefined));
  app.use(express.json({ limit: "50kb" }));

  const participants = db.collection("participants");
  const reviews = db.collection("reviews");
  const bad = (res, message, status = 400) => res.status(status).json({ error: message });
  const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);

  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  // ---- Participants (name, email, age, consent) ----
  app.get(
    "/api/participants",
    wrap(async (_req, res) => {
      res.json(await participants.find({}, { projection: { _id: 0 } }).sort({ time: 1 }).toArray());
    }),
  );

  app.post(
    "/api/participants",
    wrap(async (req, res) => {
      const b = req.body ?? {};
      const name = text(b.name, 100);
      const email = text(b.email, 200).toLowerCase();
      const age = Number(b.age);
      if (name.length < 2) return bad(res, "Please enter your full name.");
      if (!EMAIL_RE.test(email)) return bad(res, "Please enter a valid email address.");
      if (!Number.isInteger(age) || age < 18 || age > 120) return bad(res, "Participants must be 18 or older.");
      if (b.consent !== true) return bad(res, "Consent is required to take part.");

      const doc = { name, email, age, consent: true, time: new Date().toISOString() };
      await participants.updateOne({ email }, { $set: doc }, { upsert: true });
      res.status(201).json(doc);
    }),
  );

  // ---- Reviews ----
  app.get(
    "/api/reviews",
    wrap(async (_req, res) => {
      res.json(await reviews.find({}, { projection: { _id: 0 } }).sort({ time: 1 }).toArray());
    }),
  );

  app.post(
    "/api/reviews",
    wrap(async (req, res) => {
      const b = req.body ?? {};
      const email = text(b.email, 200).toLowerCase();
      const promptId = text(b.promptId, 10);
      if (!PROMPT_IDS.includes(promptId)) return bad(res, "Unknown prompt.");
      if (!MODEL_IDS.includes(b.modelA) || !MODEL_IDS.includes(b.modelB) || b.modelA === b.modelB) return bad(res, "Unknown model pair.");
      if (!["A", "B", "tie"].includes(b.choice)) return bad(res, "Please choose Image A, Image B or tie.");

      // Only people who have given consent can submit reviews.
      const person = await participants.findOne({ email, consent: true });
      if (!person) return bad(res, "Consent has not been recorded for this email.", 403);

      const ratings = {};
      for (const k of RATING_KEYS) {
        const v = Number(b.ratings?.[k]);
        if (Number.isInteger(v) && v >= 1 && v <= 5) ratings[k] = v;
      }

      // One answer per person per prompt: submitting again replaces the earlier one.
      const doc = {
        id: `${email}|${promptId}`,
        participant: person.name,
        email,
        promptId,
        modelA: b.modelA,
        modelB: b.modelB,
        choice: b.choice,
        ratings,
        comment: text(b.comment, 1000),
        time: new Date().toISOString(),
      };
      await reviews.updateOne({ id: doc.id }, { $set: doc }, { upsert: true });
      res.status(201).json(doc);
    }),
  );

  // ---- Delete everything (protected by ADMIN_KEY) ----
  app.delete(
    "/api/responses",
    wrap(async (req, res) => {
      if (!adminKey) return bad(res, "ADMIN_KEY is not set on the server, so deleting is disabled.", 403);
      if (req.get("x-admin-key") !== adminKey) return bad(res, "Wrong admin key.", 401);
      await reviews.deleteMany({});
      await participants.deleteMany({});
      res.json({ ok: true });
    }),
  );

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: "Something went wrong on the server. Please try again." });
  });

  return app;
}
