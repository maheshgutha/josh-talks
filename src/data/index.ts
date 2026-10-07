import { Brain, Sparkles, Zap, type LucideIcon } from "lucide-react";

/* ---------- Types ---------- */
export type ModelId = "gpt" | "g25" | "g31";
export type ProductKind = "diya" | "kurta" | "mithai" | "rangoli" | "banner";
export type PaletteKind = "warm" | "modern" | "royal";

export interface Model {
  id: ModelId;
  name: string;
  vendor: string;
  /** Shorter name used in chart legends */
  short: string;
  blurb: string;
  icon: LucideIcon;
  color: string; // used in charts
  gradient: string; // tailwind gradient classes
}

/* ---------- Models ---------- */
export const models: Model[] = [
  {
    id: "gpt",
    name: "GPT Image 1",
    short: "GPT Image 1",
    vendor: "OpenAI",
    blurb: "Known for following detailed instructions closely and keeping products sharp and clear.",
    icon: Brain,
    color: "#4f46e5",
    gradient: "from-indigo-500 to-violet-600",
  },
  {
    id: "g25",
    name: "Gemini 2.5 Flash Image",
    short: "Gemini 2.5 Flash Image",
    vendor: "Google",
    blurb: "A fast image model with a strong feel for colour, light and festive atmosphere.",
    icon: Zap,
    color: "#f97316",
    gradient: "from-orange-400 to-amber-500",
  },
  {
    id: "g31",
    name: "Gemini 3.1 Flash Image Preview",
    short: "Gemini 3.1 Flash Image",
    vendor: "Google",
    blurb: "The newest preview release, included to see how recent changes affect Indian scenes.",
    icon: Sparkles,
    color: "#0891b2",
    gradient: "from-cyan-500 to-teal-500",
  },
];

export const modelById = (id: ModelId) => models.find((m) => m.id === id)!;

/**
 * IMAGES: set USE_REAL_IMAGES to true once you have put the generated images in the "public/images" folder,
 * named like P01-gpt.png, P01-g25.png, P01-g31.png ... P05-g31.png (prompt id + model id).
 * While it is false, simple placeholder illustrations are shown and the dashboard says so.
 */
export const USE_REAL_IMAGES = true;

/** Placeholder illustration style for each model (only used when real images are not available). */
export const modelPalette: Record<ModelId, PaletteKind> = { gpt: "warm", g25: "modern", g31: "royal" };

/* ---------- Landing page content ---------- */
export const trustMetrics = [
  { value: "3", label: "AI Models Compared" },
  { value: "8–10", label: "Human Evaluators" },
  { value: "India", label: "Specific Use Cases" },
  { value: "Blind", label: "Pairwise Voting" },
];

export const howItWorks = [
  { title: "Define a focused Indian use case", text: "Pick one real-world task, such as festive product ads." },
  { title: "Generate comparable images", text: "Every model gets the exact same prompt." },
  { title: "Collect blind human preferences", text: "People choose the better image without seeing model names." },
  { title: "Discover strengths and limitations", text: "See where each model shines and where it struggles." },
];

export const whyItMatters = [
  {
    title: "Cultural relevance",
    text: "Images for India should feel like India — the right festivals, clothing, colours and settings, not a generic stock look.",
  },
  {
    title: "Practical usefulness",
    text: "A good image is one a real business can use: clear product, clean space for text, and a believable scene.",
  },
  {
    title: "Better AI decisions",
    text: "Evidence from real people helps teams choose the right tool instead of relying on brand names or guesswork.",
  },
];

/* ---------- Evaluation prompts (participant flow) ---------- */
export interface EvalPrompt {
  id: string;
  shortName: string;
  category: string;
  useCase: string;
  prompt: string;
  question: string;
  product: ProductKind;
}

export const evalPrompts: EvalPrompt[] = [
  {
    id: "P01",
    shortName: "Diya Gift Box",
    category: "E-commerce",
    useCase: "Indian festive product creatives",
    prompt:
      "Create a premium online-store advertisement for a handmade diya gift box for an Indian Diwali sale. Show the product clearly, use a warm festive Indian setting, and leave clean empty space for brand text.",
    question: "Which image is more suitable for this Indian e-commerce campaign?",
    product: "diya",
  },
  {
    id: "P02",
    shortName: "Festive Kurta",
    category: "E-commerce",
    useCase: "Indian festive product creatives",
    prompt:
      "Create a fashion-store advertisement for a festive cotton kurta for men, styled for a family Diwali celebration. Show the kurta clearly on display, with a warm Indian home setting and clean space for a headline.",
    question: "Which image would work better for this fashion campaign?",
    product: "kurta",
  },
  {
    id: "P03",
    shortName: "Mithai Hamper",
    category: "E-commerce",
    useCase: "Indian festive product creatives",
    prompt:
      "Create an online-store advertisement for a mithai gift hamper for Diwali. Show a variety of Indian sweets clearly in an elegant basket, with festive decor and clean empty space for offer text.",
    question: "Which image makes the sweets look more appealing and giftable?",
    product: "mithai",
  },
  {
    id: "P04",
    shortName: "Rangoli Kit",
    category: "E-commerce",
    useCase: "Indian festive product creatives",
    prompt:
      "Create a product advertisement for a ready-to-use rangoli colour kit. Show the kit and a finished rangoli pattern, in a bright home entrance setting, and leave space for brand text.",
    question: "Which image feels more authentic and useful for this campaign?",
    product: "rangoli",
  },
  {
    id: "P05",
    shortName: "Marketplace Sale Banner",
    category: "E-commerce",
    useCase: "Indian festive product creatives",
    prompt:
      "Create a wide marketplace banner for a Diwali mega sale. Use festive Indian colours and decor, show a shopping bag as the hero object, and keep a large clean area for sale text and a button.",
    question: "Which banner would you trust to run on a real shopping app?",
    product: "banner",
  },
];

export const ratingDimensions = [
  { key: "adherence", label: "Prompt adherence", hint: "Did it follow the request?" },
  { key: "culture", label: "Cultural relevance", hint: "Does it feel right for India?" },
  { key: "clarity", label: "Product clarity", hint: "Is the product easy to see?" },
  { key: "quality", label: "Visual quality", hint: "Does it look polished?" },
] as const;

export type RatingKey = (typeof ratingDimensions)[number]["key"];

/* ---------- Dashboard ---------- */
export const methodology = [
  { label: "Use case", value: "Indian festive e-commerce product creatives" },
  { label: "Evaluation type", value: "Blind pairwise human preference test" },
  { label: "Images per prompt", value: "3 models, same prompt (two shown per comparison, sides randomised)" },
  { label: "Evaluation criteria", value: "Cultural relevance, prompt adherence, product clarity, visual quality" },
];

/** Shown in the prompt-analysis pop-up. */
export const modelSettings = [
  { label: "Models compared", value: "GPT Image 1 · Gemini 2.5 Flash Image · Gemini 3.1 Flash Image Preview" },
  { label: "Prompt text", value: "Identical for every model" },
  { label: "Pairing", value: "Two models per comparison; Image A / B sides are randomised" },
  { label: "Image source", value: USE_REAL_IMAGES ? "Generated images from the public/images folder" : "Placeholder illustrations (real images not added yet)" },
];

export const dashboardSections = [
  { id: "overview", label: "Overview" },
  { id: "leaderboard", label: "Leaderboard" },
  { id: "prompt-analysis", label: "Prompt Analysis" },
  { id: "feedback", label: "Feedback Themes" },
  { id: "reviews", label: "All Reviews" },
  { id: "setup", label: "Evaluation Setup" },
] as const;

/* ---------- Participants & consent ---------- */
export const consentStatement =
  "I confirm that I am 18 years or older. I voluntarily participated in this evaluation. I consent to my name, email, and responses/ratings being included in this assignment submission for hiring evaluation purposes.";

/** People who agreed to take part (details supplied by the researcher). Consent is recorded only when they fill in the form. */
export interface RosterEntry {
  id: string;
  name: string;
  email: string;
  age: number;
}

export const roster: RosterEntry[] = [
  { id: "U01", name: "B. Vamsi", email: "vamsibejjipurapu9398@gmail.com", age: 20 },
  { id: "U02", name: "A. Dilleswararao", email: "dillepalla87@gmail.com", age: 20 },
  { id: "U03", name: "Sk. Ahmad Javed", email: "ahmadjaved7842@gmail.com", age: 20 },
  { id: "U04", name: "R. Swathi", email: "swathiraguthu@gmail.com", age: 20 },
  { id: "U05", name: "S. Anand", email: "anandyt2006@gmail.com", age: 20 },
  { id: "U06", name: "M. Balaprabhakar", email: "mallavarapubalaprabhakar11@gmail.com", age: 21 },
  { id: "U07", name: "V. Nagasaiendra", email: "23hp1a0554@gmail.com", age: 20 },
  { id: "U08", name: "G. Maneesh", email: "23hp1a0550@gmail.com", age: 20 },
  { id: "U09", name: "K. Beula Katamgari", email: "23hp1a0549@gmail.com", age: 20 },
  { id: "U10", name: "G. Nikitha", email: "23hp1a0548@gmail.com", age: 20 },
];

/** Saved when someone completes the consent form on the evaluation page. */
export interface Participant {
  name: string;
  email: string;
  age: number;
  consent: boolean;
  time: string;
}

/* ---------- Reviews (real submissions only) ---------- */
export type ReviewChoice = "A" | "B" | "tie";

export interface Review {
  id: string;
  participant: string;
  email: string;
  promptId: string;
  /** Which model was shown as Image A and Image B in this comparison (hidden from the participant). */
  modelA: ModelId;
  modelB: ModelId;
  choice: ReviewChoice;
  ratings: Partial<Record<RatingKey, number>>;
  comment: string;
  time: string;
}
