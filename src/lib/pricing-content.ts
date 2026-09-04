import type { ComparisonRow, CustomServiceCategory, PricingPackage, PricingPackageId } from "@/types";

/**
 * CENTRALIZED PRICING CONTENT
 * ------------------------------------------------------------------
 * Every price, setup fee, feature, and service on /pricing lives here —
 * mirrors the pattern in site-config.ts. Update this file to update
 * pricing anywhere it appears (overview cards, package sections, the
 * comparison table). Do not duplicate these numbers in component code.
 */

export const pricingPackages: PricingPackage[] = [
  {
    id: "foundation",
    slug: "foundation",
    name: "Foundation",
    tagline: "Website care and support.",
    positioning: ["Reliable care. Real peace of mind."],
    bestFor: "Best for businesses that already have a website and want dependable ongoing care.",
    bestForShort: "Existing websites",
    compareValueLabel: "Keep your website running.",
    price: 249,
    setupPrice: 250,
    description:
      "For businesses that already have a website and want dependable ongoing care, updates, monitoring, and technical support.",
    features: [
      "Website Care & Updates",
      "Website Protection & Backups",
      "Hosting Management",
      "Technical Support",
      "Performance Monitoring",
      "Basic Monthly Reporting",
    ],
    cta: "Choose Foundation",
    image: "/images/Pricing/Foundation.png",
    imageAlt: "Foundation package overview showing website care, protection, and monitoring dashboard",
    icon: "ShieldCheck",
    accent: {
      gradient: "from-teal-500 to-cyan-500",
      text: "text-teal-600",
      solidBg: "bg-teal-500",
      softBg: "bg-teal-50",
      border: "border-teal-200",
    },
  },
  {
    id: "launch",
    slug: "launch",
    name: "Launch",
    tagline: "Build your professional digital foundation.",
    positioning: ["Built to impress. Built to convert."],
    bestFor: "Best for businesses that need a professional website and a strong online foundation.",
    bestForShort: "New or outdated websites",
    compareValueLabel: "Build your professional foundation.",
    price: 349,
    setupPrice: 750,
    description: "For businesses that need a polished professional website and a strong digital foundation.",
    features: [
      "Everything in Foundation",
      "Custom Professional Website",
      "Mobile Responsive Design",
      "Basic SEO Setup",
      "Google Business Profile Setup",
      "Contact Forms & Lead Capture",
      "Monthly Website Updates",
      "Basic Analytics & Reporting",
    ],
    cta: "Launch Your Business",
    image: "/images/Pricing/Launch.png",
    imageAlt: "Launch package overview showing a new professional website and lead capture setup",
    icon: "Rocket",
    accent: {
      gradient: "from-violet-500 to-purple-600",
      text: "text-violet-600",
      solidBg: "bg-violet-500",
      softBg: "bg-violet-50",
      border: "border-violet-200",
    },
  },
  {
    id: "growth",
    slug: "growth",
    name: "Growth",
    tagline: "Increase visibility, leads, and performance.",
    positioning: ["Get found. Get trusted. Get more customers."],
    bestFor: "Best for businesses ready to improve visibility, lead capture, reviews, and performance.",
    bestForShort: "Businesses ready to grow online",
    compareValueLabel: "Grow visibility and opportunities.",
    price: 549,
    setupPrice: 1250,
    description:
      "For businesses ready to increase visibility, strengthen reputation, capture leads, and continuously improve their online presence.",
    features: [
      "Everything in Launch",
      "Local / Advanced SEO Optimization",
      "Google Business Optimization",
      "Review & Reputation System",
      "Lead Generation & Forms",
      "Performance Optimization",
      "Advanced Analytics",
      "Monthly Growth Reporting",
    ],
    cta: "Start Growing",
    image: "/images/Pricing/Growth.png",
    imageAlt: "Growth package overview showing SEO rankings, reviews, leads, and traffic growth",
    icon: "TrendingUp",
    accent: {
      gradient: "from-blue-600 to-violet-600",
      text: "text-blue-600",
      solidBg: "bg-blue-600",
      softBg: "bg-blue-50",
      border: "border-blue-200",
    },
    popular: true,
  },
  {
    id: "nextLevel",
    slug: "next-level",
    name: "Next Level",
    tagline: "Broader ongoing digital growth support.",
    positioning: ["We handle more. You grow faster."],
    bestFor: "Best for businesses that want ongoing strategy, AI, automation, and broader support.",
    bestForShort: "Businesses wanting full support",
    compareValueLabel: "Build the full digital system.",
    price: 999,
    setupPrice: 2500,
    description:
      "Our most comprehensive ongoing digital growth partnership for businesses ready for broader support across technology, marketing systems, content, automation, and performance.",
    features: [
      "Everything in Growth",
      "AI-Powered Systems",
      "Advanced AI Assistant / Coach Support",
      "Automation & Workflow Integrations",
      "Social Media Management",
      "Content Strategy",
      "Conversion Optimization",
      "Reputation Management",
      "Priority Support",
    ],
    cta: "Go Next Level",
    image: "/images/Pricing/Next-level.png",
    imageAlt: "Next Level package overview showing an integrated growth partnership dashboard with AI automation and reporting",
    icon: "Crown",
    accent: {
      gradient: "from-indigo-700 to-purple-900",
      text: "text-indigo-700",
      solidBg: "bg-indigo-700",
      softBg: "bg-indigo-50",
      border: "border-indigo-200",
    },
    scopeNote:
      "Major custom development, mobile applications, advanced software platforms, professional photo/video production, paid advertising spend, and complex integrations may require separate project scoping.",
  },
];

export function getPackageById(id: string): PricingPackage | undefined {
  return pricingPackages.find((pkg) => pkg.id === id || pkg.slug === id);
}

export const customServiceCategories: CustomServiceCategory[] = [
  {
    id: "web",
    label: "Web",
    icon: "LayoutTemplate",
    services: [
      {
        name: "Professional Website",
        startingPrice: "Starting at $1,000",
        optionalMonthly: "Starting at $99/month",
        description: "Professional responsive website designed around your business, brand, and customer journey.",
      },
      {
        name: "Website Redesign",
        startingPrice: "Starting at $750",
        optionalMonthly: "Starting at $99/month",
        description: "Modernize an existing website with improved design, usability, responsiveness, and messaging.",
      },
      {
        name: "E-Commerce Website",
        startingPrice: "Starting at $2,000",
        optionalMonthly: "Starting at $199/month",
        description: "Online storefront designed to showcase products, accept orders, and create a professional buying experience.",
      },
    ],
  },
  {
    id: "apps",
    label: "Apps",
    icon: "AppWindow",
    services: [
      {
        name: "Custom Web App / Client Portal",
        startingPrice: "Starting at $2,500",
        optionalMonthly: "Starting at $199/month",
        description: "Custom web-based tools, dashboards, portals, and internal systems built around your workflow.",
      },
      {
        name: "Mobile App Development",
        startingPrice: "Starting at $3,500",
        optionalMonthly: "Starting at $249/month",
        description: "Custom mobile application development for customer experiences, internal tools, and business services.",
      },
    ],
  },
  {
    id: "ai-automation",
    label: "AI & Automation",
    icon: "Brain",
    services: [
      {
        name: "AI Website Assistant",
        startingPrice: "Starting at $750",
        optionalMonthly: "Starting at $99/month",
        description: "AI-powered website support designed to answer questions, guide visitors, and support lead generation.",
      },
      {
        name: "Advanced AI Assistant / Coach",
        startingPrice: "Starting at $1,500",
        optionalMonthly: "Starting at $149/month",
        description: "Advanced AI experiences built around business knowledge, customer guidance, internal support, or coaching workflows.",
      },
      {
        name: "Automation / Lead System",
        startingPrice: "Starting at $750",
        optionalMonthly: "Starting at $149/month",
        description: "Automations designed to reduce repetitive work, organize leads, improve follow-up, and connect digital systems.",
      },
    ],
  },
  {
    id: "growth",
    label: "Growth",
    icon: "TrendingUp",
    services: [
      {
        name: "Local SEO Setup",
        startingPrice: "Starting at $500",
        optionalMonthly: "Starting at $299/month",
        description: "Improve the digital foundation needed to compete more effectively in local search.",
      },
      {
        name: "Google Business Optimization",
        startingPrice: "Starting at $300",
        optionalMonthly: "Starting at $149/month",
        description: "Improve the quality, completeness, and effectiveness of a Google Business Profile.",
      },
      {
        name: "Review / Reputation System",
        startingPrice: "Starting at $300",
        optionalMonthly: "Starting at $99/month",
        description: "Create a stronger system for generating, monitoring, and responding to customer reviews.",
      },
      {
        name: "Social Media Management",
        startingPrice: "Custom setup",
        optionalMonthly: "Starting at $499/month",
        description: "Ongoing social media support including content planning, client-provided asset optimization, captions, scheduling, and account management.",
      },
    ],
  },
];

export const socialContentScopeNote =
  "Professional photography, onsite video production, advanced commercial video production, high-volume content production, and paid advertising campaigns may require separate project pricing.";

/**
 * Comparison matrix. Each package's feature list is cumulative ("Everything
 * in X" carries forward), so a row marked true for Launch is also true for
 * Growth and Next Level, etc. — derived directly from each package's
 * `features` array above, not a separate source of truth.
 */
const fromLaunch: Record<PricingPackageId, boolean> = { foundation: false, launch: true, growth: true, nextLevel: true };
const fromGrowth: Record<PricingPackageId, boolean> = { foundation: false, launch: false, growth: true, nextLevel: true };
const nextLevelOnly: Record<PricingPackageId, boolean> = { foundation: false, launch: false, growth: false, nextLevel: true };

/**
 * Trimmed to the highest-value rows for scanability, not every feature from
 * each package's full list, just enough to make the tier differences
 * obvious at a glance. The full detail lives in each package section above.
 *
 * Rows with real depth differences across tiers (SEO, Google Business, Lead
 * Capture, Analytics & Reporting, Website Care) use a short descriptor
 * string instead of a bare checkmark, since a checkmark alone can't show
 * that Launch's "SEO" and Growth's "SEO" are not the same level of work.
 * Every descriptor is derived from that package's own `features` list
 * above, not invented for this table.
 */
export const comparisonRows: ComparisonRow[] = [
  {
    label: "Website Care",
    values: {
      foundation: "Ongoing Care",
      launch: "Ongoing Updates",
      growth: "Performance + Updates",
      nextLevel: "Priority Support",
    },
  },
  { label: "Professional Website", values: fromLaunch },
  { label: "Mobile Responsive Design", values: fromLaunch },
  {
    label: "SEO",
    values: { foundation: false, launch: "Basic Setup", growth: "Local + Ongoing", nextLevel: "Advanced + Ongoing" },
  },
  {
    label: "Google Business",
    values: { foundation: false, launch: "Initial Setup", growth: "Ongoing Optimization", nextLevel: "Ongoing Optimization" },
  },
  { label: "Review / Reputation System", values: fromGrowth },
  {
    label: "Lead Capture",
    values: { foundation: false, launch: "Contact Forms", growth: "Advanced Lead Capture", nextLevel: "Advanced + Automation" },
  },
  { label: "Website Performance Optimization", values: fromGrowth },
  {
    label: "Analytics & Reporting",
    values: { foundation: "Basic Reporting", launch: "Basic Analytics", growth: "Advanced Analytics", nextLevel: "Advanced + Strategy" },
  },
  { label: "Ongoing Growth Support", values: fromGrowth },
  { label: "AI Assistant", values: nextLevelOnly },
  { label: "Automation", values: nextLevelOnly },
  { label: "Social Media Support", values: nextLevelOnly },
  { label: "Conversion Optimization", values: nextLevelOnly },
  { label: "Priority Support", values: nextLevelOnly },
];
