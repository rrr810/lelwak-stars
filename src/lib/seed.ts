/**
 * Structural seed content.
 *
 * These are placeholders written to show the exact story structure Lelwak
 * Stars wants (challenge -> action -> outcome -> next need). They render when
 * Supabase has no published stories yet, and are replaced automatically the
 * moment real activity records exist.
 */

export type SeedStory = {
  slug: string;
  title: string;
  program: "tree-nurseries" | "agripreneurship" | "school-mentorship" | "capacity-building";
  location: string;
  date: string;
  image: string;
  excerpt: string;
  challenge: string;
  action: string;
  outcome: string;
  need: string;
  reached: number | null;
};

export const seedStories: SeedStory[] = [
  {
    slug: "nursery-establishment",
    title: "Establishing our first community tree nursery",
    program: "tree-nurseries",
    location: "Community nursery site",
    date: "Recent activity",
    image: "",
    excerpt:
      "How we turned a patch of degraded land into a working seedling nursery managed by young people from the community.",
    challenge:
      "Degraded land and scarce indigenous seedlings made it hard for households and schools to access affordable trees to plant.",
    action:
      "Our youth members built seedling beds, sourced polythene bags and shade netting, and set up a structured nursery management routine with watering and monitoring schedules.",
    outcome:
      "The nursery now raises seedlings for planting campaigns and supplies schools we mentor, with survival tracked after planting.",
    need: "Sponsor additional beds, water storage and shade netting to double output.",
    reached: null,
  },
  {
    slug: "school-mentorship-visit",
    title: "Mentoring learners on environmental responsibility",
    program: "school-mentorship",
    location: "Partner schools",
    date: "Recent activity",
    image: "",
    excerpt:
      "A term of school visits bringing practical environmental stewardship, discipline and leadership coaching to learners.",
    challenge:
      "Learners had little exposure to practical environmental stewardship, discipline and leadership outside the classroom syllabus.",
    action:
      "We visited schools to run mentorship sessions on personal responsibility, leadership and caring for the environment — including hands-on tree planting with the learners.",
    outcome:
      "Students left with concrete actions they could take at school and at home, and several schools asked us to return and support environmental clubs.",
    need: "Adopt a school for a term so mentorship becomes a sustained programme, not a one-off visit.",
    reached: null,
  },
  {
    slug: "agripreneurship-training",
    title: "Turning agriculture into a youth livelihood",
    program: "agripreneurship",
    location: "Community training sessions",
    date: "Recent activity",
    image: "",
    excerpt:
      "Agribusiness skills, record keeping and value addition — helping young people see farming as an enterprise.",
    challenge:
      "Young people saw farming as subsistence rather than business, so talent and labour left the community instead of building it.",
    action:
      "We ran agripreneurship workshops covering agribusiness skills, record keeping, value addition and climate-smart practice, with follow-up mentorship.",
    outcome:
      "Participants began treating small plots and nursery stock as enterprises with costs, margins and customers.",
    need: "Fund the next training cohort plus starter toolkits and inputs.",
    reached: null,
  },
  {
    slug: "community-engagement",
    title: "Working with local administration and community stakeholders",
    program: "capacity-building",
    location: "Chief's office & community barazas",
    date: "Recent activity",
    image: "",
    excerpt:
      "Why our activities survive: we plan with the chief's office, elders and households before a single seedling is planted.",
    challenge:
      "Community initiatives often collapse because they arrive without local buy-in or coordination with existing structures.",
    action:
      "We met with local administration, presented our plans, and coordinated activity dates and sites with community stakeholders.",
    outcome:
      "Activities were welcomed, attended and protected — and follow-up requests came from the community rather than from us.",
    need: "Support facilitation, transport and materials for continued community engagement.",
    reached: null,
  },
];
