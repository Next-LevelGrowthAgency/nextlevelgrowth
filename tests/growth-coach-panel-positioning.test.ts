import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * This project doesn't have jsdom/React Testing Library configured (see
 * vitest.config.mts — environment: "node", tests/**\/*.test.ts only), and
 * Stage 1 of the Growth Coach sprint deliberately didn't add that
 * infrastructure (out of scope for a positioning/fullscreen change). These
 * are source-level regression guards for the specific numbers/formulas
 * that would silently break the panel if edited without re-deriving the
 * math — see the Stage 1 report for how the actual positioning/overflow
 * behavior was verified (independent arithmetic against the real CSS
 * formulas, plus inspecting the compiled stylesheet).
 */

function read(relativePath: string): string {
  return readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf-8");
}

describe("Growth Coach panel positioning", () => {
  const globalsCss = read("src/app/globals.css");
  const panelSource = read("src/components/growth-coach/GrowthCoachPanel.tsx");
  const coachSource = read("src/components/growth-coach/GrowthCoach.tsx");

  it("defines --growth-coach-desktop-right-offset as a real CSS custom property", () => {
    expect(globalsCss).toContain("--growth-coach-desktop-right-offset: 48px;");
  });

  it("48px default offset is within the requested 40-55px range", () => {
    const match = globalsCss.match(/--growth-coach-desktop-right-offset:\s*(\d+)px/);
    expect(match).not.toBeNull();
    const px = Number(match?.[1]);
    expect(px).toBeGreaterThanOrEqual(40);
    expect(px).toBeLessThanOrEqual(55);
  });

  it("the .growth-coach-panel-anchor utility adds the offset on top of the original 1.5rem gutter", () => {
    expect(globalsCss).toContain("right: calc(1.5rem + var(--growth-coach-desktop-right-offset));");
  });

  it("the wrapper only applies the shifted anchor class while the panel is open (never to the launcher)", () => {
    expect(coachSource).toContain('!expanded && (open ? "growth-coach-panel-anchor" : "right-6")');
  });

  it("REGRESSION: panel width formula reserves 6rem, not the original 3rem, to avoid left-edge overflow now that the right offset is larger than 1.5rem", () => {
    // Verified independently: at a 640px (sm breakpoint) viewport, the old
    // "100vw-3rem" formula combined with the new ~72px right offset put
    // the panel's left edge 24px off-screen. "100vw-6rem" keeps a ~24px
    // left margin at every width >= 640px. Do not revert this to 3rem
    // without re-deriving the math against whatever the offset is then.
    expect(panelSource).toContain("sm:w-[min(600px,calc(100vw-6rem))]");
    expect(panelSource).not.toContain("calc(100vw-3rem)");
  });

  it("expanded state fills the viewport at every breakpoint (not just sm and up)", () => {
    expect(panelSource).toContain("h-[100dvh] w-full rounded-none border-0");
  });

  it("expanded layout reserves safe-area insets so content isn't clipped by device chrome", () => {
    expect(panelSource).toContain("env(safe-area-inset-bottom)");
    expect(panelSource).toContain("env(safe-area-inset-top)");
  });

  it("Escape restores from fullscreen before it closes the panel", () => {
    const start = panelSource.indexOf('if (event.key !== "Escape")');
    const end = panelSource.indexOf("}, [expanded, onClose, onRestore]);");
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    const block = panelSource.slice(start, end);
    const restoreIndex = block.indexOf("onRestore();");
    const closeIndex = block.indexOf("onClose();");
    expect(restoreIndex).toBeGreaterThan(-1);
    expect(closeIndex).toBeGreaterThan(-1);
    expect(restoreIndex).toBeLessThan(closeIndex);
  });

  it("focus trap is wired into the panel", () => {
    expect(panelSource).toContain("useFocusTrap(panelRef, true)");
  });

  it("minimizing and expanding are mutually exclusive on the coach orchestrator", () => {
    expect(coachSource).toContain("setExpanded(false); // minimized and expanded are mutually exclusive");
  });

  it("closing restores focus to whatever opened the panel", () => {
    expect(coachSource).toContain("previouslyFocusedRef.current?.focus()");
  });
});
