import { Sparkles } from "lucide-react";

export function Logo({ onClick }: { onClick?: () => void }) {
  const content = (
    <>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-saffron-500 via-rose-500 to-research-600 text-white shadow-soft">
        <Sparkles className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="font-display text-lg font-bold tracking-tight text-ink">India Image Eval</span>
    </>
  );
  return onClick ? (
    <button type="button" onClick={onClick} className="flex items-center gap-2.5 rounded-lg" aria-label="India Image Eval — go to home">
      {content}
    </button>
  ) : (
    <div className="flex items-center gap-2.5">{content}</div>
  );
}
