/**
 * Lelwak Stars CBO — single source of truth for site content.
 *
 * Everything marked TODO is a real value we still need from the organisation.
 * Once Supabase is connected, `programs`, `stories`, `stats`, `gallery` and
 * `partners` move into the database and this file becomes the fallback seed.
 */

type SiteConfig = {
  name: string;
  shortName: string;
  legalName: string;
  tagline: string;
  description: string;
  url: string;
  location: { region: string; addressLine: string };
  contact: { email: string; phone: string; whatsapp: string };
  socials: Record<string, string>;
  registration: {
    number: string;
    issuedBy: string;
    yearFounded: number;
    bankDetailsAvailable: boolean;
  };
};

export const site: SiteConfig = {
  name: "Lelwak Stars CBO",
  shortName: "Lelwak Stars",
  legalName: "Lelwak Stars Community Based Organisation",
  tagline: "Youth-led. Community-rooted. Growing greener futures.",
  description:
    "Lelwak Stars CBO is a youth-led community organisation empowering young people through tree nurseries and reforestation, agripreneurship training, school mentorship and capacity building.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://lelwakstars.org",

  // ---- TODO: confirm these with Lelwak Stars ----
  location: {
    region: "Nandi East Sub-County, Nandi County",
    addressLine: "Lelwak, Nandi Hills, Nandi East, Nandi County",
  },
  contact: {
    email: "lelwakstarscbo@gmail.com",
    phone: "", // TODO
    whatsapp: "", // TODO: international format e.g. +2547XXXXXXXX
  },
  socials: {
    facebook: "https://www.fb.com/l/6lp1kJRRR",
    instagram: "", // TODO
    x: "", // TODO
    linkedin: "", // TODO
    youtube: "", // TODO
    tiktok: "", // TODO
  },
  registration: {
    number: "DSS/NH/CBO/015/23", // certificate serial CBO 06771
    issuedBy: "Directorate of Social Development, Nandi County — Community Groups Registration Act No. 30 of 2022",
    yearFounded: 2023, // registered 14 August 2023
    bankDetailsAvailable: true,
  },
};

export const vision =
  "To build empowered and sustainable communities where youth lead in environmental conservation, agripreneurship and positive social change.";

export const mission =
  "To nurture responsible and innovative citizens through capacity building, school mentorship and eco-friendly initiatives that promote tree planting, agribusiness and community resilience.";

/* ------------------------------------------------------------------ */
/* PROGRAM PILLARS                                                     */
/* ------------------------------------------------------------------ */

export type ProgramId =
  | "tree-nurseries"
  | "agripreneurship"
  | "school-mentorship"
  | "capacity-building";

export type Program = {
  id: ProgramId;
  name: string;
  short: string;
  blurb: string;
  bullets: string[];
  /** Tailwind-safe hex — used for the accent bar / icon chip */
  accent: string;
  accentSoft: string;
  icon: "leaf" | "sprout" | "book" | "users";
  image: string;
  partnerAsk: string;
};

/**
 * Real field photos, hosted in the public Supabase "gallery" bucket.
 * Added per published batch by scripts/publish-photos.mjs; placeholders in
 * this file stay only until a matching real photo exists.
 */
export const photoBase =
  "https://ncarkchmduwihzoadyiv.supabase.co/storage/v1/object/public/gallery/";

export const livePhotos = {
  /** Simbi Primary planting day — learners holding seedlings (batch 1). */
  heroSeedlingHolders: photoBase + "webp/simbi-seedling-holders-9ccacfe2-1600.webp",
  /** Facilitator addressing learners at Simbi Primary (batch 1). */
  mentorshipTalk: photoBase + "webp/simbi-mentorship-talk-b4c493a0-1600.webp",
  /** Learner firming soil around a fresh seedling, Simbi Primary (batch 1). */
  learnerPlanting: photoBase + "webp/simbi-learner-planting-6d69a058-1600.webp",
  /** Dignity kits going up in celebration, Simbi Primary (batch 1). */
  dignityKits: photoBase + "webp/simbi-dignity-kits-bcba3121-1600.webp",
  /** Wide shot of the dignity-drive celebration (batch 1). */
  dignityCelebration: photoBase + "webp/simbi-dignity-celebration-40f994bb-1600.webp",
  /** Many hands holding one seedling, agribusiness training day (batch 4). */
  handsOneSeedling: photoBase + "webp/hands-one-seedling-2e92765d-1600.webp",
  /** Agribusiness workshop with flip charts (batch 4). */
  agriWorkshopFlipcharts: photoBase + "webp/agri-training-flipcharts-ec7bd32c-1600.webp",
  /** Facilitators in branded Lelwak Stars vests (batch 4). */
  facilitatorsVests: photoBase + "webp/lelwak-facilitators-vests-1f5ba1ce-1600.webp",
  /** Nursery species rows in gold and green (batch 5). */
  nurserySpeciesRows: photoBase + "webp/nursery-species-rows-d3110679-1600.webp",
  /** Tea seedling tunnel under bamboo arches (batch 5). */
  nurseryTeaTunnel: photoBase + "webp/nursery-tea-tunnel-e9a104c3-1600.webp",
  /** Team lineup outside a partner's house (batch 6). */
  teamLineup: photoBase + "webp/team-lineup-22acb455-1600.webp",
  /** Team with local leadership at the Lelwak Chief's office (batch 6). */
  teamChiefOffice: photoBase + "webp/team-chief-office-682bf4c0-1600.webp",
  /** Team member addressing a school assembly (batch 6). */
  teamSpeaker: photoBase + "webp/team-assembly-speaker-220fbba1-1600.webp",
  /** Team joining a classroom mentorship visit (batch 6). */
  teamClassroom: photoBase + "webp/team-classroom-visit-2384fc4b-1600.webp",
} as const;

export const programs: Program[] = [
  {
    id: "tree-nurseries",
    name: "Tree Nurseries & Reforestation",
    short: "Tree Nurseries",
    blurb:
      "We establish and manage community tree nurseries that raise indigenous and fruit seedlings, restoring degraded land and increasing local tree cover.",
    bullets: [
      "Community-run seedling beds and nursery management",
      "Indigenous, fruit and fodder species selection",
      "Planting campaigns with schools and local administration",
      "Seedling survival monitoring after planting",
    ],
    accent: "#14532D",
    accentSoft: "#DDEDDD",
    icon: "leaf",
    image: livePhotos.nurserySpeciesRows,
    partnerAsk:
      "Sponsor a nursery bed, polythene seedling bags, shade netting, watering equipment or a planting campaign.",
  },
  {
    id: "agripreneurship",
    name: "Agripreneurship Empowerment",
    short: "Agripreneurship",
    blurb:
      "We train young people to treat agriculture as a business — building green livelihoods and self-sustaining income from the land around them.",
    bullets: [
      "Agribusiness skills and record keeping",
      "Value addition and market linkages",
      "Climate-smart farming practice",
      "Youth enterprise mentorship and start-up support",
    ],
    accent: "#D89B32",
    accentSoft: "#FBF0DA",
    icon: "sprout",
    image: livePhotos.agriWorkshopFlipcharts,
    partnerAsk:
      "Fund a training cohort, toolkits and inputs, or connect our youth agripreneurs to markets.",
  },
  {
    id: "school-mentorship",
    name: "School Mentorship & Education",
    short: "School Mentorship",
    blurb:
      "We visit schools to mentor learners on environmental stewardship, personal responsibility, discipline and leadership.",
    bullets: [
      "In-school mentorship sessions and talks",
      "Environmental clubs and tree planting at schools",
      "Leadership, discipline and life-skills coaching",
      "Career guidance for senior learners",
    ],
    accent: "#123047",
    accentSoft: "#DCE7EF",
    icon: "book",
    image: livePhotos.mentorshipTalk,
    partnerAsk:
      "Adopt a school for a term, sponsor mentorship materials, or send your staff as guest mentors.",
  },
  {
    id: "capacity-building",
    name: "Capacity Building",
    short: "Capacity Building",
    blurb:
      "We equip local youth and community members with practical leadership, organisational and technical skills.",
    bullets: [
      "Leadership and governance training",
      "Project planning, monitoring and reporting",
      "Practical vocational and agri skills",
      "Community sensitisation and mobilisation",
    ],
    accent: "#C2603F",
    accentSoft: "#F7E4DC",
    icon: "users",
    image: livePhotos.facilitatorsVests,
    partnerAsk:
      "Support facilitator training, venue and materials, or co-design a curriculum with us.",
  },
];

/* ------------------------------------------------------------------ */
/* STRATEGIC FRAMEWORK                                                 */
/* ------------------------------------------------------------------ */

export const framework = [
  {
    step: "01",
    title: "Research & Analysis",
    text: "We identify environmental challenges, youth needs and best practice in tree nurseries and agripreneurship before we act.",
  },
  {
    step: "02",
    title: "Innovative Solutions",
    text: "We establish nurseries, launch mentorship modules and run entrepreneurship workshops designed around what the community actually needs.",
  },
  {
    step: "03",
    title: "Empowerment Initiatives",
    text: "We execute hands-on training, community programmes and school sessions that put tools and knowledge directly in young people's hands.",
  },
  {
    step: "04",
    title: "Impact & Growth",
    text: "We monitor nursery output, assess youth skill development and report honestly on environmental and community wellbeing.",
  },
] as const;

/* ------------------------------------------------------------------ */
/* IMPACT METRICS                                                      */
/* TODO: replace these portfolio figures with verified totals.         */
/* Sponsors trust absolute numbers far more than percentages —         */
/* "12,400 seedlings raised" beats "48%".                              */
/* ------------------------------------------------------------------ */

export type Stat = {
  id: string;
  label: string;
  /** absolute count if known, otherwise null */
  value: number | null;
  /** percentage from the portfolio document */
  percent: number | null;
  suffix?: string;
  note: string;
};

export const stats: Stat[] = [
  {
    id: "seedlings",
    label: "Tree seedlings grown",
    value: null,
    percent: 48,
    note: "Raised in our community nurseries",
  },
  {
    id: "youth",
    label: "Youth trained",
    value: null,
    percent: 45,
    note: "Agripreneurship & practical skills",
  },
  {
    id: "students",
    label: "Students mentored",
    value: null,
    percent: 42,
    note: "Across schools we have visited",
  },
  {
    id: "community",
    label: "Community education",
    value: null,
    percent: 39,
    note: "Barazas, campaigns & sensitisation",
  },
  {
    id: "air",
    label: "Air pollution & environmental awareness",
    value: null,
    percent: 36,
    note: "Focused awareness raising",
  },
];

/* ------------------------------------------------------------------ */
/* GALLERY CATEGORIES                                                  */
/* These map 1:1 to Supabase `gallery.category`.                       */
/* ------------------------------------------------------------------ */

export const galleryCategories = [
  { id: "tree-nurseries", label: "Tree Nurseries" },
  { id: "tree-planting", label: "Tree Planting" },
  { id: "school-mentorship", label: "School Mentorship" },
  { id: "youth-training", label: "Youth Training" },
  { id: "community-engagement", label: "Community Engagement" },
  { id: "partnerships", label: "Administration & Partnerships" },
] as const;

export type GalleryCategory = (typeof galleryCategories)[number]["id"];

/* ------------------------------------------------------------------ */
/* PARTNERSHIP TIERS                                                   */
/* ------------------------------------------------------------------ */

export const partnershipTiers = [
  {
    id: "seed",
    name: "Seed Partner",
    amount: "One-off gift",
    text: "Fund a planting day, a school mentorship visit or a batch of seedlings. Perfect for individuals and local businesses.",
    includes: [
      "Named on our Supporters page",
      "Photo report of the activity you funded",
      "Social media acknowledgement",
    ],
    highlight: false,
  },
  {
    id: "grower",
    name: "Growth Partner",
    amount: "Annual commitment",
    text: "Adopt a nursery bed or a school for a full season. You get regular reporting and visible recognition of your support.",
    includes: [
      "Everything in Seed",
      "Adopted nursery bed or school with signage",
      "Quarterly impact report with photos",
      "Logo on our Partners page and materials",
      "Invitation to field visits",
    ],
    highlight: true,
  },
  {
    id: "canopy",
    name: "Canopy Partner",
    amount: "Multi-year programme partnership",
    text: "Co-design and co-fund a whole programme — reforestation, agripreneurship cohorts or county-wide mentorship.",
    includes: [
      "Everything in Growth",
      "Co-branded programme design",
      "Dedicated reporting to your board / donors",
      "Media and PR collaboration",
      "Naming rights on a flagship initiative",
    ],
    highlight: false,
  },
] as const;

export const inquiryTypes = [
  { id: "sponsorship", label: "Sponsorship" },
  { id: "partnership", label: "Partnership / collaboration" },
  { id: "grant", label: "Grant or funding body" },
  { id: "volunteer", label: "Volunteering" },
  { id: "school", label: "School — request a mentorship visit" },
  { id: "media", label: "Media / press" },
  { id: "other", label: "Something else" },
] as const;

/* ------------------------------------------------------------------ */
/* NAV                                                                 */
/* ------------------------------------------------------------------ */

export const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/programs", label: "Our Work" },
  { href: "/impact", label: "Impact" },
  { href: "/stories", label: "Stories" },
  { href: "/gallery", label: "Gallery" },
  { href: "/partners", label: "Partner With Us" },
] as const;

/**
 * Prefix for static assets. GitHub Pages serves project sites under a
 * sub-path (e.g. /lelwak-stars), so every raw <img src> must carry the base
 * path. next/link and next/image do this automatically; plain strings don't.
 */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const asset = (path: string) =>
  `${basePath}${path.startsWith("/") ? path : `/${path}`}`;

export const brandColors = {
  forest: "#14532D",
  leaf: "#22C55E",
  navy: "#123047",
  cream: "#F7F5ED",
  gold: "#D89B32",
  sage: "#DDEBDD",
} as const;
