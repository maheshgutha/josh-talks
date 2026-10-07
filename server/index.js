import "dotenv/config";
import dns from "node:dns";
import { MongoClient } from "mongodb";
import { createApp } from "./app.js";

// Fix for Node.js SRV record lookup failures on Windows / certain ISP DNS resolvers
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // Ignore if custom DNS cannot be configured
}

const uri = process.env.MONGODB_URI;
const PORT = Number(process.env.PORT) || 5000;

if (!uri || uri.includes("<db_password>") || uri.includes("<db_username>")) {
  console.error(
    "\nMONGODB_URI is missing or still has the <db_username>/<db_password> placeholders.\n" +
      "Create a file named .env in the project folder (copy .env.example) and put your real connection string in it.\n",
  );
  process.exit(1);
}

try {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
  await client.connect();
  const db = client.db(process.env.DB_NAME || "india_image_eval");
  await db.collection("participants").createIndex({ email: 1 }, { unique: true });
  await db.collection("reviews").createIndex({ id: 1 }, { unique: true });

  const app = createApp(db, { adminKey: process.env.ADMIN_KEY, corsOrigin: process.env.CORS_ORIGIN });
  app.listen(PORT, () => console.log(`API ready on http://localhost:${PORT}  (MongoDB connected)`));
} catch (err) {
  console.error("\nCould not connect to MongoDB:", err.message);
  console.error(
    "Check: 1) username/password are correct (special characters in the password must be URL-encoded),\n" +
      "       2) Atlas > Network Access allows your IP address (or 0.0.0.0/0 while testing).\n",
  );
  process.exit(1);
}
