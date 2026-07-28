import { ServiceDetailTemplate } from "@/components/services/ServiceDetailTemplate";
import { serviceDetails } from "@/lib/service-details";
import type { Metadata } from "next";

const service = serviceDetails["website-design"];

export const metadata: Metadata = {
  title: service.navTitle,
  description: service.heroDescription,
  alternates: { canonical: "/services/website-design" },
};

export default function WebsiteDesignPage() {
  return <ServiceDetailTemplate service={service} />;
}
