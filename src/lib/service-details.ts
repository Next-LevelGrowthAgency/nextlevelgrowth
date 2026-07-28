export type ServicePillar = {
  title: string;
  description: string;
  icon: string;
};

export type ServiceDetail = {
  slug: string;
  navTitle: string;
  eyebrow: string;
  heroTitle: string;
  heroDescription: string;
  overview: string;
  pillars: ServicePillar[];
  outcomes: string[];
};

export const serviceDetails: Record<string, ServiceDetail> = {
  "website-design": {
    slug: "website-design",
    navTitle: "Website Design",
    eyebrow: "Website Design & Development",
    heroTitle: "A Website Built to Build Trust and Drive Action",
    heroDescription:
      "Your website is often the first real impression of your business. We design and build sites that look credible, load fast, work beautifully on any device, and make it obvious what a visitor should do next.",
    overview:
      "A good-looking website that doesn't generate leads isn't doing its job. We start with strategy — who's visiting, what they need to know, and what action matters most — before a single design decision is made. The result is a site that represents your business well and quietly does the work of turning visitors into inquiries.",
    pillars: [
      {
        title: "Strategy before design",
        description:
          "We map your customers' questions and objections before we design a single page, so the site is built to answer them.",
        icon: "Compass",
      },
      {
        title: "User experience",
        description:
          "Clear navigation, logical page flow, and calls to action that feel like the next natural step — not a hard sell.",
        icon: "MousePointerClick",
      },
      {
        title: "Mobile responsiveness",
        description:
          "Designed mobile-first, since most local searches happen on a phone — buttons, forms, and menus all stay comfortable to use.",
        icon: "Smartphone",
      },
      {
        title: "Credibility",
        description:
          "Professional design, clear service explanations, and a polished first impression that builds trust before you ever speak with a customer.",
        icon: "BadgeCheck",
      },
      {
        title: "Lead capture",
        description:
          "Forms, calls to action, and contact paths placed with intention, so interested visitors have an easy way to reach you.",
        icon: "Inbox",
      },
      {
        title: "Performance",
        description:
          "Fast load times and clean technical foundations — speed is both a trust signal and a search ranking factor.",
        icon: "Gauge",
      },
      {
        title: "Ownership",
        description:
          "The site we build is yours. You'll know exactly what you own and how to manage it going forward.",
        icon: "KeyRound",
      },
    ],
    outcomes: [
      "A site that looks and feels like a premium, established business",
      "Clear paths to contact, call, or request a quote on every page",
      "A mobile experience that doesn't feel like an afterthought",
      "A technical foundation ready for SEO and future growth",
    ],
  },

  "local-seo": {
    slug: "local-seo",
    navTitle: "Local SEO",
    eyebrow: "Local SEO & Google Business Profile",
    heroTitle: "Get Found by the Customers Already Searching for You",
    heroDescription:
      "Most customers start with a search — 'near me,' a service, or your business name. Local SEO makes sure your business shows up clearly, accurately, and competitively when they do.",
    overview:
      "Local SEO isn't about chasing algorithm tricks. It's about making sure Google — and your customers — can clearly understand what you do, where you do it, and why you're a trustworthy choice. We focus on the fundamentals that actually move local rankings and, more importantly, actually bring in customers.",
    pillars: [
      {
        title: "Google Business Profile optimization",
        description:
          "A complete, accurate, and actively managed profile — the single highest-leverage local SEO asset most businesses neglect.",
        icon: "MapPin",
      },
      {
        title: "Local search visibility",
        description:
          "On-page and technical SEO focused on the searches your real customers actually use.",
        icon: "Search",
      },
      {
        title: "Reputation support",
        description:
          "Guidance on generating and responding to reviews the right way — reviews are both a trust signal and a ranking factor.",
        icon: "Star",
      },
      {
        title: "Location and service-area clarity",
        description:
          "Making sure search engines understand exactly where and who you serve, so you show up in the right searches.",
        icon: "Navigation",
      },
    ],
    outcomes: [
      "Improved visibility in local map results and organic search",
      "A Google Business Profile that reflects your business accurately",
      "More qualified traffic from people already looking for what you offer",
      "A clear, honest view of where you rank today and what's realistic",
    ],
  },

  "digital-marketing": {
    slug: "digital-marketing",
    navTitle: "Digital Marketing",
    eyebrow: "Digital Marketing Strategy",
    heroTitle: "Marketing Built Around Measurable Business Outcomes",
    heroDescription:
      "Digital marketing should connect directly to leads, calls, and appointments — not just impressions. We build strategy around your goals, your market, and your budget.",
    overview:
      "There's no shortage of marketing tactics available to a local business — the hard part is knowing which ones actually matter for yours. We start with your goals and your numbers, then build a strategy that's honest about tradeoffs, focused on conversion, and set up so results can actually be measured.",
    pillars: [
      {
        title: "Strategic campaigns",
        description:
          "Marketing plans built around your specific goals and market, not a one-size-fits-all package.",
        icon: "Target",
      },
      {
        title: "Content",
        description:
          "Messaging and content that speaks to your customer's real questions and concerns, in plain language.",
        icon: "FileText",
      },
      {
        title: "Conversion optimization",
        description:
          "Landing pages, offers, and calls to action refined to turn more of your existing traffic into leads.",
        icon: "MousePointerClick",
      },
      {
        title: "Measurement",
        description:
          "Clear tracking on what matters — leads, calls, and form submissions — so decisions are based on data, not guesses.",
        icon: "BarChart3",
      },
    ],
    outcomes: [
      "A marketing plan matched to your budget and your goals",
      "Clearer, more persuasive messaging across your digital presence",
      "Better conversion from the traffic you already have",
      "Reporting that shows what's actually working",
    ],
  },

  "automation-ai-chat": {
    slug: "automation-ai-chat",
    navTitle: "Automation & AI Chat",
    eyebrow: "Automation & AI-Powered Chat",
    heroTitle: "Respond to Every Customer, Even When You Can't",
    heroDescription:
      "A practical tool for busy business owners: AI-powered chat and automation that capture inquiries, answer common questions, and make sure no lead falls through the cracks — day or night.",
    overview:
      "This isn't about putting 'AI' in your brand identity — it's about making sure a customer who reaches out at 9pm on a Saturday still gets a helpful response and a way to leave their information. Our automation is built to save you time on repetitive questions and routing, while clearly identifying itself as a virtual assistant and handing off to a real person whenever a question calls for one.",
    pillars: [
      {
        title: "Capturing inquiries",
        description: "Never miss a lead because no one was available to answer the phone or a form.",
        icon: "Inbox",
      },
      {
        title: "Answering approved questions",
        description:
          "Common questions answered instantly and accurately, using information you've reviewed and approved.",
        icon: "MessageCircleQuestion",
      },
      {
        title: "Collecting lead details",
        description: "Structured, consistent information collected from every conversation.",
        icon: "ClipboardList",
      },
      {
        title: "Routing customers",
        description: "Directing inquiries to the right service, person, or next step automatically.",
        icon: "Route",
      },
      {
        title: "Saving time",
        description: "Fewer repetitive calls and messages, so you can focus on the work only you can do.",
        icon: "Clock",
      },
    ],
    outcomes: [
      "24/7 lead capture without hiring additional staff",
      "Faster response times, which customers consistently rate as a top factor in choosing a business",
      "A clear disclosure that visitors are chatting with a virtual assistant — never pretending to be a person",
      "Automatic escalation to a human for anything the assistant can't confidently answer",
    ],
  },
};
