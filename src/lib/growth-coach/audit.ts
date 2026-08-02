import type { AdminRole, AuditAction, AuditEvent } from "@/types";

/**
 * DEVELOPMENT-ONLY in-memory audit log. Same globalThis-singleton pattern
 * as adapters/local-mock.ts (Next.js compiles route handlers and Server
 * Components as separate module graphs in dev — a plain module-level
 * array would silently produce two disconnected logs). Resets on server
 * restart. Never write full PII into `detail` — a lead id is enough to
 * cross-reference the lead record itself.
 */
type AuditStore = { events: AuditEvent[] };
const globalForAudit = globalThis as unknown as { __growthCoachAuditStore?: AuditStore };
const auditStore: AuditStore = globalForAudit.__growthCoachAuditStore ?? { events: [] };
globalForAudit.__growthCoachAuditStore = auditStore;

let idCounter = 0;
function nextAuditId() {
  idCounter += 1;
  return `audit-${Date.now()}-${idCounter}`;
}

const MAX_EVENTS = 500;

export function recordAuditEvent(action: AuditAction, actorRole: AdminRole | "unknown", opts: { leadId?: string; detail?: string } = {}): AuditEvent {
  const event: AuditEvent = { id: nextAuditId(), action, actorRole, leadId: opts.leadId, detail: opts.detail, timestamp: Date.now() };
  auditStore.events.push(event);
  if (auditStore.events.length > MAX_EVENTS) auditStore.events.shift();
  return event;
}

export function listAuditEvents(): AuditEvent[] {
  return [...auditStore.events].sort((a, b) => b.timestamp - a.timestamp);
}
