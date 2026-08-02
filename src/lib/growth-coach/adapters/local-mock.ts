import type { LeadProfile } from "@/types";
import type { EmailAdapter, LeadAdapter, LeadInput, OutboundEmail } from "./types";

/**
 * DEVELOPMENT-ONLY MOCK ADAPTERS
 * ------------------------------------------------------------------
 * In-memory only. Data lives for the lifetime of the `next dev` process —
 * it resets on every server restart and is NOT shared across serverless
 * instances. This exists purely to demonstrate the complete local
 * experience (including the mock owner dashboard) without connecting a
 * real database. Do not deploy this to production; see Phase B
 * recommendations for a real persistence option.
 *
 * The store is attached to `globalThis` rather than a plain module-level
 * variable: Next.js compiles Route Handlers and Server Components as
 * separate module graphs in dev, so a plain `const store = new Map()`
 * here would silently produce two disconnected instances — a lead
 * created via /api/growth-coach/lead would never show up on the
 * dashboard page. `globalThis` is the standard workaround (the same
 * pattern commonly used for Prisma-client singletons in Next.js).
 */
type MockStore = { leads: Map<string, LeadProfile>; idCounter: number };
const globalForMockStore = globalThis as unknown as { __growthCoachMockStore?: MockStore };
const mockStore: MockStore = globalForMockStore.__growthCoachMockStore ?? { leads: new Map<string, LeadProfile>(), idCounter: 0 };
globalForMockStore.__growthCoachMockStore = mockStore;
const store = mockStore.leads;

function nextLeadId() {
  mockStore.idCounter += 1;
  return `lead-${Date.now()}-${mockStore.idCounter}`;
}

export const localLeadAdapter: LeadAdapter = {
  async createLead(input: LeadInput) {
    // Duplicate-submission guard: same email within the last 5 minutes
    // updates the existing record instead of creating a new one.
    if (input.email) {
      const existing = [...store.values()].find(
        (lead) => lead.email === input.email && Date.now() - lead.createdAt < 5 * 60_000
      );
      if (existing) {
        const updated: LeadProfile = { ...existing, ...input, updatedAt: Date.now() };
        store.set(existing.id, updated);
        return updated;
      }
    }
    const id = nextLeadId();
    const now = Date.now();
    const lead: LeadProfile = { ...input, id, createdAt: now, updatedAt: now };
    store.set(id, lead);
    return lead;
  },

  async updateLead(id, patch) {
    const existing = store.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...patch, updatedAt: Date.now() };
    store.set(id, updated);
    return updated;
  },

  async getLead(id) {
    return store.get(id) ?? null;
  },

  async listLeads() {
    return [...store.values()].sort((a, b) => b.createdAt - a.createdAt);
  },

  async recordConsent(id, consent, timestamp) {
    const existing = store.get(id);
    if (!existing) return null;
    const updated: LeadProfile = {
      ...existing,
      ...(consent.saveReport !== undefined && { consentToSaveReport: consent.saveReport, reportConsentTimestamp: timestamp }),
      ...(consent.contact !== undefined && { consentToContact: consent.contact, contactConsentTimestamp: timestamp }),
      ...(consent.marketing !== undefined && { consentToMarketing: consent.marketing, marketingConsentTimestamp: timestamp }),
      updatedAt: Date.now(),
    };
    store.set(id, updated);
    return updated;
  },

  async saveReport(id, reportSummary) {
    return localLeadAdapter.updateLead(id, { conversationSummary: reportSummary });
  },

  async saveConversationSummary(id, summary) {
    return localLeadAdapter.updateLead(id, { conversationSummary: summary });
  },

  async updateQualification(id, level) {
    return localLeadAdapter.updateLead(id, { leadQualificationLevel: level });
  },

  async updateFollowUpStatus(id, status) {
    return localLeadAdapter.updateLead(id, { followUpStatus: status });
  },

  async recordEmailSubscription(id, subscribed, timestamp) {
    return localLeadAdapter.updateLead(id, { consentToMarketing: subscribed, marketingConsentTimestamp: timestamp });
  },

  async recordSource(id, source, campaignSource) {
    return localLeadAdapter.updateLead(id, { source, campaignSource });
  },

  async requestDeletion(id) {
    return store.delete(id);
  },

  async exportLead(id) {
    return store.get(id) ?? null;
  },
};

export const consoleEmailAdapter: EmailAdapter = {
  async sendTransactional(email: OutboundEmail) {
    // Never actually sends. Logged locally only, for developer visibility
    // while previewing the flow — real sends require an approved provider
    // (see Phase B recommendations) and must never log full email bodies
    // in a real deployment.
    console.info(`[mock-email] Would send to ${email.to}: "${email.subject}"`);
    return { ok: true as const, previewId: `preview-${Date.now()}` };
  },
  async enqueueSequence(leadId: string, sequenceId: string) {
    console.info(`[mock-email] Would enqueue lead ${leadId} into sequence "${sequenceId}"`);
    return { ok: true as const };
  },
};
