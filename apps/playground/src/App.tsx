import { lazy, Suspense, type ComponentType } from "react";
import { useEffect } from "react";
import * as stylex from "@stylexjs/stylex";
import { ShellWrapper } from "@repo/ui/components/ShellWrapper";
import { useTheme, setTheme, usePageName, setPageName } from "./stores/appStore";
import { Button } from "@repo/ui/components/Button";
import { ControlPanel } from "@repo/ui/components/ControlPanel";
import { space, zIndex } from "@repo/ui/tokens/layout.stylex";
import { ExperimentShell } from "@repo/ui/components/ExperimentShell";
import { Stage } from "@repo/ui/components/Stage";
import { ControlSection } from "@repo/ui/components/ControlSection";
import { Segmented } from "@repo/ui/components/Segmented";
import type { PageName } from "./stores/appStore";
import { Select } from "@repo/ui/components/Select";

export const EXPERIMENTS: Record<
  PageName,
  {
    label: string;
    Page: ComponentType;
  }
> = {
  menu: {
    label: "Menu",
    Page: MenuPage,
  },
  "art-canvas": {
    label: "Art Canvas",
    Page: lazy(() => import("@repo/art-canvas/App").then((m) => ({ default: m.App }))),
  },
  "mosaic-maker": {
    label: "Mosaic Maker",
    Page: lazy(() => import("@repo/mosaic-maker/App").then((m) => ({ default: m.App }))),
  },
  "mol-demo": {
    label: "Mol Demo",
    Page: lazy(() => import("@repo/mol-demo/App").then((m) => ({ default: m.App }))),
  },
};

const PAGE_OPTIONS = Object.entries(EXPERIMENTS).map(([value, { label }]) => ({
  value: value as PageName,
  label,
}));

const styles = stylex.create({
  returnWrap: {
    position: "fixed",
    bottom: space["3"],
    right: space["3"],
    zIndex: zIndex.overlay,
  },
});

function LoadingFallback() {
  return (
    <ShellWrapper>
      <Stage label="loading">
        <p>Loading…</p>
      </Stage>
    </ShellWrapper>
  );
}

function MenuPage() {
  const theme = useTheme();
  const pageName = usePageName();

  return (
    <ShellWrapper>
      <ExperimentShell
        panel={
          <ControlPanel title="Controls">
            <ControlSection title="Theme">
              <Segmented<"light" | "dark" | "system">
                options={["light", "dark", "system"]}
                value={theme}
                onValueChange={setTheme}
              />
            </ControlSection>
            <ControlSection title="Navigation">
              <Select<PageName>
                value={pageName}
                onValueChange={setPageName}
                options={PAGE_OPTIONS}
              />
            </ControlSection>
          </ControlPanel>
        }
      >
        <Stage label="playground">
          <h1>playground</h1>
        </Stage>
      </ExperimentShell>
    </ShellWrapper>
  );
}

function App() {
  const theme = useTheme();
  const pageName = usePageName();
  const { Page } = EXPERIMENTS[pageName];

  useEffect(() => {
    document.documentElement.style.colorScheme = theme === "system" ? "light dark" : theme;
  }, [theme]);

  return (
    <>
      {pageName !== "menu" && (
        <div {...stylex.props(styles.returnWrap)}>
          <Button onClick={() => setPageName("menu")}>← Menu</Button>
        </div>
      )}
      <Suspense fallback={<LoadingFallback />}>
        <Page />
      </Suspense>
    </>
  );
}

export default App;
