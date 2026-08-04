import { describe, expect, it } from "vitest";
import { getInitialState, isOpenConversationTurn, respond } from "@/lib/growth-coach/engine";

/**
 * isOpenConversationTurn() is the safety boundary between the real-AI path
 * and the deterministic scripted engine — it decides whether a turn is
 * genuinely open-ended free text (safe to hand to Claude) or a structured
 * step (Growth Score questions, the assessment/growth-plan/website-review
 * flows, any prompt-card/quick-reply) that MUST stay deterministic. These
 * tests exist specifically to catch drift between this function and
 * respond()'s actual internal routing — if they disagree, either a
 * structured flow could leak into the AI (wasting money and risking an
 * inconsistent reply) or a real open conversation could get stuck on the
 * scripted engine unnecessarily.
 */
describe("isOpenConversationTurn", () => {
  it("is true for plain free text with no active flow/topic/assessment", () => {
    const state = getInitialState();
    expect(isOpenConversationTurn(state, "I run a landscaping company and I'm not sure what to focus on.")).toBe(true);
  });

  it("is false for blank/whitespace-only input", () => {
    const state = getInitialState();
    expect(isOpenConversationTurn(state, "")).toBe(false);
    expect(isOpenConversationTurn(state, "   ")).toBe(false);
  });

  it("is false whenever a promptId is supplied and matches a known prompt handler", () => {
    const state = getInitialState();
    for (const promptId of ["analyze", "growth-plan", "website-review", "growth-score-quick", "report-yes", "consult-yes", "path-start", "depth-quick"]) {
      expect(isOpenConversationTurn(state, "anything", promptId)).toBe(false);
    }
  });

  it("is false for a Growth Score question answer (score: prefixed promptId)", () => {
    const state = getInitialState();
    expect(isOpenConversationTurn(state, "Crystal clear", "score:foundation-offer-clarity:crystal-clear")).toBe(false);
  });

  it("is false while a growth assessment is in progress, even with a plain promptId-less message", () => {
    let state = getInitialState();
    ({ state } = respond(state, "", "growth-score-quick"));
    expect(state.growthAssessment).not.toBeNull();
    expect(isOpenConversationTurn(state, "I don't know")).toBe(false);
  });

  it("is false while inside a scripted flow (e.g. the assessment step machine)", () => {
    let state = getInitialState();
    ({ state } = respond(state, "", "analyze"));
    expect(state.flow).toBe("assessment");
    expect(isOpenConversationTurn(state, "I run a bakery in Austin.")).toBe(false);
  });

  it("is false while a topic thread is active", () => {
    let state = getInitialState();
    ({ state } = respond(state, "", "leads"));
    expect(state.topic).toBe("leads");
    expect(isOpenConversationTurn(state, "About 10 a month.")).toBe(false);
  });

  it("is true again once a scripted flow completes and returns to open state", () => {
    let state = getInitialState();
    ({ state } = respond(state, "", "depth-quick")); // quick mode short-circuits the assessment after one answer
    ({ state } = respond(state, "", "analyze"));
    ({ state } = respond(state, "I run a landscaping company in Denver."));
    expect(state.flow).toBeNull();
    expect(isOpenConversationTurn(state, "What else should I think about?")).toBe(true);
  });

  it("an unrecognized promptId that respond() would still route to routeFreeText is also treated as open conversation, matching respond()'s actual behavior", () => {
    // respond() falls through to routeFreeText for any promptId that
    // doesn't start with "score:" and isn't in PROMPT_HANDLERS — verify
    // isOpenConversationTurn agrees, so the two can never disagree about
    // routing.
    const state = getInitialState();
    const promptId = "not-a-real-prompt-id";
    expect(isOpenConversationTurn(state, "hello", promptId)).toBe(true);
  });
});
