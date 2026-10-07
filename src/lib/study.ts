import { evalPrompts, type ModelId } from "@/data";

const PAIRS: [ModelId, ModelId][] = [
  ["gpt", "g25"],
  ["gpt", "g31"],
  ["g25", "g31"],
];

const hash = (s: string) => [...s].reduce((sum, c) => sum + c.charCodeAt(0), 0);

/**
 * Which two models are shown as Image A / Image B for each prompt, for this participant.
 * Pairs rotate between people so every model gets compared fairly, and the A/B sides are flipped
 * so position does not favour any one model. The same person always gets the same layout.
 */
export function assignPairs(email: string): [ModelId, ModelId][] {
  const h = hash(email.trim().toLowerCase());
  return evalPrompts.map((_, i) => {
    const [x, y] = PAIRS[(i + h) % PAIRS.length];
    return (h + i) % 2 === 0 ? [x, y] : [y, x];
  });
}
