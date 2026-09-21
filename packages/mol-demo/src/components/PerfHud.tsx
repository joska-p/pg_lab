import { useEffect, useState } from "react";
import { isPerfEnabled, perfSnapshot, type PerfSnapshot } from "../lib/perf";

// Dev-only P0 baseline HUD (?perf=1). Polls the shared perf counters at
// 2 Hz — no per-frame React work, zero cost when the flag is absent.
export function PerfHud() {
  const [snap, setSnap] = useState<PerfSnapshot | null>(null);

  useEffect(() => {
    if (!isPerfEnabled()) return;
    const id = window.setInterval(() => setSnap(perfSnapshot()), 500);
    return () => window.clearInterval(id);
  }, []);

  if (!isPerfEnabled() || snap === null) return null;

  return (
    <div
      style={{
        position: "fixed",
        right: 8,
        bottom: 8,
        zIndex: 50,
        fontFamily: "monospace",
        fontSize: 12,
        lineHeight: 1.5,
        background: "rgba(0,0,0,0.75)",
        color: "#fff",
        padding: "8px 10px",
        borderRadius: 6,
        pointerEvents: "none",
        whiteSpace: "pre",
      }}
    >
      {`fps ${snap.fps.toFixed(0)} (loops ${snap.loops}) | render ${snap.renderMs.toFixed(2)}ms | pattern ${snap.patternMs.toFixed(2)}ms ${snap.patternPath}${snap.patternStale ? " idle" : ""}\nproj/norm/gl ${snap.patternSpans}ms\nmeshes ${snap.meshes} | mol ${snap.molBuffer} | pat ${snap.patBuffer}\n${snap.molecule}`}
    </div>
  );
}
