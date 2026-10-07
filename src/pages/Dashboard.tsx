import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  AlertTriangle, ArrowLeft, BarChart3, CheckCircle2, Download, FileText, Home, Info, MessageSquareQuote, RefreshCw,
  Sparkles, Star, ThumbsDown, ThumbsUp, Trash2, Trophy, Users, X,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { PromptImage } from "@/components/PromptImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  consentStatement, dashboardSections, evalPrompts, methodology, modelById, modelSettings, models, ratingDimensions, roster,
  USE_REAL_IMAGES, type Participant, type Review,
} from "@/data";
import {
  buildInsights, buildKpis, buildThemes, computeModelStats, dimensionRows, leaderboard as buildLeaderboard, preferenceSplit,
  promptRows, round1, winnerOf, type Insight, type Theme,
} from "@/lib/analytics";
import { clearAll, loadParticipants, loadReviews } from "@/lib/api";
import { cn } from "@/lib/utils";

const norm = (e: string) => e.trim().toLowerCase();

export function Dashboard({ onBack }: { onBack: () => void }) {
  const [active, setActive] = useState<string>("overview");
  const [toast, setToast] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [registered, setRegistered] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState("");

  // Everything below is calculated from what is stored in the database.
  const refresh = useCallback(async () => {
    try {
      const [r, p] = await Promise.all([loadReviews(), loadParticipants()]);
      setReviews(r);
      setRegistered(p);
      setDataError("");
    } catch (err) {
      setDataError(err instanceof Error ? err.message : "Could not load responses.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const stats = useMemo(() => computeModelStats(reviews), [reviews]);
  const board = useMemo(() => buildLeaderboard(stats), [stats]);
  const dims = useMemo(() => dimensionRows(stats), [stats]);
  const byPrompt = useMemo(() => promptRows(reviews), [reviews]);
  const split = useMemo(() => preferenceSplit(reviews), [reviews]);
  const insights = useMemo(() => buildInsights(stats), [stats]);
  const themes = useMemo(() => buildThemes(reviews), [reviews]);
  const kpis = useMemo(() => buildKpis(reviews, registered), [reviews, registered]);
  const consenting = registered.filter((p) => p.consent).length;
  const hasVotes = reviews.length > 0;

  // Highlight the nav item for whichever section is on screen
  useEffect(() => {
    const els = dashboardSections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(false), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const jump = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen pb-16">
      {/* Top navigation */}
      <header className="sticky top-0 z-30 border-b border-ink/5 bg-canvas/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo />
          <nav aria-label="Dashboard sections" className="hidden items-center gap-1 lg:flex">
            {dashboardSections.map((s) => (
              <NavPill key={s.id} active={active === s.id} onClick={() => jump(s.id)}>{s.label}</NavPill>
            ))}
          </nav>
          <Button variant="outline" size="sm" onClick={onBack}>
            <Home className="h-4 w-4" aria-hidden="true" /> Back to Home
          </Button>
        </div>
        {/* Scrollable tabs for smaller screens */}
        <nav aria-label="Dashboard sections" className="flex gap-1 overflow-x-auto border-t border-ink/5 px-4 py-2 lg:hidden">
          {dashboardSections.map((s) => (
            <NavPill key={s.id} active={active === s.id} onClick={() => jump(s.id)}>{s.label}</NavPill>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl space-y-16 px-4 pt-8 sm:px-6">
        {dataError && (
          <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />{dataError}</span>
            <Button variant="outline" size="sm" onClick={refresh}>Try again</Button>
          </div>
        )}

        {/* Overview */}
        <section id="overview" className="scroll-mt-32" aria-labelledby="overview-title">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 id="overview-title" className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">Evaluation Overview</h1>
              <p className="mt-2 max-w-xl text-ink-soft">India-focused evaluation of AI-generated festive e-commerce creatives.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="research">Live Study • {consenting} participants • {evalPrompts.length} prompts</Badge>
              <Button variant="outline" size="sm" onClick={() => setToast(true)}>
                <Download className="h-4 w-4" aria-hidden="true" /> Export Report
              </Button>
            </div>
          </div>

          <div className={cn("mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4", loading && "animate-pulse")}>
            {kpis.map((k, i) => (
              <Card key={k.label} className="group relative overflow-hidden p-5 transition-all hover:-translate-y-0.5 hover:shadow-lift">
                <span className={cn("absolute inset-x-0 top-0 h-1", ["bg-research-500", "bg-saffron-500", "bg-emerald-500", "bg-rose-400"][i])} aria-hidden="true" />
                <p className="font-display text-4xl font-bold text-ink">{k.value}</p>
                <p className="mt-1 text-sm font-semibold text-ink">{k.label}</p>
                <p className="mt-0.5 text-xs text-ink-mute">{k.note}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Leaderboard, charts, insights */}
        <section id="leaderboard" className="scroll-mt-32 space-y-8" aria-labelledby="lb-title">
          <div>
            <h2 id="lb-title" className="font-display text-2xl font-bold text-ink sm:text-3xl">Model Leaderboard</h2>
            <p className="mt-1 text-ink-soft">Ranked by blind human-preference win rate.</p>
            <p className="mt-1 text-xs text-ink-mute">
              Win rate = share of a model’s comparisons that it won (a tie counts as half). Based on {reviews.length} vote{reviews.length === 1 ? "" : "s"} saved in the database.
            </p>
          </div>

          {!USE_REAL_IMAGES && (
            <p className="flex gap-2 rounded-xl border border-saffron-200 bg-saffron-50 p-3 text-sm text-saffron-700" role="note">
              <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              The images shown to evaluators are placeholder illustrations, not real model outputs, so these model results are not meaningful yet. Add the real generated images (see README) to make them valid.
            </p>
          )}

          <Leaderboard rows={board} />

          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="Performance by Evaluation Dimension" description="Average rating out of 5 for the images people chose.">
              {hasVotes ? (
                <ResponsiveContainer width="100%" height={340}>
                  <BarChart data={dims} layout="vertical" margin={{ left: 8, right: 16 }} barCategoryGap="22%">
                    <CartesianGrid horizontal={false} stroke="#e7e5e4" />
                    <XAxis type="number" domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fontSize: 12, fill: "#4a5068" }} />
                    <YAxis type="category" dataKey="dimension" width={118} tick={{ fontSize: 12, fill: "#4a5068" }} />
                    <Tooltip cursor={{ fill: "rgba(79,70,229,.06)" }} formatter={(v: number, n: string) => [`${v} / 5`, n]} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    {models.map((m) => (
                      <Bar key={m.id} dataKey={m.id} name={m.short} fill={m.color} radius={[0, 5, 5, 0]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart />
              )}
            </ChartCard>

            <ChartCard title="Win Rate by Prompt" description="Share of comparisons each model won, for every prompt.">
              {hasVotes ? (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={byPrompt} margin={{ left: -8, right: 16, top: 8 }}>
                      <CartesianGrid vertical={false} stroke="#e7e5e4" />
                      <XAxis dataKey="short" tick={{ fontSize: 11, fill: "#4a5068" }} interval={0} />
                      <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12, fill: "#4a5068" }} />
                      <Tooltip formatter={(v: number, n: string) => [`${v}%`, n]} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      {models.map((m) => (
                        <Line key={m.id} type="monotone" dataKey={m.id} name={m.short} stroke={m.color} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                  <ul className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1 text-xs text-ink-mute sm:grid-cols-2">
                    {evalPrompts.map((p) => <li key={p.id}>{p.id}: {p.shortName}</li>)}
                  </ul>
                </>
              ) : (
                <EmptyChart />
              )}
            </ChartCard>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
            <ChartCard title="Participant Preference Split" description={`How the ${reviews.length} votes were divided: wins for each model, plus ties.`}>
              {hasVotes ? (
                <>
                  <div className="relative">
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie data={split} dataKey="value" nameKey="name" innerRadius={72} outerRadius={108} paddingAngle={3} stroke="none">
                          {split.map((s) => <Cell key={s.name} fill={s.color} />)}
                        </Pie>
                        <Tooltip formatter={(v: number, n: string) => [`${v} votes (${Math.round((v / reviews.length) * 100)}%)`, n]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-display text-3xl font-bold text-ink">{reviews.length}</span>
                      <span className="text-xs text-ink-mute">votes</span>
                    </div>
                  </div>
                  <ul className="mt-3 space-y-1.5">
                    {split.map((s) => (
                      <li key={s.name} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-ink-soft"><span className="h-3 w-3 rounded-full" style={{ background: s.color }} aria-hidden="true" />{s.name}</span>
                        <span className="font-semibold text-ink">{Math.round((s.value / reviews.length) * 100)}%</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <EmptyChart />
              )}
            </ChartCard>

            <div className="grid content-start gap-4">
              {insights.length > 0 ? (
                insights.map((ins) => <InsightCard key={ins.title} {...ins} />)
              ) : (
                <Card className="flex flex-col items-center gap-2 p-8 text-center">
                  <Sparkles className="h-7 w-7 text-ink-mute" aria-hidden="true" />
                  <p className="font-bold text-ink">Key insights appear after the first votes</p>
                  <p className="text-sm text-ink-soft">They are written automatically from the saved results.</p>
                </Card>
              )}
            </div>
          </div>
        </section>

        <PromptAnalysisSection reviews={reviews} />

        {/* Feedback themes */}
        <section id="feedback" className="scroll-mt-32" aria-labelledby="fb-title">
          <h2 id="fb-title" className="font-display text-2xl font-bold text-ink sm:text-3xl">Feedback Themes</h2>
          <p className="mt-1 text-ink-soft">What participants said most often, grouped by theme.</p>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <ThemeColumn title="What worked" icon={ThumbsUp} tone="positive" themes={themes.positive} />
            <ThemeColumn title="What did not work" icon={ThumbsDown} tone="negative" themes={themes.negative} />
          </div>
          <p className="mt-3 text-xs text-ink-mute">
            Themes are found by matching common words in participants’ comments ({themes.commentCount} comment{themes.commentCount === 1 ? "" : "s"} so far). Read them all under All Reviews.
          </p>
        </section>

        {/* All reviews */}
        <ReviewsSection
          reviews={reviews}
          registered={registered}
          onRefresh={refresh}
          onClear={async () => {
            if (!window.confirm("Permanently delete ALL reviews and consent forms from the database? This cannot be undone.")) return;
            const key = window.prompt("Enter the admin key to confirm:");
            if (!key) return;
            try {
              await clearAll(key);
              await refresh();
            } catch (err) {
              window.alert(err instanceof Error ? err.message : "Could not delete.");
            }
          }}
        />

        {/* Setup */}
        <section id="setup" className="scroll-mt-32" aria-labelledby="setup-title">
          <h2 id="setup-title" className="font-display text-2xl font-bold text-ink sm:text-3xl">Evaluation Setup</h2>
          <p className="mt-1 text-ink-soft">How this study was designed.</p>
          <Card className="mt-6">
            <CardContent className="pt-6">
              <dl className="divide-y divide-ink/10">
                {[
                  ...methodology.slice(0, 2),
                  { label: "Participants", value: `${consenting} adults with consent` },
                  ...methodology.slice(2),
                ].map((m) => (
                  <div key={m.label} className="grid gap-1 py-3 sm:grid-cols-[200px_1fr] sm:gap-4">
                    <dt className="text-sm font-semibold text-ink-mute">{m.label}</dt>
                    <dd className="text-sm font-medium text-ink">{m.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-4 flex gap-3 rounded-xl border border-saffron-200 bg-saffron-50 p-4 text-sm text-saffron-700" role="note">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <p>Results are directional findings from a small sample and should not be interpreted as a universal model ranking.</p>
              </div>
            </CardContent>
          </Card>

          <ParticipantsCard registered={registered} reviews={reviews} />
        </section>
      </main>

      {toast && (
        <div role="status" className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-rise rounded-xl bg-ink px-4 py-3 text-sm font-medium text-white shadow-lift">
          Use “Download CSV” under All Reviews to export the data.
        </div>
      )}
    </div>
  );
}

/* ---------- Small pieces ---------- */

function NavPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      className={cn(
        "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
        active ? "bg-research-50 text-research-700" : "text-ink-soft hover:bg-ink/5 hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-[260px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-ink/15 bg-canvas/60 text-center">
      <BarChart3 className="h-7 w-7 text-ink-mute" aria-hidden="true" />
      <p className="text-sm font-semibold text-ink">No votes yet</p>
      <p className="max-w-xs text-xs text-ink-mute">This chart fills in automatically as participants submit their evaluations.</p>
    </div>
  );
}

function ChartCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

const score = (v: number | null) => (v === null ? "—" : `${v.toFixed(1)} / 5`);

function Leaderboard({ rows }: { rows: ReturnType<typeof buildLeaderboard> }) {
  return (
    <Card className="overflow-hidden">
      {/* Table for wide screens */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Model leaderboard ranked by win rate</caption>
          <thead className="bg-ink/[0.03] text-xs uppercase tracking-wider text-ink-mute">
            <tr>
              <th scope="col" className="px-6 py-3 font-semibold">Rank</th>
              <th scope="col" className="px-3 py-3 font-semibold">Model</th>
              <th scope="col" className="px-3 py-3 font-semibold">Win rate</th>
              <th scope="col" className="px-3 py-3 font-semibold">Cultural relevance</th>
              <th scope="col" className="px-3 py-3 font-semibold">Prompt adherence</th>
              <th scope="col" className="px-3 py-3 font-semibold">Product clarity</th>
              <th scope="col" className="px-6 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {rows.map((r) => {
              const m = modelById(r.modelId);
              return (
                <tr key={r.modelId} className="transition-colors hover:bg-research-50/40">
                  <td className="px-6 py-4">
                    <span className={cn("flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold", r.rank === 1 && r.winRate !== null ? "bg-amber-100 text-amber-700" : "bg-ink/5 text-ink-soft")}>
                      {r.rank === 1 && r.winRate !== null ? <Trophy className="h-4 w-4" aria-label="1" /> : r.rank}
                    </span>
                  </td>
                  <td className="px-3 py-4">
                    <span className="flex items-center gap-3 font-bold text-ink">
                      <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-white", m.gradient)}><m.icon className="h-4 w-4" aria-hidden="true" /></span>
                      <span>
                        {m.name}
                        <span className="block text-xs font-normal text-ink-mute">{r.comparisons} comparison{r.comparisons === 1 ? "" : "s"}</span>
                      </span>
                    </span>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-3">
                      <span className="w-10 font-bold text-ink">{r.winRate === null ? "—" : `${Math.round(r.winRate)}%`}</span>
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-ink/10" aria-hidden="true">
                        <div className="h-full rounded-full" style={{ width: `${r.winRate ?? 0}%`, background: m.color }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 font-medium text-ink-soft">{score(round1(r.ratings.culture))}</td>
                  <td className="px-3 py-4 font-medium text-ink-soft">{score(round1(r.ratings.adherence))}</td>
                  <td className="px-3 py-4 font-medium text-ink-soft">{score(round1(r.ratings.clarity))}</td>
                  <td className="px-6 py-4"><Badge variant={r.variant}>{r.badge}</Badge></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cards for small screens */}
      <ul className="divide-y divide-ink/10 md:hidden">
        {rows.map((r) => {
          const m = modelById(r.modelId);
          return (
            <li key={r.modelId} className="space-y-3 p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 font-bold text-ink">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink/5 text-xs">#{r.rank}</span>
                  {m.name}
                </span>
                <span className="text-xl font-bold text-ink">{r.winRate === null ? "—" : `${Math.round(r.winRate)}%`}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-ink/10" aria-hidden="true">
                <div className="h-full rounded-full" style={{ width: `${r.winRate ?? 0}%`, background: m.color }} />
              </div>
              <dl className="grid grid-cols-3 gap-2 text-xs">
                <div><dt className="text-ink-mute">Cultural</dt><dd className="font-semibold text-ink">{score(round1(r.ratings.culture))}</dd></div>
                <div><dt className="text-ink-mute">Adherence</dt><dd className="font-semibold text-ink">{score(round1(r.ratings.adherence))}</dd></div>
                <div><dt className="text-ink-mute">Clarity</dt><dd className="font-semibold text-ink">{score(round1(r.ratings.clarity))}</dd></div>
              </dl>
              <Badge variant={r.variant}>{r.badge}</Badge>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

const insightTones = {
  indigo: { wrap: "border-research-200 bg-gradient-to-br from-research-50 to-white", icon: "bg-research-600 text-white", Icon: Trophy },
  saffron: { wrap: "border-saffron-200 bg-gradient-to-br from-saffron-50 to-white", icon: "bg-saffron-500 text-white", Icon: Sparkles },
  red: { wrap: "border-red-200 bg-gradient-to-br from-red-50 to-white", icon: "bg-red-500 text-white", Icon: AlertTriangle },
} as const;

function InsightCard({ title, text, tone }: Insight) {
  const t = insightTones[tone];
  return (
    <div className={cn("flex gap-4 rounded-2xl border p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift", t.wrap)}>
      <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", t.icon)}><t.Icon className="h-5 w-5" aria-hidden="true" /></span>
      <div>
        <h3 className="font-bold text-ink">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">{text}</p>
      </div>
    </div>
  );
}

/* ---------- Prompt analysis ---------- */

function PromptAnalysisSection({ reviews }: { reviews: Review[] }) {
  const [promptId, setPromptId] = useState(evalPrompts[0].id);
  const [open, setOpen] = useState(false);
  const prompt = evalPrompts.find((p) => p.id === promptId)!;
  const promptReviews = useMemo(() => reviews.filter((r) => r.promptId === promptId), [reviews, promptId]);
  const stats = useMemo(() => computeModelStats(promptReviews), [promptReviews]);

  return (
    <section id="prompt-analysis" className="scroll-mt-32" aria-labelledby="pa-title">
      <h2 id="pa-title" className="font-display text-2xl font-bold text-ink sm:text-3xl">Prompt Analysis</h2>
      <p className="mt-1 text-ink-soft">See how each model handled one prompt. Model names are revealed here for researchers only.</p>

      <Card className="mt-6">
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-xl">{prompt.id} — {prompt.shortName}</CardTitle>
            <CardDescription>{promptReviews.length} vote{promptReviews.length === 1 ? "" : "s"} on this prompt</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="pa-select" className="sr-only">Choose a prompt</label>
            <select id="pa-select" value={promptId} onChange={(e) => setPromptId(e.target.value)} className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm">
              {evalPrompts.map((p) => <option key={p.id} value={p.id}>{p.id} — {p.shortName}</option>)}
            </select>
            <Button onClick={() => setOpen(true)}><FileText className="h-4 w-4" aria-hidden="true" /> View full prompt analysis</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-5 md:grid-cols-3">
            {stats.map((s) => {
              const m = modelById(s.modelId);
              return (
                <div key={s.modelId} className="overflow-hidden rounded-xl border border-ink/10 bg-canvas/60 transition-shadow hover:shadow-lift">
                  <PromptImage promptId={prompt.id} modelId={s.modelId} className="aspect-[4/3] w-full" label={`${m.name} output for ${prompt.shortName}`} />
                  <div className="space-y-3 p-4">
                    <p className="flex items-center gap-2 text-sm font-bold text-ink">
                      <span className="h-3 w-3 rounded-full" style={{ background: m.color }} aria-hidden="true" />{m.name}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="success">Win rate {s.winRate === null ? "—" : `${Math.round(s.winRate)}%`}</Badge>
                      <Badge variant="saffron">Culture {s.ratings.culture === null ? "—" : round1(s.ratings.culture)}</Badge>
                      <Badge variant="research">Adherence {s.ratings.adherence === null ? "—" : round1(s.ratings.adherence)}</Badge>
                    </div>
                    <p className="text-xs text-ink-mute">{s.comparisons} comparison{s.comparisons === 1 ? "" : "s"}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {open && <PromptModal promptId={promptId} reviews={promptReviews} onClose={() => setOpen(false)} />}
    </section>
  );
}

function PromptModal({ promptId, reviews, onClose }: { promptId: string; reviews: Review[]; onClose: () => void }) {
  const prompt = evalPrompts.find((p) => p.id === promptId)!;
  const comments = reviews.filter((r) => r.comment);
  const failures = buildThemes(reviews).negative;

  useEffect(() => {
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
    <div role="dialog" aria-modal="true" aria-labelledby="pm-title" className="fixed inset-0 z-50 flex items-end justify-center bg-ink/70 p-0 animate-rise sm:items-center sm:p-6" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 id="pm-title" className="font-display text-2xl font-bold text-ink">{prompt.id} — {prompt.shortName}</h3>
            <p className="text-sm text-ink-mute">Full prompt analysis • {reviews.length} vote{reviews.length === 1 ? "" : "s"}</p>
          </div>
          <button type="button" onClick={onClose} autoFocus aria-label="Close" className="rounded-full p-2 text-ink-soft hover:bg-ink/5"><X className="h-5 w-5" /></button>
        </div>

        <ModalBlock title="Exact prompt">
          <p className="rounded-xl border-l-4 border-saffron-400 bg-saffron-50/70 p-4 text-sm leading-relaxed text-ink">{prompt.prompt}</p>
        </ModalBlock>

        <ModalBlock title="Model settings">
          <dl className="grid gap-2 sm:grid-cols-2">
            {modelSettings.map((s) => (
              <div key={s.label} className="rounded-xl bg-ink/[0.03] p-3">
                <dt className="text-xs font-semibold text-ink-mute">{s.label}</dt>
                <dd className="text-sm font-medium text-ink">{s.value}</dd>
              </div>
            ))}
          </dl>
        </ModalBlock>

        <ModalBlock title="Participant comments">
          {comments.length ? (
            <ul className="space-y-2">
              {comments.map((c) => (
                <li key={c.id} className="flex gap-3 rounded-xl bg-research-50/60 p-3 text-sm">
                  <MessageSquareQuote className="mt-0.5 h-4 w-4 shrink-0 text-research-600" aria-hidden="true" />
                  <span><span className="text-ink">{c.comment}</span> <span className="text-ink-mute">— {c.participant}</span></span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-mute">No comments on this prompt yet.</p>
          )}
        </ModalBlock>

        <ModalBlock title="Detected failure patterns">
          {failures.length ? (
            <ul className="space-y-2">
              {failures.map((f) => (
                <li key={f.label} className="flex gap-3 rounded-xl bg-red-50 p-3 text-sm text-red-800">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{f.label} ({f.count})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-mute">No failure patterns detected in the comments so far.</p>
          )}
        </ModalBlock>

        <Button variant="outline" className="mt-6 w-full" onClick={onClose}><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to dashboard</Button>
      </div>
    </div>
  );
}

function ModalBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-mute">{title}</h4>
      {children}
    </div>
  );
}

function ThemeColumn({ title, icon: Icon, tone, themes }: { title: string; icon: typeof ThumbsUp; tone: "positive" | "negative"; themes: Theme[] }) {
  const positive = tone === "positive";
  return (
    <Card className="p-5 sm:p-6">
      <h3 className="flex items-center gap-2 text-base font-bold text-ink">
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", positive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        {title}
      </h3>
      {themes.length ? (
        <ul className="mt-4 space-y-3">
          {themes.map((t) => (
            <li key={t.label} className={cn("rounded-xl border p-4 transition-shadow hover:shadow-soft", positive ? "border-emerald-100 bg-emerald-50/50" : "border-red-100 bg-red-50/50")}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-bold text-ink">{t.label}</p>
                <Badge variant={positive ? "success" : "warning"}>{t.count} mention{t.count === 1 ? "" : "s"}</Badge>
              </div>
              <p className="mt-1.5 text-sm italic text-ink-soft">“{t.quote}”</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 rounded-xl border border-dashed border-ink/15 p-5 text-sm text-ink-mute">Themes show up here once participants leave comments.</p>
      )}
    </Card>
  );
}

/* ---------- Participants ---------- */

function ParticipantsCard({ registered, reviews }: { registered: Participant[]; reviews: Review[] }) {
  // The researcher's list, plus anyone who registered with an email that is not on it.
  const rows = [
    ...roster.map((r) => ({ key: r.id, name: r.name, email: r.email, age: r.age, reg: registered.find((p) => norm(p.email) === norm(r.email)), listed: true })),
    ...registered
      .filter((p) => !roster.some((r) => norm(r.email) === norm(p.email)))
      .map((p) => ({ key: p.email, name: p.name, email: p.email, age: p.age, reg: p as Participant | undefined, listed: false })),
  ];
  const given = rows.filter((r) => r.reg?.consent).length;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Users className="h-4 w-4 text-research-600" aria-hidden="true" />Participants &amp; consent</CardTitle>
        <CardDescription>{given} of {rows.length} participants have given consent through the form. Consent shows “Pending” until they do.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <caption className="sr-only">Participants and consent</caption>
            <thead className="text-xs uppercase tracking-wider text-ink-mute">
              <tr>
                <th scope="col" className="py-2 pr-3 font-semibold">Name</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Email</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Age</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Consent</th>
                <th scope="col" className="py-2 font-semibold">Reviews</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {rows.map((r) => (
                <tr key={r.key}>
                  <td className="py-2.5 pr-3 font-semibold text-ink">
                    {r.reg?.name ?? r.name}
                  </td>
                  <td className="py-2.5 pr-3 text-ink-soft">{r.email}</td>
                  <td className="py-2.5 pr-3 text-ink-soft">{r.reg?.age ?? r.age}</td>
                  <td className="py-2.5 pr-3">
                    {r.reg?.consent ? (
                      <Badge variant="success"><CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />Given</Badge>
                    ) : (
                      <Badge variant="neutral">Pending</Badge>
                    )}
                  </td>
                  <td className="py-2.5 text-ink-soft">{reviews.filter((v) => norm(v.email) === norm(r.email)).length} / {evalPrompts.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 rounded-xl bg-ink/[0.03] p-4 text-sm leading-relaxed text-ink-soft">
          <span className="font-semibold text-ink">Consent statement: </span>{consentStatement}
        </p>
      </CardContent>
    </Card>
  );
}

/* ---------- All reviews ---------- */

const modelName = (id: Review["modelA"]) => modelById(id)?.short ?? id;
const chosenLabel = (r: Review) => {
  const w = winnerOf(r);
  return w === "tie" ? "Called it a tie" : `Chose Image ${r.choice} · ${modelName(w)}`;
};
const avg = (r: Review) => {
  const v = Object.values(r.ratings).filter((n): n is number => typeof n === "number" && n > 0);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0;
};

function downloadCsv(rows: Review[], registered: Participant[]) {
  const q = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const head = ["Participant", "Email", "Age", "Consent", "Prompt", "Image A model", "Image B model", "Choice", "Chosen model", ...ratingDimensions.map((d) => d.label), "Comment", "Time"];
  const lines = rows.map((r) => {
    const person = registered.find((p) => norm(p.email) === norm(r.email));
    const w = winnerOf(r);
    return [
      r.participant, r.email, person?.age ?? "", person?.consent ? "Yes" : "", r.promptId, r.modelA, r.modelB, r.choice, w === "tie" ? "tie" : w,
      ...ratingDimensions.map((d) => r.ratings[d.key] ?? ""), r.comment, r.time,
    ].map(q).join(",");
  });
  const blob = new Blob([[head.map(q).join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "india-image-eval-reviews.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function ReviewsSection({ reviews, registered, onClear, onRefresh }: { reviews: Review[]; registered: Participant[]; onClear: () => void; onRefresh: () => void }) {
  const [prompt, setPrompt] = useState("all");
  const shown = [...reviews].reverse().filter((r) => prompt === "all" || r.promptId === prompt);
  const people = new Set(reviews.map((r) => norm(r.email))).size;

  return (
    <section id="reviews" className="scroll-mt-32" aria-labelledby="rv-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="rv-title" className="font-display text-2xl font-bold text-ink sm:text-3xl">All Reviews</h2>
          <p className="mt-1 text-ink-soft">
            {reviews.length === 0 ? "Real responses from participants appear here." : `${reviews.length} reviews from ${people} participant${people === 1 ? "" : "s"}.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" onClick={onRefresh}><RefreshCw className="h-4 w-4" aria-hidden="true" /> Refresh</Button>
          <Button variant="outline" size="sm" onClick={() => downloadCsv(shown, registered)} disabled={!shown.length}>
            <Download className="h-4 w-4" aria-hidden="true" /> Download CSV
          </Button>
          {(reviews.length > 0 || registered.length > 0) && (
            <Button variant="ghost" size="sm" onClick={onClear}><Trash2 className="h-4 w-4" aria-hidden="true" /> Clear all responses</Button>
          )}
        </div>
      </div>

      {reviews.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <label className="text-sm font-semibold text-ink-soft" htmlFor="rv-prompt">Prompt</label>
          <select id="rv-prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm">
            <option value="all">All prompts</option>
            {evalPrompts.map((p) => <option key={p.id} value={p.id}>{p.id} — {p.shortName}</option>)}
          </select>
          <span className="text-sm text-ink-mute" aria-live="polite">Showing {shown.length} of {reviews.length}</span>
        </div>
      )}

      {reviews.length === 0 ? (
        <Card className="mt-5 flex flex-col items-center gap-2 p-10 text-center">
          <MessageSquareQuote className="h-8 w-8 text-ink-mute" aria-hidden="true" />
          <p className="font-bold text-ink">No reviews yet</p>
          <p className="max-w-md text-sm text-ink-soft">When participants finish the evaluation, each rating and comment will show up here with their name.</p>
        </Card>
      ) : (
        <ul className="mt-5 grid gap-4 md:grid-cols-2">
          {shown.map((r) => {
            const pr = evalPrompts.find((p) => p.id === r.promptId);
            return (
              <li key={r.id}>
                <Card className="h-full p-5 transition-shadow hover:shadow-lift">
                  <p className="font-bold text-ink">{r.participant}</p>
                  <p className="text-xs text-ink-mute">{r.email}</p>
                  <p className="mt-2 text-xs font-semibold text-ink-soft">{r.promptId} — {pr?.shortName}</p>
                  {r.modelA && (
                    <p className="text-xs text-ink-mute">A: {modelName(r.modelA)} · B: {modelName(r.modelB)}</p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge variant="research">{r.modelA ? chosenLabel(r) : r.choice}</Badge>
                    {avg(r) > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink-soft">
                        <Star className="h-3.5 w-3.5 fill-saffron-400 text-saffron-500" aria-hidden="true" />{avg(r).toFixed(1)} avg
                      </span>
                    )}
                  </div>
                  {Object.keys(r.ratings).length > 0 && (
                    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      {ratingDimensions.map((d) => (
                        <div key={d.key} className="flex justify-between"><dt className="text-ink-mute">{d.label}</dt><dd className="font-semibold text-ink">{r.ratings[d.key] ? `${r.ratings[d.key]} / 5` : "—"}</dd></div>
                      ))}
                    </dl>
                  )}
                  <p className="mt-3 text-sm italic leading-relaxed text-ink-soft">{r.comment ? `“${r.comment}”` : "No comment left."}</p>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
