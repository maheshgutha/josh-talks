import { evalPrompts, models, ratingDimensions, type ModelId, type Participant, type RatingKey, type Review } from "@/data";

/** Everything on the dashboard is calculated here from the reviews saved in the database. */

export type ModelRecord<T> = Record<ModelId, T>;

export interface ModelStats {
  modelId: ModelId;
  comparisons: number;
  wins: number;
  ties: number;
  /** 0-100, ties count as half a win. null when the model has not been compared yet. */
  winRate: number | null;
  /** Average 1-5 rating of the images people chose (for a tie, both images share the rating). */
  ratings: Record<RatingKey, number | null>;
}

const hasModels = (r: Review) => !!r.modelA && !!r.modelB;

export function winnerOf(r: Review): ModelId | "tie" {
  if (r.choice === "tie") return "tie";
  return r.choice === "A" ? r.modelA : r.modelB;
}

export function computeModelStats(reviews: Review[]): ModelStats[] {
  const valid = reviews.filter(hasModels);
  return models.map((m) => {
    const mine = valid.filter((r) => r.modelA === m.id || r.modelB === m.id);
    const wins = mine.filter((r) => winnerOf(r) === m.id).length;
    const ties = mine.filter((r) => r.choice === "tie").length;

    const ratings = {} as Record<RatingKey, number | null>;
    for (const d of ratingDimensions) {
      const values = mine
        .filter((r) => winnerOf(r) === m.id || r.choice === "tie")
        .map((r) => r.ratings[d.key])
        .filter((v): v is number => typeof v === "number" && v > 0);
      ratings[d.key] = values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
    }
    return {
      modelId: m.id,
      comparisons: mine.length,
      wins,
      ties,
      winRate: mine.length ? ((wins + ties * 0.5) / mine.length) * 100 : null,
      ratings,
    };
  });
}

export const round1 = (n: number | null) => (n === null ? null : Math.round(n * 10) / 10);

export function dimensionRows(stats: ModelStats[]) {
  return ratingDimensions.map((d) => {
    const row: Record<string, string | number | null> = { dimension: d.label };
    for (const s of stats) row[s.modelId] = round1(s.ratings[d.key]);
    return row;
  });
}

export function promptRows(reviews: Review[]) {
  return evalPrompts.map((p) => {
    const stats = computeModelStats(reviews.filter((r) => r.promptId === p.id));
    const row: Record<string, string | number | null> = { prompt: `${p.id} ${p.shortName}`, short: p.id };
    for (const s of stats) row[s.modelId] = s.winRate === null ? null : Math.round(s.winRate);
    return row;
  });
}

export function preferenceSplit(reviews: Review[]) {
  const valid = reviews.filter(hasModels);
  const colors: Record<ModelId, string> = { gpt: "#4f46e5", g25: "#f97316", g31: "#0891b2" };
  const modelEntries = models
    .map((m) => ({ name: m.short, value: valid.filter((r) => winnerOf(r) === m.id).length, color: colors[m.id] }))
    .sort((a, b) => b.value - a.value);
  const tieCount = valid.filter((r) => r.choice === "tie").length;
  return [...modelEntries, { name: "Tie", value: tieCount, color: "#94a3b8" }];
}

export function leaderboard(stats: ModelStats[]) {
  const withVotes = stats.filter((s) => s.winRate !== null).sort((a, b) => (b.winRate ?? 0) - (a.winRate ?? 0));
  const without = stats.filter((s) => s.winRate === null);
  const bestCulture = Math.max(...withVotes.map((s) => s.ratings.culture ?? -1), -1);

  return [...withVotes, ...without].map((s, i) => {
    let badge = "No votes yet";
    let variant: "success" | "saffron" | "warning" | "neutral" = "neutral";
    if (s.winRate !== null) {
      if (i === 0) [badge, variant] = ["Top overall performer", "success"];
      else if (i === withVotes.length - 1 && withVotes.length > 1) [badge, variant] = ["Needs improvement", "warning"];
      else if (s.ratings.culture !== null && s.ratings.culture === bestCulture) [badge, variant] = ["Strong cultural fit", "saffron"];
      else [badge, variant] = ["Mid-range", "neutral"];
    }
    return { rank: i + 1, ...s, badge, variant };
  });
}

const dimName = (k: RatingKey) => ratingDimensions.find((d) => d.key === k)!.label.toLowerCase();
const extreme = (s: ModelStats, pick: "max" | "min") => {
  const entries = (Object.entries(s.ratings) as [RatingKey, number | null][]).filter(([, v]) => v !== null) as [RatingKey, number][];
  if (!entries.length) return null;
  return entries.reduce((a, b) => ((pick === "max" ? b[1] > a[1] : b[1] < a[1]) ? b : a));
};

export interface Insight {
  title: string;
  text: string;
  tone: "indigo" | "saffron" | "red";
}

export function buildInsights(stats: ModelStats[]): Insight[] {
  const board = leaderboard(stats).filter((s) => s.winRate !== null);
  if (!board.length) return [];
  const name = (id: ModelId) => models.find((m) => m.id === id)!.name;
  const out: Insight[] = [];

  const top = board[0];
  const strong = extreme(top, "max");
  out.push({
    title: "Best overall performance",
    tone: "indigo",
    text: `${name(top.modelId)} had the highest preference score (${Math.round(top.winRate!)}% win rate across ${top.comparisons} comparisons)${strong ? `, and its strongest rating was ${dimName(strong[0])} (${strong[1].toFixed(1)} / 5)` : ""}.`,
  });

  const cultureLeader = [...board].filter((s) => s.ratings.culture !== null).sort((a, b) => b.ratings.culture! - a.ratings.culture!)[0];
  out.push(
    cultureLeader
      ? { title: "Strong India-context results", tone: "saffron", text: `${name(cultureLeader.modelId)} received the highest cultural relevance rating (${cultureLeader.ratings.culture!.toFixed(1)} / 5) from evaluators.` }
      : { title: "Strong India-context results", tone: "saffron", text: "Cultural relevance ratings will appear once evaluators rate the images they choose." },
  );

  const last = board[board.length - 1];
  if (board.length > 1 && last.modelId !== top.modelId) {
    const weak = extreme(last, "min");
    out.push({
      title: "Main improvement area",
      tone: "red",
      text: `${name(last.modelId)} had the lowest win rate (${Math.round(last.winRate!)}%)${weak ? `, with its weakest rating in ${dimName(weak[0])} (${weak[1].toFixed(1)} / 5)` : ""}.`,
    });
  }
  return out;
}

/* ---- Feedback themes: found by matching common words in the comments ---- */

interface ThemeRule {
  label: string;
  tone: "positive" | "negative";
  include: RegExp;
  exclude?: RegExp;
}

const themeRules: ThemeRule[] = [
  { label: "Product was clearly visible", tone: "positive", include: /\b(clearly|clear|visible|easy to see|easily seen|sharp|stands out|can see)\b/i, exclude: /\b(not|isn'?t|wasn'?t|un|no|hardly|barely)\s*(very\s*)?(clear|clearly|visible)|unclear|can(no|')?t see|cannot see/i },
  { label: "Looked festive and premium", tone: "positive", include: /\b(festive|premium|rich|elegant|luxur\w+|beautiful|classy|attractive|vibrant|professional)\b/i },
  { label: "Felt appropriate for an Indian audience", tone: "positive", include: /\b(indian|india|culture|cultural|authentic|traditional|diwali|familiar)\b/i, exclude: /\b(not|isn'?t|wasn'?t|less|doesn'?t|didn'?t)\b[^.]{0,20}\b(indian|india|cultur\w+|authentic)|generic/i },
  { label: "Background was too cluttered", tone: "negative", include: /\b(clutter\w*|busy|messy|crowded|too many|overloaded|distracting)\b/i },
  { label: "Product shape was unclear", tone: "negative", include: /\bunclear|blur\w*|distort\w*|hard to (see|tell|make out)|can(no|')?t (see|tell)|not (very )?(clear|visible)|deformed|weird shape\b/i },
  { label: "Felt generic rather than Indian", tone: "negative", include: /\b(generic|stock|western|not (very )?indian|doesn'?t (look|feel) indian|not authentic|lacks? culture)\b/i },
  { label: "Text area was not usable for a real advertisement", tone: "negative", include: /(no (clean |empty |blank )?(space|room)|(text|copy|headline) (area|space)|not enough space|space for (text|headline|brand))/i },
];

export interface Theme {
  label: string;
  count: number;
  quote: string;
}

export function buildThemes(reviews: Review[]) {
  const comments = reviews.map((r) => r.comment).filter((c) => c && c.trim());
  const run = (tone: "positive" | "negative") =>
    themeRules
      .filter((t) => t.tone === tone)
      .map((t) => {
        const hits = comments.filter((c) => t.include.test(c) && !(t.exclude && t.exclude.test(c)));
        return { label: t.label, count: hits.length, quote: hits[0] ?? "" } satisfies Theme;
      })
      .filter((t) => t.count > 0)
      .sort((a, b) => b.count - a.count);
  return { positive: run("positive"), negative: run("negative"), commentCount: comments.length };
}

/* ---- Overview numbers ---- */

export function buildKpis(reviews: Review[], registered: Participant[]) {
  const consenting = registered.filter((p) => p.consent).length;
  const voters = new Set(reviews.map((r) => r.email.toLowerCase())).size;
  return [
    { label: "Models Evaluated", value: String(models.length), note: "Same prompts for each" },
    { label: "Consenting Participants", value: String(consenting), note: `${voters} have submitted votes` },
    { label: "Pairwise Votes", value: String(reviews.length), note: "Saved in the database" },
    { label: "India-Specific Prompts", value: String(evalPrompts.length), note: "Festive e-commerce" },
  ];
}
