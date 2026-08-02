import type {
  CapabilityProof,
  ConceptProject,
  Differentiator,
  FaqItem,
  FrameworkStage,
  IndustryTag,
  NavLink,
  ServiceOutcome,
  Testimonial,
} from "@/types";

/**
 * CENTRALIZED SITE CONTENT
 * ------------------------------------------------------------------
 * Every piece of copy, contact detail, nav item, and content block that
 * appears more than once (or that a non-developer should be able to
 * edit) lives here. Update this file to update the site — you should
 * rarely need to touch component code for a text or content change.
 *
 * Anything marked "PLACEHOLDER" is a stand-in and must be replaced with
 * real business information before launch. See CONTENT-GUIDE.md.
 */

export const siteConfig = {
  name: "Next Level Growth",
  shortName: "Next Level Growth",
  tagline: "Helping Local Businesses Reach Their Next Level",
  description:
    "Next Level Growth helps local and service-based businesses attract more customers, build credibility, and grow with confidence through modern websites, local SEO, and smarter digital strategy.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.nextlevelgrowth.com",

  // PLACEHOLDER — replace with verified business information before launch.
  contact: {
    email: "hello@nextlevelgrowth.com",
    phone: "(555) 010-0142",
    phoneHref: "+15550100142",
    addressLine1: "PLACEHOLDER: Street Address",
    addressLine2: "PLACEHOLDER: City, State ZIP",
    serviceArea: "PLACEHOLDER: Primary service area / region",
  },

  // PLACEHOLDER — replace with real, verified profiles before launch.
  social: {
    facebook: "https://facebook.com/PLACEHOLDER",
    instagram: "https://instagram.com/PLACEHOLDER",
    linkedin: "https://linkedin.com/company/PLACEHOLDER",
    google: "https://g.page/PLACEHOLDER",
  },
} as const;

export const primaryCta = {
  label: "Get Your Free Growth Audit",
  href: "/growth-audit",
};

export const secondaryCta = {
  label: "Explore How We Help",
  href: "/services",
};

export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Our Approach", href: "/approach" },
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Insights", href: "/insights" },
  { label: "Contact", href: "/contact" },
];

export const footerServiceLinks: NavLink[] = [
  { label: "Website Design", href: "/services/website-design" },
  { label: "Local SEO", href: "/services/local-seo" },
  { label: "Digital Marketing", href: "/services/digital-marketing" },
  { label: "Automation & AI Chat", href: "/services/automation-ai-chat" },
];

export const footerLegalLinks: NavLink[] = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Accessibility Statement", href: "/accessibility" },
];

/** Services, framed around outcomes rather than deliverables. */
export const services: ServiceOutcome[] = [
  {
    slug: "website-design",
    headline: "Build a Stronger First Impression",
    description:
      "Custom websites that communicate credibility and make it easy for customers to take action.",
    icon: "LayoutTemplate",
    href: "/services/website-design",
  },
  {
    slug: "local-seo",
    headline: "Get Discovered by More Local Customers",
    description:
      "Local SEO and Google Business Profile strategies designed to improve visibility where it counts.",
    icon: "MapPin",
    href: "/services/local-seo",
  },
  {
    slug: "digital-marketing",
    headline: "Turn Attention Into Leads",
    description:
      "Conversion-focused pages, contact forms, calls to action, and lead-generation systems.",
    icon: "TrendingUp",
    href: "/services/digital-marketing",
  },
  {
    slug: "automation-ai-chat",
    headline: "Respond Even When You're Busy",
    description:
      "AI-powered chat and automation that capture customer information around the clock.",
    icon: "MessageCircle",
    href: "/services/automation-ai-chat",
  },
  {
    slug: "growth-strategy",
    headline: "Create a Clear Growth Strategy",
    description:
      "Digital marketing guidance built around your goals, your market, and your budget.",
    icon: "Compass",
    href: "/services",
  },
  {
    slug: "ongoing-support",
    headline: "Keep Improving",
    description:
      "Ongoing maintenance, optimization, performance monitoring, and support.",
    icon: "ShieldCheck",
    href: "/services",
  },
];

export const frameworkStages: FrameworkStage[] = [
  {
    number: "01",
    title: "Discover",
    description:
      "We take the time to understand your business, your customers, your goals, your market, and where your online presence stands today.",
  },
  {
    number: "02",
    title: "Clarify",
    description:
      "Together we develop a clear message, offer, positioning, and growth strategy built around what actually moves your business forward.",
  },
  {
    number: "03",
    title: "Build",
    description:
      "We create your website, lead-capture systems, content, and digital foundation, designed with intention, not templates.",
  },
  {
    number: "04",
    title: "Launch",
    description:
      "We test everything, connect analytics, optimize performance, and introduce your new experience to the world.",
  },
  {
    number: "05",
    title: "Grow",
    description:
      "We monitor results, refine strategy, and keep creating momentum. Growth is a direction, not a one-time project.",
  },
];

export const differentiators: Differentiator[] = [
  {
    title: "Strategy before design",
    description: "We start with your goals and your customers, not a template.",
    icon: "Compass",
  },
  {
    title: "Business outcomes over vanity metrics",
    description: "We build toward leads, calls, and appointments, not just good looks.",
    icon: "Target",
  },
  {
    title: "Clear communication",
    description: "You'll always know what's happening and why.",
    icon: "MessagesSquare",
  },
  {
    title: "Solutions shaped around your business",
    description: "No unnecessary complexity, no generic playbooks.",
    icon: "Puzzle",
  },
  {
    title: "Modern, fast, mobile-first execution",
    description: "Built the way your customers actually browse.",
    icon: "Smartphone",
  },
  {
    title: "Honest recommendations",
    description: "We tell you what your business needs, not what's easiest for us to sell.",
    icon: "BadgeCheck",
  },
  {
    title: "A long-term partnership",
    description: "We're invested in where your business is headed, not just the launch date.",
    icon: "Handshake",
  },
  {
    title: "Technology translated into practical value",
    description: "You get plain-English guidance, not jargon.",
    icon: "Lightbulb",
  },
];

/**
 * Concept portfolio. These are clearly-labeled demonstration projects, not
 * paid client engagements. Replace with real case studies as they become
 * available — see CONTENT-GUIDE.md for how to add a new project.
 */
export const conceptProjects: ConceptProject[] = [
  {
    slug: "concept-restaurant",
    industry: "Restaurant",
    label: "Concept Project",
    challenge:
      "An outdated website made it hard for new visitors to find hours, the menu, or a way to reserve a table.",
    strategy:
      "A warm, mobile-first redesign built around three actions: viewing the menu, making a reservation, and finding the location.",
    services: ["Website Design", "Local SEO", "Google Business Profile"],
    objective: "Increase reservation requests and walk-in confidence from mobile search.",
    accentColor: "ember",
  },
  {
    slug: "concept-dental-practice",
    industry: "Dental Practice",
    label: "Concept Project",
    challenge:
      "Strong reputation locally, but the website didn't reflect the quality of care or make booking easy.",
    strategy:
      "A credibility-first site with clear service pages, an approachable tone, and a frictionless appointment-request flow.",
    services: ["Website Design", "Local SEO", "Lead Capture"],
    objective: "Convert more searchers into scheduled new-patient appointments.",
    accentColor: "signal",
  },
  {
    slug: "concept-home-services",
    industry: "Home-Service Company",
    label: "Concept Project",
    challenge:
      "Inconsistent lead flow and no way to capture inquiries after hours or during busy job sites.",
    strategy:
      "A conversion-focused site paired with AI-powered chat to capture and qualify leads around the clock.",
    services: ["Website Design", "Automation & AI Chat", "Digital Marketing"],
    objective: "Create a steady, predictable pipeline of qualified service requests.",
    accentColor: "grove",
  },
  {
    slug: "concept-fitness-studio",
    industry: "Fitness Studio",
    label: "Concept Project",
    challenge:
      "A vibrant in-person community that wasn't reflected anywhere in the studio's flat, outdated web presence.",
    strategy:
      "An energetic but clean redesign focused on class schedules, trial-offer capture, and membership conversion.",
    services: ["Website Design", "Digital Marketing"],
    objective: "Turn website visits into trial-class signups.",
    accentColor: "ember",
  },
  {
    slug: "concept-local-retailer",
    industry: "Local Retailer",
    label: "Concept Project",
    challenge:
      "Great in-store experience, but customers couldn't find the shop online or trust it before visiting.",
    strategy:
      "A credibility-focused local presence build: refreshed site, Google Business Profile optimization, and clear directions/hours.",
    services: ["Website Design", "Local SEO"],
    objective: "Increase in-store visits driven by local search discovery.",
    accentColor: "signal",
  },
  {
    slug: "concept-professional-services",
    industry: "Professional Services Firm",
    label: "Concept Project",
    challenge:
      "A dated site undersold the firm's expertise and gave visitors no clear next step.",
    strategy:
      "A refined, authority-building redesign with clear service explanations and a low-pressure consultation request path.",
    services: ["Website Design", "Digital Marketing", "Ongoing Support"],
    objective: "Generate more qualified consultation requests from organic search.",
    accentColor: "ink",
  },
];

export const capabilityProofs: CapabilityProof[] = [
  { title: "Mobile-first design", description: "Built for how your customers actually browse.", icon: "Smartphone" },
  { title: "Conversion-focused structure", description: "Every page has a clear next step.", icon: "MousePointerClick" },
  { title: "Clear calls to action", description: "No confusing menus of options.", icon: "ArrowUpRight" },
  { title: "Search-friendly technical foundation", description: "Built to be found, not just to look good.", icon: "Search" },
  { title: "Fast performance", description: "Speed is a trust signal and a ranking factor.", icon: "Gauge" },
  { title: "Accessible experience", description: "Usable for every visitor, on every device.", icon: "Accessibility" },
  { title: "Analytics readiness", description: "Set up to measure what actually matters.", icon: "BarChart3" },
  { title: "Lead-capture systems", description: "Built in from day one, not bolted on later.", icon: "Inbox" },
];

export const industries: IndustryTag[] = [
  { label: "Restaurants & Cafés" },
  { label: "Retail" },
  { label: "Salons & Spas" },
  { label: "Gyms & Fitness Studios" },
  { label: "Dentists & Medical Practices" },
  { label: "Chiropractors" },
  { label: "Attorneys" },
  { label: "Accountants & Financial Professionals" },
  { label: "Real Estate & Property Management" },
  { label: "Auto Repair" },
  { label: "Cleaning Companies" },
  { label: "Consultants & Coaches" },
  { label: "Contractors & Home Services" },
  { label: "Plumbers, Electricians & HVAC" },
  { label: "Roofers & Landscapers" },
  { label: "Family-Owned Businesses" },
];

export const faqs: FaqItem[] = [
  {
    question: "What types of businesses do you work with?",
    answer:
      "We work with local and service-based businesses across nearly every industry, from restaurants and med-spas to contractors, law firms, and fitness studios. The common thread isn't industry; it's wanting more visibility, more customers, and a stronger online presence.",
  },
  {
    question: "Do I need a new website?",
    answer:
      "Not necessarily. Sometimes the right move is a full rebuild, and sometimes it's targeted improvements to what you already have. We'll give you an honest recommendation after a Free Growth Audit rather than assuming you need to start over.",
  },
  {
    question: "Can you improve my existing website?",
    answer:
      "Yes. We regularly improve existing sites: performance, SEO, structure, and conversion paths, without necessarily rebuilding from scratch.",
  },
  {
    question: "How long does a website project take?",
    answer:
      "Timelines vary by scope, but most projects move through Discover, Clarify, Build, and Launch over several weeks. You'll get a clear timeline before any work begins.",
  },
  {
    question: "Do you provide hosting and ongoing support?",
    answer:
      "Yes. We offer hosting, maintenance, and ongoing optimization so your site keeps performing well after launch, not just on launch day.",
  },
  {
    question: "Can you help my business appear on Google?",
    answer:
      "Yes. Local SEO and Google Business Profile optimization are core parts of what we do, aimed at improving how easily customers can find you.",
  },
  {
    question: "What is a Growth Audit?",
    answer:
      "A Growth Audit is a free, no-pressure review of your current online presence (website, local search visibility, and lead capture) with clear, honest observations about what's working and what could be improved.",
  },
  {
    question: "Do you offer AI chatbots?",
    answer:
      "Yes, as an optional add-on. Our AI chat is designed to capture and qualify leads and answer common questions. It's disclosed as a virtual assistant and escalates anything it can't confidently answer to a real person.",
  },
  {
    question: "Will I own my website?",
    answer:
      "Yes. The site we build is yours. We'll walk you through exactly what that includes as part of your proposal.",
  },
  {
    question: "How much do your services cost?",
    answer:
      "Pricing depends on scope. A single-page site and a full multi-service engagement aren't priced the same way. We'll give you clear, itemized pricing after understanding your goals, with no obligation.",
  },
  {
    question: "Can we start small and expand later?",
    answer:
      "Absolutely. Many clients start with a website or a Growth Audit and add services like SEO or automation as their business grows.",
  },
  {
    question: "What happens after the website launches?",
    answer:
      "We monitor performance, review analytics together, and recommend next steps. That's the 'Grow' stage of our process, and it doesn't have an end date.",
  },
];

/**
 * Testimonials component exists and is reusable, but is intentionally NOT
 * rendered anywhere in production until real, verified testimonials exist.
 * Do not populate this with fabricated quotes. See CONTENT-GUIDE.md.
 */
export const testimonials: Testimonial[] = [];

export const trustStatement =
  "Clear strategy. Honest communication. Solutions built around your business.";

export const announcementBarMessage =
  "Growth strategies built for ambitious local businesses.";
