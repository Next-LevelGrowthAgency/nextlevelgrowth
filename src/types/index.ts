export type NavLink = {
  label: string;
  href: string;
};

export type ServiceOutcome = {
  slug: string;
  headline: string;
  description: string;
  icon: string; // lucide-react icon name
  href: string;
};

export type FrameworkStage = {
  number: string;
  title: string;
  description: string;
};

export type Differentiator = {
  title: string;
  description: string;
  icon: string;
};

export type ConceptProject = {
  slug: string;
  industry: string;
  label: "Concept Project" | "Demonstration Build" | "Sample Transformation";
  challenge: string;
  strategy: string;
  services: string[];
  objective: string;
  accentColor: "signal" | "grove" | "ember" | "ink";
};

export type CapabilityProof = {
  title: string;
  description: string;
  icon: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  company: string;
};

export type IndustryTag = {
  label: string;
};

export type GrowthAuditFormData = {
  name: string;
  businessName: string;
  email: string;
  phone: string;
  websiteUrl?: string;
  industry: string;
  location: string;
  primaryGoal: string;
  biggestChallenge: string;
  servicesOfInterest: string[];
  preferredContact: "Email" | "Phone" | "Text";
  additionalDetails?: string;
};
