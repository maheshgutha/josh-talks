# India Image Eval

Human preference evaluation for AI-generated images in Indian contexts.
React + TypeScript + Tailwind + Recharts on the front, a small Express server + MongoDB for storing responses.

## One-time setup
1. `npm install`
2. Copy `.env.example` to a new file named `.env` (same folder) and fill in:
   - `MONGODB_URI` - your Atlas connection string with the real username and password
     (special characters in the password must be URL-encoded, e.g. `@` becomes `%40`)
   - `ADMIN_KEY` - any secret word (needed only for "Clear all responses")
3. In MongoDB Atlas -> Network Access, allow your IP address (or `0.0.0.0/0` while testing).

## Run
    npm run dev:all

Then open http://localhost:5173. (`npm run server` and `npm run dev` start the two parts separately.)

## Add the real generated images (important)
The evaluation currently shows placeholder illustrations. For valid model results:
1. Generate one image per prompt from each model and save them in `public/images/` named
   `P01-gpt.png`, `P01-g25.png`, `P01-g31.png`, then `P02-...` up to `P05-g31.png` (15 images).
   (`gpt` = GPT Image 1, `g25` = Gemini 2.5 Flash Image, `g31` = Gemini 3.1 Flash Image Preview)
2. In `src/data/index.ts` set `USE_REAL_IMAGES = true`.

## How the dashboard numbers are made
Everything on the dashboard is calculated from the reviews stored in MongoDB.
Each comparison records which model was Image A / Image B. Win rate = comparisons won / comparisons (a tie counts as half).
Ratings (1-5) apply to the image the person chose (both images for a tie). Feedback themes are found by matching common words in comments.

## Where the data goes
Database `india_image_eval` with two collections: `participants` (name, email, age, consent) and `reviews`
(one answer per person per prompt, with ratings and comment). The `.env` file is git-ignored - never share it.

## Structure
- `server/` - API (`app.js`) and MongoDB connection (`index.js`)
- `src/lib/api.ts` - frontend calls to the API
- `src/data/index.ts` - prompts, models, participant list, settings
- `src/lib/analytics.ts` - turns saved reviews into leaderboard, charts, insights and themes
- `src/pages/` - Landing, Evaluation, Dashboard
"# josh-talks" 
