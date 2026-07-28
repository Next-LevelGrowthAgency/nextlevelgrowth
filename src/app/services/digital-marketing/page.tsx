import { ServiceDetailTemplate } from "@/components/services/ServiceDetailTemplate";
import { serviceDetails } from "@/lib/service-details";
import type { Metadata } from "next";

const service = serviceDetails["digital-marketing"];

export const metadata: Metadata = {
  title: service.navTitle,
  description: service.heroDescription,
  alternates: { canonical: "/services/digital-marketing" },
};

export default function DigitalMarketingPage() {
  return <ServiceDetailTemplate service={service} />;
}
