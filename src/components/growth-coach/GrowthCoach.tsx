"use client";

import { track } from "@/lib/growth-coach/analytics";
import { suggestedPrompts } from "@/lib/growth-coach/config";
import { getInitialState, respond, respondToLeadSubmission } from "@/lib/growth-coach/engine";
import { cn } from "@/lib/utils";
import type { CoachMessage, CoachState, QuickReplyAction } from "@/types";
import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { GrowthCoachButton } from "./GrowthCoachButton";
import { GrowthCoachErrorBoundary } from "./GrowthCoachErrorBoundary";
import { GrowthCoachLeadForm } from "./GrowthCoachLeadForm";
import { GrowthCoachPanel } from "./GrowthCoachPanel";
import { GrowthCoachReportView } from "./GrowthCoachReportView";
import { GrowthScoreResultsView } from "./GrowthScoreResultsView";

function makeUserMessage(content: string): CoachMessage {
  return { id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, role: "user", content };
}

/**
 * Mount point for the Next Level Growth Coach. Renders nothing when
 * NEXT_PUBLIC_CHAT_ENABLED is not "true" — same "ship the architecture,
 * hide the UI until ready" switch the previous chat widget used.
 *
 * Phase 2 seam: `respond()` (src/lib/growth-coach/engine.ts) is the only
 * place that needs to change to call a real AI provider through
 * src/app/api/chat/route.ts instead of returning mock content.
 */
export function GrowthCoach() {
  const enabled = process.env.NEXT_PUBLIC_CHAT_ENABLED === "true";
  const prefersReducedMotion = useReducedMotion();

  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [coachState, setCoachState] = useState<CoachState>(() => getInitialState());
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const [reportViewOpen, setReportViewOpen] = useState(false);
  const [leadFormOpen, setLeadFormOpen] = useState(false);
  const [reportSaved, setReportSaved] = useState(false);
  const [scoreResultsOpen, setScoreResultsOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasOpenedRef = useRef(false);
  // Whatever had focus right before the launcher was clicked (normally the
  // launcher button itself) — restored on close, per the dialog a11y
  // pattern ("focus returns to the trigger that opened it").
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    []
  );

  if (!enabled) return null;

  function dispatch(userText: string, promptId?: string) {
    if (sending) return;

    if (promptId === "analyze") track("assessment_started");
    if (promptId === "report-yes") track("report_accepted");
    if (promptId === "report-not-now") track("report_declined");
    if (promptId === "consult-yes") track("consultation_accepted");
    if (promptId === "consult-no") track("consultation_declined");
    if (promptId === "growth-score-quick") track("quick_check_started");
    if (promptId === "growth-score-full" || promptId === "start-full-assessment") track("full_assessment_started");
    if (promptId?.startsWith("score:")) track("assessment_question_answered");
    if (promptId === "path-start" || promptId === "path-grow") track("business_path_selected", { path: promptId });
    if (promptId === "depth-quick" || promptId === "depth-deep" || promptId === "depth-guide") track("response_depth_selected", { depth: promptId });
    if (promptId === "ninety-day-yes") track("ninety_day_plan_requested");
    if (promptId === "ninety-day-no") track("ninety_day_plan_declined");

    if (userText.trim()) {
      setMessages((prev) => [...prev, makeUserMessage(userText.trim())]);
    }
    setInputValue("");
    setSending(true);

    const delay = prefersReducedMotion ? 150 : 650 + Math.random() * 650;
    timeoutRef.current = setTimeout(() => {
      try {
        const { state: nextState, message } = respond(coachState, userText, promptId);
        setCoachState(nextState);
        setMessages((prev) => [...prev, message]);

        if (message.report?.title === "Business Assessment") track("assessment_completed");
        if (message.quickReplies?.some((q) => q.action === "report-yes")) track("report_offered");
        if (message.quickReplies?.some((q) => q.action === "consult-yes")) track("consultation_offered");
        if (message.businessReport) {
          track("report_generated");
          track("service_recommendation_shown", { count: message.businessReport.recommendedServices.length });
          track("plan_recommendation_shown", { plan: message.businessReport.recommendedPlan.planId });
          setReportSaved(false);
          setReportViewOpen(true);
        }
        if (message.growthScoreResult) {
          track("growth_score_generated", { mode: message.growthScoreResult.mode, confidence: message.growthScoreResult.overallConfidenceLabel });
          if (message.growthScoreResult.overallConfidenceLabel === "insufficient") track("growth_score_low_confidence");
          setScoreResultsOpen(true);
        }
      } catch {
        track("api_error");
        setMessages((prev) => [
          ...prev,
          { id: `coach-error-${Date.now()}`, role: "assistant", content: "That didn't come through cleanly. Let's try that again." },
        ]);
      } finally {
        setSending(false);
      }
    }, delay);
  }

  function handleSelectPrompt(id: string) {
    const prompt = suggestedPrompts.find((item) => item.id === id);
    track("prompt_selected", { promptId: id });
    dispatch(prompt?.label ?? "", id);
  }

  function handleQuickReply(action: QuickReplyAction, label: string) {
    dispatch(label, action);
  }

  function handleScoreAnswer(promptId: string, label: string) {
    dispatch(label, promptId);
  }

  function handleReset() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setMessages([]);
    setCoachState(getInitialState());
    setInputValue("");
    setSending(false);
    setReportViewOpen(false);
    setLeadFormOpen(false);
    setReportSaved(false);
    setScoreResultsOpen(false);
    track("conversation_reset");
  }

  function handleClose() {
    setOpen(false);
    setMinimized(false);
    setExpanded(false);
    // Give the DOM a tick to actually remove the panel before moving
    // focus back, otherwise some browsers ignore the .focus() call.
    requestAnimationFrame(() => previouslyFocusedRef.current?.focus());
  }

  function handleOpen() {
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    if (!hasOpenedRef.current) {
      hasOpenedRef.current = true;
      track("coach_opened");
    }
    setOpen(true);
  }

  function handleToggleMinimize() {
    setMinimized((value) => !value);
    setExpanded(false); // minimized and expanded are mutually exclusive
  }

  function handleExpand() {
    setExpanded(true);
    setMinimized(false);
    track("growth_coach_expanded");
  }

  function handleRestore() {
    setExpanded(false);
    track("growth_coach_restored");
  }

  function handleRequestSave() {
    setReportViewOpen(false);
    setLeadFormOpen(true);
    track("lead_form_opened");
  }

  function handleLeadSubmitted(result: { planName: string; consentToContact: boolean }) {
    track("lead_form_completed");
    track(result.consentToContact ? "contact_consent_accepted" : "contact_consent_declined");
    setLeadFormOpen(false);
    setReportSaved(true);
    const { state: nextState, message } = respondToLeadSubmission(coachState, result.planName, result.consentToContact);
    setCoachState(nextState);
    setMessages((prev) => [...prev, message]);
  }

  return (
    <div
      className={cn(
        "fixed z-50",
        expanded ? "inset-0" : "bottom-6",
        !expanded && (open ? "growth-coach-panel-anchor" : "right-6")
      )}
    >
      {open ? (
        <GrowthCoachErrorBoundary onReset={handleReset}>
          <GrowthCoachPanel
            messages={messages}
            sending={sending}
            minimized={minimized}
            expanded={expanded}
            inputValue={inputValue}
            onInputChange={setInputValue}
            onSend={() => dispatch(inputValue)}
            onReset={handleReset}
            onClose={handleClose}
            onToggleMinimize={handleToggleMinimize}
            onExpand={handleExpand}
            onRestore={handleRestore}
            onSelectPrompt={handleSelectPrompt}
            onQuickReply={handleQuickReply}
            onScoreAnswer={handleScoreAnswer}
            activeScoreQuestionId={coachState.growthAssessment?.currentQuestionId ?? null}
          />
        </GrowthCoachErrorBoundary>
      ) : (
        <GrowthCoachButton onClick={handleOpen} />
      )}

      {scoreResultsOpen && coachState.lastGrowthScore ? (
        <GrowthScoreResultsView
          result={coachState.lastGrowthScore}
          onClose={() => setScoreResultsOpen(false)}
          onTakeFullAssessment={
            coachState.lastGrowthScore.mode === "quick"
              ? () => {
                  setScoreResultsOpen(false);
                  dispatch("Take the Full Assessment", "start-full-assessment");
                }
              : undefined
          }
          onViewFullReport={
            coachState.lastGrowthScore.mode === "full" && coachState.businessReport
              ? () => {
                  setScoreResultsOpen(false);
                  setReportViewOpen(true);
                }
              : undefined
          }
        />
      ) : null}

      {reportViewOpen && coachState.businessReport ? (
        <GrowthCoachReportView
          report={coachState.businessReport}
          onClose={() => setReportViewOpen(false)}
          onRequestSave={handleRequestSave}
          alreadySaved={reportSaved}
        />
      ) : null}

      {leadFormOpen && coachState.businessReport ? (
        <GrowthCoachLeadForm
          report={coachState.businessReport}
          context={coachState.context}
          sessionId={sessionId}
          messages={messages}
          businessPath={coachState.businessPath}
          responseDepth={coachState.responseDepth}
          onCancel={() => {
            setLeadFormOpen(false);
            setReportViewOpen(true);
          }}
          onSubmitted={handleLeadSubmitted}
        />
      ) : null}
    </div>
  );
}
