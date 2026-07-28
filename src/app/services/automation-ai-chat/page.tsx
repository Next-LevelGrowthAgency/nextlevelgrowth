import { ServiceDetailTemplate } from "@/components/services/ServiceDetailTemplate";
import { serviceDetails } from "@/lib/service-details";
import type { Metadata } from "next";

const service = serviceDetails["automation-ai-chat"];

export const metadata: Metadata = {
  title: service.navTitle,
  description: service.heroDescription,
  alternates: { canonical: "/services/automation-ai-chat" },
};

export default function AutomationAiChatPage() {
  return <ServiceDetailTemplate service={service} />;
}
