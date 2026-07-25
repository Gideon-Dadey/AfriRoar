export type SrPost = {
  id: string;
  slug: string;
  title: string;
  date: string;
  category: 'scholarship' | 'internship' | 'guide' | 'list';
  level?: string;
  country?: string;
  image: string;
  excerpt: string;
  featured?: boolean;
};

export const heroCards = [
  {
    title: 'Scholarships',
    to: '/scholarships',
    icon: 'scholarship' as const,
  },
  {
    title: 'Internships',
    to: '/internships',
    icon: 'internship' as const,
  },
  {
    title: 'Guides',
    to: '/guides',
    icon: 'guide' as const,
  },
];

export const popularCountries = [
  { name: 'USA', slug: 'usa', flag: 'https://flagcdn.com/w320/us.png' },
  { name: 'UK', slug: 'uk', flag: 'https://flagcdn.com/w320/gb.png' },
  { name: 'Australia', slug: 'australia', flag: 'https://flagcdn.com/w320/au.png' },
  { name: 'Germany', slug: 'germany', flag: 'https://flagcdn.com/w320/de.png' },
  { name: 'Canada', slug: 'canada', flag: 'https://flagcdn.com/w320/ca.png' },
];

export const lookingFor = [
  { label: 'Undergraduate Scholarships', to: '/scholarships?level=undergraduate' },
  { label: 'Masters Scholarships', to: '/scholarships?level=masters' },
  { label: 'PhD Scholarships', to: '/scholarships?level=phd' },
  { label: 'Postdoctoral Scholarships', to: '/scholarships?level=postdoctoral' },
  { label: 'Training Scholarships', to: '/scholarships?level=training' },
  { label: 'Scholarships by Countries', to: '/countries' },
  { label: 'Scholarships Lists', to: '/lists' },
  { label: 'Internships', to: '/internships' },
  { label: 'Scholarship Guides', to: '/guides' },
];

export const posts: SrPost[] = [
  {
    id: '1',
    slug: 'chevening-scholarship-2027',
    title: 'Chevening Scholarship 2027 (Fully Funded) | Complete Guide',
    date: 'July 24, 2026',
    category: 'scholarship',
    level: 'Masters',
    country: 'UK',
    image: '/sr/posts/chevening.png',
    excerpt:
      'The Chevening Scholarship is the UK government’s global scholarship programme offering fully funded master’s degrees at UK universities.',
    featured: true,
  },
  {
    id: '2',
    slug: 'romania-government-scholarships-2027',
    title: 'Romania Government Scholarships 2027 | Fully Funded',
    date: 'July 23, 2026',
    category: 'scholarship',
    level: 'Undergraduate / Masters / PhD',
    country: 'Romania',
    image: '/sr/posts/romania.webp',
    excerpt:
      'Fully funded scholarships offered by the Romanian Government for international students across multiple degree levels.',
    featured: true,
  },
  {
    id: '3',
    slug: 'shanghai-jiao-tong-university-scholarships-2027',
    title: 'Shanghai Jiao Tong University Scholarships 2027 (Fully Funded)',
    date: 'July 23, 2026',
    category: 'scholarship',
    level: 'Masters / PhD',
    country: 'China',
    image: '/sr/posts/shanghai.webp',
    excerpt:
      'Explore fully funded scholarships at Shanghai Jiao Tong University for outstanding international applicants.',
    featured: true,
  },
  {
    id: '4',
    slug: 'yonsei-university-scholarships-2027',
    title: 'Yonsei University Scholarships 2027 | South Korea',
    date: 'July 25, 2026',
    category: 'scholarship',
    level: 'Undergraduate / Masters',
    country: 'South Korea',
    image: '/sr/posts/yonsei.webp',
    excerpt: 'Scholarship opportunities for international students at Yonsei University in South Korea.',
  },
  {
    id: '5',
    slug: 'korea-university-scholarships-2027',
    title: 'Korea University Scholarships 2027 for International Students',
    date: 'July 24, 2026',
    category: 'scholarship',
    level: 'Undergraduate / Masters / PhD',
    country: 'South Korea',
    image: '/sr/posts/korea.webp',
    excerpt: 'Korea University offers competitive funding packages for international degree seekers.',
  },
  {
    id: '6',
    slug: 'university-of-auckland-scholarship-2027',
    title: 'University of Auckland Scholarship 2027 | New Zealand',
    date: 'July 24, 2026',
    category: 'scholarship',
    level: 'Undergraduate / Masters / PhD',
    country: 'New Zealand',
    image: '/sr/posts/auckland.png',
    excerpt: 'Funding options available for international students at the University of Auckland.',
  },
  {
    id: '7',
    slug: 'harvard-university-scholarships-2027',
    title: 'Harvard University Scholarships 2027 (Fully Funded)',
    date: 'July 23, 2026',
    category: 'scholarship',
    level: 'Undergraduate / Masters / PhD',
    country: 'USA',
    image: '/sr/posts/chevening.png',
    excerpt: 'Need-based and merit scholarships for international students at Harvard University.',
  },
  {
    id: '8',
    slug: 'gates-cambridge-scholarship-2027',
    title: 'Gates Cambridge Scholarship 2027 (Fully Funded)',
    date: 'July 23, 2026',
    category: 'scholarship',
    level: 'Masters / PhD',
    country: 'UK',
    image: '/sr/posts/chevening.png',
    excerpt: 'Prestigious fully funded awards for postgraduate study at the University of Cambridge.',
  },
  {
    id: '9',
    slug: 'hong-kong-phd-fellowship-2027',
    title: 'Hong Kong PhD Fellowship Scheme 2027 | Fully Funded',
    date: 'July 23, 2026',
    category: 'scholarship',
    level: 'PhD',
    country: 'Hong Kong',
    image: '/sr/posts/yonsei.webp',
    excerpt: 'Competitive PhD fellowships covering tuition and stipend for study in Hong Kong.',
  },
  {
    id: '10',
    slug: 'rmit-university-scholarships-2027',
    title: 'RMIT University Scholarships 2027 | Australia (Fully Funded)',
    date: 'July 18, 2026',
    category: 'scholarship',
    level: 'Masters / PhD',
    country: 'Australia',
    image: '/sr/posts/norway.webp',
    excerpt: 'Research and coursework scholarships for international students at RMIT University.',
  },
  {
    id: '11',
    slug: 'motivation-letter-examples',
    title: 'How to write a Motivation Letter for Scholarship (5 Examples)',
    date: 'July 23, 2026',
    category: 'guide',
    image: '/sr/posts/motivation.png',
    excerpt: 'Step-by-step guidance and real examples to help you craft a winning motivation letter.',
  },
  {
    id: '12',
    slug: 'csc-acceptance-letter-guide',
    title: 'How to Get an Acceptance Letter from Chinese Universities (CSC Scholarship) 2027',
    date: 'July 13, 2026',
    category: 'guide',
    image: '/sr/posts/csc.webp',
    excerpt: 'Practical tips for securing a pre-admission or acceptance letter for CSC applications.',
  },
  {
    id: '13',
    slug: 'scholarship-deadlines-2026-2027',
    title: 'Scholarship Deadlines 2026-2027 | Month-by-Month Calendar',
    date: 'July 11, 2026',
    category: 'guide',
    image: '/sr/posts/deadlines.webp',
    excerpt: 'A month-by-month calendar of major international scholarship deadlines.',
  },
  {
    id: '19',
    slug: 'scholarship-documents-checklist',
    title: 'Scholarship Documents Checklist | What to Prepare Before You Apply',
    date: 'July 10, 2026',
    category: 'guide',
    image: '/sr/posts/motivation.png',
    excerpt: 'A practical packet checklist: passport, transcripts, essays, references, and file naming that looks professional.',
  },
  {
    id: '20',
    slug: 'common-scholarship-mistakes',
    title: 'Common Scholarship Mistakes (And How to Avoid Them)',
    date: 'July 9, 2026',
    category: 'guide',
    image: '/sr/posts/deadlines.webp',
    excerpt: 'Eligibility skips, generic essays, late recommenders, and fee scams. Fix these before you submit.',
  },
  {
    id: '14',
    slug: 'fully-funded-scholarships-malaysia-2027',
    title: 'Fully Funded Scholarships in Malaysia 2027 for International Students',
    date: 'July 15, 2026',
    category: 'list',
    country: 'Malaysia',
    image: '/sr/posts/malaysia.png',
    excerpt: 'Curated list of fully funded scholarships available in Malaysia for 2027 intake.',
  },
  {
    id: '15',
    slug: 'fully-funded-scholarships-norway-2027',
    title: 'Fully Funded Scholarships in Norway 2027 (Updated Guide and List)',
    date: 'July 11, 2026',
    category: 'list',
    country: 'Norway',
    image: '/sr/posts/norway.webp',
    excerpt: 'Updated guide and list of fully funded scholarships for studying in Norway.',
  },
  {
    id: '18',
    slug: 'scholarship-deadlines-list-2026-2027',
    title: 'Scholarship Deadlines 2026-2027 | Month-by-Month Calendar',
    date: 'July 11, 2026',
    category: 'list',
    image: '/sr/posts/deadlines.webp',
    excerpt: 'A practical month-by-month calendar of major international scholarship deadlines.',
  },
  {
    id: '16',
    slug: 'un-internship-programme',
    title: 'United Nations Internship Programme 2027 | Fully Funded Opportunities',
    date: 'July 20, 2026',
    category: 'internship',
    country: 'Global',
    image: '/sr/posts/chevening.png',
    excerpt: 'Explore UN internship tracks for students and recent graduates worldwide.',
  },
  {
    id: '17',
    slug: 'google-summer-internship',
    title: 'Google Student Internship Programmes 2027',
    date: 'July 19, 2026',
    category: 'internship',
    country: 'USA',
    image: '/sr/posts/shanghai.webp',
    excerpt: 'Software engineering and related internship opportunities for students at Google.',
  },
];

export function getPostBySlug(slug: string) {
  return posts.find((p) => p.slug === slug);
}

export function getPostsByCategory(category: SrPost['category']) {
  return posts.filter((p) => p.category === category);
}

export function getFeaturedScholarships() {
  return posts.filter((p) => p.featured && p.category === 'scholarship');
}

export function getLatestScholarships() {
  return posts.filter((p) => p.category === 'scholarship');
}
