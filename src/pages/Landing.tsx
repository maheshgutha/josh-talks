import { useState } from "react";
import { ArrowRight, CheckCircle2, Eye, LayoutDashboard, Menu, ShieldCheck, X } from "lucide-react";
import type { Page } from "@/App";
import { Logo } from "@/components/Logo";
import { MockImage } from "@/components/MockImage";
import { Rangoli } from "@/components/Rangoli";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { howItWorks, models, trustMetrics, whyItMatters } from "@/data";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "#about", label: "About" },
  { href: "#methodology", label: "Methodology" },
  { href: "#models", label: "Models" },
];

export function Landing({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-ink/5 bg-canvas/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Badge variant="research" className="hidden sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-research-500" aria-hidden="true" />
              Human Preference Research
            </Badge>
            <button
              type="button"
              className="rounded-lg p-2 text-ink-soft hover:bg-ink/5 md:hidden"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav aria-label="Mobile" className="border-t border-ink/5 bg-canvas px-4 py-2 md:hidden">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-3 text-sm font-medium text-ink-soft hover:bg-ink/5">
                {l.label}
              </a>
            ))}
          </nav>
        )}
      </header>

      <main>
        {/* Hero */}
        <section id="about" className="relative overflow-hidden scroll-mt-16">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-saffron-200/50 blur-3xl" />
            <div className="absolute -right-24 top-10 h-96 w-96 rounded-full bg-research-200/50 blur-3xl" />
            <Rangoli className="absolute -right-40 -top-24 h-[620px] w-[620px] text-research-600/[0.10]" />
            <Rangoli className="absolute -bottom-52 -left-44 h-[480px] w-[480px] text-saffron-600/[0.12]" />
          </div>

          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:pb-24 lg:pt-20">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-saffron-200 bg-saffron-50 px-3.5 py-1.5 text-xs font-semibold text-saffron-700 animate-rise">
                <span className="h-1.5 w-1.5 rounded-full bg-saffron-500" aria-hidden="true" />
                India-focused AI image evaluation
              </span>
              <h1 className="mt-5 font-display text-4xl font-bold leading-[1.08] tracking-tight text-ink animate-rise sm:text-5xl lg:text-6xl">
                Which AI model creates images{" "}
                <span className="bg-gradient-to-r from-saffron-500 via-rose-500 to-research-600 bg-clip-text text-transparent">India actually prefers?</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft animate-rise sm:text-lg">
                A human evaluation platform that compares AI-generated visuals for real Indian use cases — measuring cultural relevance, prompt adherence, visual quality, and practical usefulness.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <ActionCard
                  icon={Eye}
                  title="Start Evaluation"
                  subtitle="Compare anonymous image pairs and share your preference."
                  onClick={() => onNavigate("evaluate")}
                  primary
                />
                <ActionCard
                  icon={LayoutDashboard}
                  title="View Research Dashboard"
                  subtitle="Explore model performance, insights, and leaderboard results."
                  onClick={() => onNavigate("dashboard")}
                />
              </div>
            </div>

            <HeroVisual />
          </div>
        </section>

        {/* Trust row */}
        <section aria-label="Study at a glance" className="mx-auto max-w-6xl px-4 sm:px-6">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-ink/10 bg-ink/10 shadow-soft lg:grid-cols-4">
            {trustMetrics.map((m) => (
              <div key={m.label} className="bg-white p-5 text-center sm:p-6">
                <dt className="sr-only">{m.label}</dt>
                <dd className="font-display text-3xl font-bold text-ink">{m.value}</dd>
                <p className="mt-1 text-sm text-ink-soft" aria-hidden="true">{m.label}</p>
              </div>
            ))}
          </dl>
        </section>

        {/* How it works */}
        <section id="methodology" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
          <SectionHeading eyebrow="Methodology" title="How it works" text="Four simple steps from a real-world question to clear evidence." />
          <ol className="relative mt-10 grid gap-6 md:grid-cols-4">
            <div className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-saffron-300 via-research-300 to-emerald-300 md:block" aria-hidden="true" />
            {howItWorks.map((s, i) => (
              <li key={s.title} className="relative">
                <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-4 border-canvas bg-gradient-to-br from-saffron-500 to-research-600 text-lg font-bold text-white shadow-soft">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-base font-bold text-ink">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Models */}
        <section id="models" className="scroll-mt-16 bg-white/60 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHeading eyebrow="Models" title="Three models, one fair comparison" text="Each model receives exactly the same prompt and is judged on what it produces." />
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {models.map((m) => (
                <Card key={m.id} className="group p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                  <span className={cn("flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-soft transition-transform group-hover:scale-105", m.gradient)}>
                    <m.icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-ink">{m.name}</h3>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-ink-mute">{m.vendor}</p>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">{m.blurb}</p>
                </Card>
              ))}
            </div>
            <p className="mt-6 flex items-center justify-center gap-2 text-center text-sm font-medium text-ink-soft">
              <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              Models are anonymized during evaluation to reduce brand bias.
            </p>
          </div>
        </section>

        {/* Why it matters */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <SectionHeading eyebrow="Why it matters" title="Better images start with better questions" />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {whyItMatters.map((w, i) => (
              <Card key={w.title} className="p-6">
                <span className={cn("text-sm font-bold", ["text-saffron-600", "text-research-600", "text-emerald-600"][i])}>0{i + 1}</span>
                <h3 className="mt-2 font-display text-xl font-bold text-ink">{w.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{w.text}</p>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-ink/10 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <Logo />
            <p className="mt-2 text-sm text-ink-soft">A product concept for human-centered AI evaluation</p>
          </div>
          <p className="max-w-sm text-xs text-ink-mute md:text-right">Prototype — results are directional findings from a small group of evaluators.</p>
        </div>
      </footer>
    </div>
  );
}

function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-saffron-600">{eyebrow}</p>
      <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h2>
      {text && <p className="mt-3 text-base text-ink-soft">{text}</p>}
    </div>
  );
}

function ActionCard({
  icon: Icon,
  title,
  subtitle,
  onClick,
  primary,
}: {
  icon: typeof Eye;
  title: string;
  subtitle: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex flex-col items-start gap-3 rounded-2xl p-5 text-left transition-all duration-300 hover:-translate-y-1",
        primary
          ? "bg-gradient-to-br from-research-600 to-research-800 text-white shadow-lift hover:shadow-[0_24px_48px_-12px_rgba(79,70,229,.45)]"
          : "border border-ink/10 bg-white text-ink shadow-soft hover:border-saffron-300 hover:shadow-lg",
      )}
    >
      <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", primary ? "bg-white/15" : "bg-saffron-50 text-saffron-600")}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="flex w-full items-center justify-between text-lg font-bold">
        {title}
        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
      </span>
      <span className={cn("text-sm leading-relaxed", primary ? "text-white/80" : "text-ink-soft")}>{subtitle}</span>
    </button>
  );
}

/** Three overlapping, anonymously labelled image cards. */
function HeroVisual() {
  const cards = [
    { label: "Image A", product: "diya" as const, palette: "warm" as const, dot: "from-indigo-500 to-violet-500", pos: "left-0 top-0 -rotate-3 z-20" },
    { label: "Image B", product: "mithai" as const, palette: "royal" as const, dot: "from-orange-400 to-amber-400", pos: "right-0 top-12 rotate-3 z-30" },
    { label: "Image C", product: "rangoli" as const, palette: "modern" as const, dot: "from-cyan-400 to-teal-400", pos: "left-[21%] bottom-0 rotate-1 z-10" },
  ];
  return (
    <div className="relative mx-auto h-[380px] w-full max-w-md sm:h-[440px]" aria-label="Three anonymous AI image cards: Image A, Image B and Image C" role="group">
      <div className="absolute inset-6 rounded-[2rem] bg-gradient-to-br from-saffron-100 to-research-100 opacity-70" aria-hidden="true" />
      {cards.map((c, i) => (
        <div
          key={c.label}
          className={cn("absolute w-[58%] overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lift animate-floaty", c.pos)}
          style={{ animationDelay: `${i * 0.8}s` }}
        >
          <MockImage product={c.product} palette={c.palette} className="aspect-[4/3] w-full" label={`${c.label} preview`} />
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm font-bold text-ink">{c.label}</span>
            <span className={cn("h-3.5 w-3.5 rounded-full bg-gradient-to-br", c.dot)} aria-hidden="true" />
          </div>
        </div>
      ))}
      <CheckCircle2 className="absolute -right-1 bottom-10 z-40 h-10 w-10 rounded-full bg-white p-1 text-emerald-500 shadow-soft" aria-hidden="true" />
    </div>
  );
}
