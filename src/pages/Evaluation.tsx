import { useEffect, useMemo, useRef, useState } from "react";
import { Check, CheckCircle2, Equal, LogOut, Lock, Maximize2, ShieldCheck, Star, UserCheck, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { PromptImage } from "@/components/PromptImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { consentStatement, evalPrompts, ratingDimensions, type Participant, type RatingKey } from "@/data";
import { saveParticipant, saveReview } from "@/lib/api";
import { assignPairs } from "@/lib/study";
import { cn } from "@/lib/utils";

type Choice = "A" | "B" | "tie";
type Ratings = Partial<Record<RatingKey, number>>;

export function Evaluation({ onExit }: { onExit: () => void }) {
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [ratings, setRatings] = useState<Ratings>({});
  const [comment, setComment] = useState("");
  const [zoom, setZoom] = useState<"A" | "B" | null>(null);
  const [done, setDone] = useState(false);
  const feedbackRef = useRef<HTMLDivElement>(null);
  // Which model is Image A / Image B for each prompt (hidden from the participant)
  const pairs = useMemo(() => (participant ? assignPairs(participant.email) : []), [participant]);

  const total = evalPrompts.length;
  const current = evalPrompts[index];

  // Bring the feedback area into view after a choice is made
  useEffect(() => {
    if (choice) feedbackRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [choice]);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const submit = async () => {
    if (!choice || !participant || saving) return;
    setSaving(true);
    setSaveError("");
    try {
      // Stored in the database. We only move on once the server confirms it was saved.
      const [modelA, modelB] = pairs[index];
      await saveReview({ email: participant.email, promptId: current.id, modelA, modelB, choice, ratings, comment: comment.trim() });
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not save your answer. Please try again.");
      setSaving(false);
      return;
    }
    setSaving(false);
    if (index + 1 >= total) {
      setDone(true);
      return;
    }
    setIndex(index + 1);
    setChoice(null);
    setRatings({});
    setComment("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (done) return <Completion onHome={onExit} />;
  if (!participant) return <RegistrationForm onStart={setParticipant} onExit={onExit} />;

  const images = [
    { key: "A" as const, model: pairs[index][0] },
    { key: "B" as const, model: pairs[index][1] },
  ];

  return (
    <div className="min-h-screen pb-16">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-ink/5 bg-canvas/90 backdrop-blur">
        <div className="mx-auto grid h-16 max-w-5xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4 sm:px-6">
          <div className="hidden sm:block"><Logo /></div>
          <div className="sm:hidden"><Logo /></div>
          <div className="flex flex-col items-center gap-1.5" aria-live="polite">
            <span className="text-sm font-bold text-ink">Evaluation {index + 1} of {total}</span>
            <div
              className="h-1.5 w-32 overflow-hidden rounded-full bg-ink/10 sm:w-48"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={total}
              aria-valuenow={index + 1}
              aria-label="Evaluation progress"
            >
              <div className="h-full rounded-full bg-gradient-to-r from-saffron-500 to-research-600 transition-all duration-500" style={{ width: `${((index + 1) / total) * 100}%` }} />
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onExit}>
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Exit Evaluation</span>
            <span className="sm:hidden">Exit</span>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 pt-8 sm:px-6">
        {/* Intro */}
        <Card className="bg-gradient-to-br from-white to-research-50/60 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-2xl">
              <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">Help us evaluate AI images</h1>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft sm:text-base">
                You will see two anonymous AI-generated images created for the same prompt. Choose the image you think is more useful for the intended Indian use case.
              </p>
            </div>
            <Badge variant="success"><ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />Model identities are hidden during voting.</Badge>
          </div>
        </Card>

        {/* Use case */}
        <Card className="p-6" key={current.id}>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="saffron">{current.category}</Badge>
            <span className="text-sm font-semibold text-ink">{current.useCase}</span>
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-ink-mute">Prompt</p>
          <blockquote className="mt-2 rounded-xl border-l-4 border-saffron-400 bg-saffron-50/60 p-4 text-sm leading-relaxed text-ink sm:text-base">
            {current.prompt}
          </blockquote>
        </Card>

        {/* Comparison */}
        <section aria-labelledby="compare-heading">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 id="compare-heading" className="text-sm font-bold uppercase tracking-wider text-ink-mute">Compare</h2>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
              <Lock className="h-3.5 w-3.5" aria-hidden="true" /> Same prompt • Anonymous comparison
            </span>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {images.map((img) => {
              const selected = choice === img.key;
              return (
                <figure key={`${current.id}-${img.key}`} className={cn("overflow-hidden rounded-2xl border-2 bg-white shadow-soft transition-all duration-300", selected ? "border-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,.15)]" : "border-transparent hover:shadow-lift")}>
                  <button type="button" onClick={() => setZoom(img.key)} className="group relative block w-full" aria-label={`Enlarge Image ${img.key}`}>
                    <PromptImage promptId={current.id} modelId={img.model} className="aspect-[4/3] w-full transition-transform duration-500 group-hover:scale-[1.03]" label={`Image ${img.key}`} />
                    <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-ink/70 px-3 py-1.5 text-xs font-semibold text-white opacity-90 backdrop-blur transition-opacity group-hover:opacity-100">
                      <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" /> Click image to enlarge
                    </span>
                    {selected && (
                      <span className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg animate-pop" aria-hidden="true">
                        <Check className="h-5 w-5" />
                      </span>
                    )}
                  </button>
                  <figcaption className="flex items-center justify-between px-4 py-3">
                    <span className="text-base font-bold text-ink">Image {img.key}</span>
                    {selected && <Badge variant="success">Your choice</Badge>}
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </section>

        {/* Choice */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-ink">{current.question}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3" role="group" aria-label="Your choice">
            <ChoiceButton active={choice === "A"} onClick={() => setChoice("A")}>Choose Image A</ChoiceButton>
            <ChoiceButton active={choice === "B"} onClick={() => setChoice("B")}>Choose Image B</ChoiceButton>
            <ChoiceButton active={choice === "tie"} onClick={() => setChoice("tie")}>
              <Equal className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>It’s a tie / Both are equally useful</span>
            </ChoiceButton>
          </div>
        </Card>

        {/* Optional feedback */}
        {choice && (
          <div ref={feedbackRef}>
            <Card className="animate-rise p-6">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-ink">Tell us a little more</h2>
                <Badge>Optional</Badge>
              </div>
              <p className="mt-2 text-sm text-ink-soft">Rate the image you chose. If you picked a tie, rate both together.</p>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {ratingDimensions.map((d) => (
                  <StarRating
                    key={d.key}
                    label={d.label}
                    hint={d.hint}
                    value={ratings[d.key] ?? 0}
                    onChange={(v) => setRatings((r) => ({ ...r, [d.key]: v }))}
                  />
                ))}
              </div>
              <label htmlFor="why" className="mt-6 block text-sm font-semibold text-ink">What influenced your choice?</label>
              <textarea
                id="why"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="For example: the product was easier to see, or the festive feel looked more real."
                className="mt-2 w-full rounded-xl border border-ink/15 bg-white p-3 text-sm text-ink placeholder:text-ink-mute focus-visible:border-research-500"
              />
              {saveError && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">{saveError}</p>}
              <Button size="lg" variant="saffron" className="mt-5 w-full sm:w-auto" onClick={submit} disabled={saving}>
                {saving ? "Saving…" : "Submit Review & Continue"}
              </Button>
            </Card>
          </div>
        )}

        <p className="flex items-start justify-center gap-2 pt-2 text-center text-xs text-ink-mute">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Your response is used only for this research evaluation. No model name is shown while voting.
        </p>
      </main>

      {zoom && (
        <Lightbox onClose={() => setZoom(null)} label={`Image ${zoom}`}>
          <PromptImage promptId={current.id} modelId={pairs[index][zoom === "A" ? 0 : 1]} className="aspect-[4/3] w-full" label={`Image ${zoom}, enlarged`} />
        </Lightbox>
      )}
    </div>
  );
}

type FormErrors = Partial<Record<"name" | "email" | "age" | "agree", string>>;

/** Collects name, email, age and consent before the first comparison. */
function RegistrationForm({ onStart, onExit }: { onStart: (p: Participant) => void; onExit: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: FormErrors = {};
    const ageNum = Number(age);
    if (name.trim().length < 2) next.name = "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = "Please enter a valid email address.";
    if (!age.trim() || !Number.isInteger(ageNum)) next.age = "Please enter your age as a whole number.";
    else if (ageNum < 18) next.age = "Participants must be 18 or older.";
    else if (ageNum > 120) next.age = "Please enter a valid age.";
    if (!agree) next.agree = "Please tick the box to give your consent.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    setServerError("");
    try {
      const saved = await saveParticipant({ name: name.trim(), email: email.trim().toLowerCase(), age: ageNum, consent: true });
      onStart(saved);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Could not save your details. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-ink/5">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <Button variant="outline" size="sm" onClick={onExit}><LogOut className="h-4 w-4" aria-hidden="true" />Exit</Button>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Card className="animate-rise p-6 sm:p-8">
          <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">Before you begin</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft sm:text-base">
            Please share a few details and give your consent. You will then compare {evalPrompts.length} image pairs.
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
            <Field id="name" label="Full name" error={errors.name}>
              <input id="name" type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass(!!errors.name)} aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-err" : undefined} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-[1fr_140px]">
              <Field id="email" label="Email" error={errors.email}>
                <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass(!!errors.email)} aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-err" : undefined} />
              </Field>
              <Field id="age" label="Age" error={errors.age}>
                <input id="age" type="number" inputMode="numeric" min={18} value={age} onChange={(e) => setAge(e.target.value)} className={inputClass(!!errors.age)} aria-invalid={!!errors.age} aria-describedby={errors.age ? "age-err" : undefined} />
              </Field>
            </div>

            <div className={cn("rounded-xl border p-4", errors.agree ? "border-red-300 bg-red-50/60" : "border-emerald-200 bg-emerald-50/60")}>
              <p className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                <UserCheck className="h-4 w-4" aria-hidden="true" /> Consent
              </p>
              <label htmlFor="agree" className="mt-3 flex cursor-pointer items-start gap-3">
                <input id="agree" type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 rounded border-ink/30 accent-research-600" aria-describedby={errors.agree ? "agree-err" : undefined} />
                <span className="text-sm leading-relaxed text-ink-soft">{consentStatement}</span>
              </label>
              {errors.agree && <p id="agree-err" role="alert" className="mt-2 text-sm font-medium text-red-600">{errors.agree}</p>}
            </div>

            {serverError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">{serverError}</p>}
            <Button type="submit" size="lg" variant="saffron" className="w-full sm:w-auto" disabled={submitting}>
              {submitting ? "Saving…" : "Begin evaluation"}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
}

const inputClass = (invalid: boolean) =>
  cn("mt-2 w-full rounded-xl border bg-white p-3 text-sm text-ink focus-visible:border-research-500", invalid ? "border-red-400" : "border-ink/15");

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-ink">{label}</label>
      {children}
      {error && <p id={`${id}-err`} role="alert" className="mt-1.5 text-sm font-medium text-red-600">{error}</p>}
    </div>
  );
}

function ChoiceButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex min-h-[3.25rem] items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-bold transition-all duration-200 active:scale-[0.98]",
        active
          ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-soft"
          : "border-ink/10 bg-white text-ink hover:border-research-400 hover:bg-research-50",
      )}
    >
      {active && <CheckCircle2 className="h-4 w-4 shrink-0 animate-pop" aria-hidden="true" />}
      {children}
    </button>
  );
}

function StarRating({ label, hint, value, onChange }: { label: string; hint: string; value: number; onChange: (v: number) => void }) {
  return (
    <div role="radiogroup" aria-label={`${label}, 1 to 5`}>
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-semibold text-ink">{label}</span>
        <span className="text-xs text-ink-mute">{value ? `${value} / 5` : hint}</span>
      </div>
      <div className="mt-1.5 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onClick={() => onChange(value === n ? 0 : n)}
            className="rounded-md p-1 transition-transform hover:scale-110"
          >
            <Star className={cn("h-7 w-7 transition-colors", n <= value ? "fill-saffron-400 text-saffron-500" : "text-ink/20")} aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}

/** Simple accessible image viewer: closes on Escape or backdrop click. */
function Lightbox({ children, onClose, label }: { children: React.ReactNode; onClose: () => void; label: string }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label={label} className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 animate-rise" onClick={onClose}>
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Close enlarged image" className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 text-ink shadow hover:bg-white">
          <X className="h-5 w-5" />
        </button>
        {children}
        <p className="px-4 py-3 text-sm font-bold text-ink">{label}</p>
      </div>
    </div>
  );
}

function Completion({ onHome }: { onHome: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="relative max-w-lg text-center animate-rise">
        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-100/70">
          <CheckCircle2 className="h-16 w-16 text-emerald-500 animate-pop" aria-hidden="true" />
        </div>
        <h1 className="mt-8 font-display text-3xl font-bold text-ink sm:text-4xl">Thank you for your evaluation</h1>
        <p className="mt-3 text-base leading-relaxed text-ink-soft">
          Your feedback helps identify which AI-generated images are more useful and culturally relevant for Indian contexts.
        </p>
        <Button size="lg" className="mt-8" onClick={onHome}>Return Home</Button>
      </div>
    </main>
  );
}
