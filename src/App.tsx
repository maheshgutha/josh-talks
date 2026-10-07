import { useEffect, useState } from "react";
import { Landing } from "@/pages/Landing";
import { Evaluation } from "@/pages/Evaluation";
import { Dashboard } from "@/pages/Dashboard";

export type Page = "home" | "evaluate" | "dashboard";

/** Simple state-based navigation — no router needed for a three-screen prototype. */
export default function App() {
  const [page, setPage] = useState<Page>("home");

  // Always start a new screen at the top
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [page]);

  const go = (p: Page) => setPage(p);

  return (
    <>
      {page === "home" && <Landing onNavigate={go} />}
      {page === "evaluate" && <Evaluation onExit={() => go("home")} />}
      {page === "dashboard" && <Dashboard onBack={() => go("home")} />}
    </>
  );
}
