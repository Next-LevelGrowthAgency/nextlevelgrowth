import { ServiceDetailTemplate } from "@/components/services/ServiceDetailTemplate";
import { serviceDetails } from "@/lib/service-details";
import type { Metadata } from "next";

const service = serviceDetails["local-seo"];

export const metadata: Metadata = {
  title: service.navTitle,
  description: service.heroDescription,
  alternates: { canonical: "/services/local-seo" },
};

export default function LocalSeoPage() {
  return <ServiceDetailTemplate service={service} />;
}
