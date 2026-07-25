export type GuideSection = {
  id: string;
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  note?: string;
};

export type GuideArticle = {
  slug: string;
  intro: string;
  readingTime: string;
  sections: GuideSection[];
  checklist?: string[];
  relatedLinks?: { label: string; to: string }[];
};

export const guideArticles: GuideArticle[] = [
  {
    slug: 'motivation-letter-examples',
    intro:
      'A strong motivation letter explains who you are, why this programme fits, and what you will do with the opportunity. Committees read hundreds of letters. Clarity and honesty beat dramatic claims.',
    readingTime: '12 min read',
    sections: [
      {
        id: 'purpose',
        heading: 'What a motivation letter must do',
        paragraphs: [
          'Your letter should answer three questions without fluff: Why this scholarship or university? Why you? What happens after you graduate?',
          'Keep it between 500 and 800 words unless the provider sets a different limit. One page is often ideal. Use short paragraphs and concrete examples from your studies, work, or community service.',
        ],
      },
      {
        id: 'structure',
        heading: 'Recommended structure',
        bullets: [
          'Opening (2–3 sentences): who you are and the exact programme you are applying for.',
          'Academic path: relevant degrees, projects, grades, or research that prepare you for this opportunity.',
          'Motivation: a specific problem or goal tied to your country, field, or career, not generic “I love learning.”',
          'Fit: why this university, scholarship, or country is the right next step.',
          'Impact: how you will use the training when you return home or advance your field.',
          'Close: thank the committee and confirm you are ready to meet the programme’s demands.',
        ],
      },
      {
        id: 'mistakes',
        heading: 'Common mistakes to avoid',
        bullets: [
          'Copy-pasting the same letter for every scholarship without changing names and goals.',
          'Listing your CV again instead of explaining decisions and impact.',
          'Exaggerating achievements or inventing hardship stories.',
          'Writing only about money. Funding matters, but purpose matters more.',
          'Submitting without a native-level proofread for grammar and tone.',
        ],
      },
      {
        id: 'example-1',
        heading: 'Example angle 1: Public health Masters',
        paragraphs: [
          '“I am a registered nurse from Accra with four years of experience in maternal health clinics. In 2024 I led a community outreach that raised antenatal visit completion by 18% in two districts. I am applying for the MSc Public Health at [University] because its field epidemiology track and partnership with district health systems match the gaps I see in rural Ghana.”',
          'Then connect the scholarship’s leadership or return-home requirements to a concrete plan: training midwives, publishing local data, or joining a ministry programme.',
        ],
      },
      {
        id: 'example-2',
        heading: 'Example angle 2: Engineering / STEM',
        paragraphs: [
          '“My undergraduate thesis on low-cost solar microgrids for off-grid schools in northern Nigeria showed that maintenance, not panels, was the main failure point. I want to deepen power-systems research at [University] and return to build technician training with my home faculty.”',
          'Name labs, supervisors, or modules when you can. Specificity signals real research.',
        ],
      },
      {
        id: 'example-3',
        heading: 'Example angle 3: Education / social policy',
        paragraphs: [
          '“As a secondary school teacher in Kigali, I saw how language transitions between primary and secondary years widen learning gaps. A Masters focused on curriculum design will help me contribute to teacher training materials that respect local languages while preparing students for national exams.”',
        ],
      },
      {
        id: 'example-4',
        heading: 'Example angle 4: Career switch with evidence',
        paragraphs: [
          'If you are changing fields, show transferable proof: certificates, projects, volunteering, or work outcomes. Do not apologise for the switch. Explain the bridge.',
        ],
      },
      {
        id: 'example-5',
        heading: 'Example angle 5: Leadership scholarship (e.g. Chevening-style)',
        paragraphs: [
          'Leadership letters need influence stories: who followed your lead, what changed, and what you learned when it went wrong. One strong story beats five titles.',
        ],
        note: 'Always follow the official word count, prompts, and language requirements. AfriRoar examples are educational templates. Adapt them to your truth.',
      },
    ],
    checklist: [
      'Addressed the official prompts exactly',
      'Named the programme and institution correctly',
      'Included one clear impact story with numbers or outcomes',
      'Explained post-study plans',
      'Proofread by someone else',
      'Saved as PDF/DOCX as required',
    ],
    relatedLinks: [
      { label: 'Browse scholarships', to: '/scholarships' },
      { label: 'Document checklist guide', to: '/post/scholarship-documents-checklist' },
      { label: 'Start an application draft', to: '/dashboard/applications/new' },
    ],
  },
  {
    slug: 'csc-acceptance-letter-guide',
    intro:
      'For many Chinese Government Scholarship (CSC) pathways, a pre-admission or acceptance letter from a Chinese university strengthens your application. It is not always mandatory for every channel, but when it is preferred, starting early matters.',
    readingTime: '10 min read',
    sections: [
      {
        id: 'what-it-is',
        heading: 'Acceptance vs pre-admission letter',
        paragraphs: [
          'A pre-admission / provisional acceptance letter usually means a department or graduate school is willing to host you if funding and final checks succeed.',
          'A formal admission notice may come later through the university’s international student office. CSC timelines and university calendars do not always align. Plan for both.',
        ],
        note: 'Rules differ by university and year. Always confirm on the official CSC and target university pages.',
      },
      {
        id: 'timeline',
        heading: 'Practical timeline',
        bullets: [
          '6–9 months before CSC deadline: shortlist 2–4 universities and supervisors/programmes.',
          '5–7 months out: prepare CV, transcripts, research proposal or study plan, passport scan, and language proof.',
          '4–6 months out: email supervisors / international offices with a concise package.',
          'Follow up politely once after 10–14 days if there is no reply.',
          'Upload whatever letter you receive into your CSC or university portal before the hard deadline.',
        ],
      },
      {
        id: 'email',
        heading: 'How to contact a potential supervisor',
        paragraphs: [
          'Subject line example: “Prospective MSc/PhD applicant, [Your topic], CSC 2027”.',
          'Keep the email under 200 words. Attach a 1–2 page CV and a short research abstract. Show you read their recent papers or the programme curriculum.',
        ],
        bullets: [
          'Who you are and your current degree / institution',
          'One sentence on your research or study interest',
          'Why their lab or programme specifically',
          'That you intend to apply via CSC (or the relevant Chinese scholarship channel)',
          'A polite ask for guidance on pre-admission requirements',
        ],
      },
      {
        id: 'documents',
        heading: 'Documents universities often request',
        bullets: [
          'Passport bio page',
          'Degree certificates and transcripts (with translations if required)',
          'Study plan or research proposal',
          'Two recommendation letters',
          'Language proof (HSK, IELTS/TOEFL, or university waiver rules)',
          'Physical examination form when requested',
        ],
      },
      {
        id: 'tips',
        heading: 'Tips that improve response rates',
        bullets: [
          'Apply to programmes that openly welcome international / CSC applicants.',
          'Do not mass-send identical emails to dozens of professors.',
          'Be honest about your language level and funding status.',
          'Keep screenshots and PDF copies of every letter you receive.',
          'If a university asks for fees, verify through official pages before paying anything.',
        ],
        note: 'AfriRoar does not issue acceptance letters. We help you organise documents and track applications. Final decisions belong to universities and CSC.',
      },
    ],
    checklist: [
      'Shortlist confirmed on official university sites',
      'CV and study plan ready as PDF',
      'Supervisors contacted with tailored emails',
      'Portal deadlines saved in your calendar',
      'Letter stored and named clearly for upload',
    ],
    relatedLinks: [
      { label: 'Scholarship deadlines calendar', to: '/post/scholarship-deadlines-2026-2027' },
      { label: 'Browse scholarships', to: '/scholarships' },
      { label: 'Disclaimer', to: '/disclaimer' },
    ],
  },
  {
    slug: 'scholarship-deadlines-2026-2027',
    intro:
      'Scholarship cycles move every year. Use this month-by-month view as a planning calendar, then confirm each deadline on the official programme website before you apply.',
    readingTime: '8 min read',
    sections: [
      {
        id: 'how-to-use',
        heading: 'How to use this calendar',
        paragraphs: [
          'Treat these windows as typical seasons for major programmes popular with African and international applicants. Exact dates shift. Always verify timezone and whether the deadline is for the online form, references, or hard copies.',
        ],
      },
      {
        id: 'aug-oct',
        heading: 'August – October',
        bullets: [
          'Many Chinese university / CSC-related intakes open or approach peak application windows.',
          'Some European Masters portals begin early rounds.',
          'Start recommendation letter requests now. Professors need lead time.',
        ],
      },
      {
        id: 'nov-jan',
        heading: 'November – January',
        bullets: [
          'Common peak for UK postgraduate scholarships and university funding rounds.',
          'Leadership scholarships (for example Chevening-style cycles) often close in this season. Confirm the current year.',
          'US and Canadian graduate assistantship conversations intensify; GRE/English scores should already be booked.',
        ],
      },
      {
        id: 'feb-apr',
        heading: 'February – April',
        bullets: [
          'Several European and Asian government scholarships publish or close applications.',
          'DAAD and other German funding lines frequently sit in late winter / spring. Check the current call.',
          'Prepare for interviews: leadership stories, study plans, and “why this country” answers.',
        ],
      },
      {
        id: 'may-jul',
        heading: 'May – July',
        bullets: [
          'Results, visa paperwork, and housing become the critical path for autumn intakes.',
          'Late calls and rolling institutional awards still appear. Keep checking AfriRoar listings weekly.',
          'Use quieter weeks to upgrade CV, portfolio, and English writing samples.',
        ],
      },
      {
        id: 'system',
        heading: 'Build a personal deadline system',
        bullets: [
          'One spreadsheet or AfriRoar application drafts with status: researching → drafting → submitted.',
          'Set reminders 30 days, 14 days, and 3 days before each deadline.',
          'Store passport, transcripts, and essays in a single cloud folder with clear file names.',
          'Never wait until the last hour. Portals overload and recommendation letters arrive late.',
        ],
        note: 'AfriRoar listings are curated to help you discover opportunities. Official programme pages remain the source of truth for deadlines.',
      },
    ],
    checklist: [
      'Confirmed current-year deadlines on official sites',
      'English test booked if needed',
      'Recommenders contacted',
      'Passport validity checked (often 6+ months)',
      'Application drafts started on AfriRoar',
    ],
    relatedLinks: [
      { label: 'Browse live scholarships', to: '/scholarships' },
      { label: 'Motivation letter guide', to: '/post/motivation-letter-examples' },
      { label: 'My applications', to: '/dashboard/applications' },
    ],
  },
  {
    slug: 'scholarship-deadlines-list-2026-2027',
    intro:
      'A practical planning calendar for major international scholarship seasons. Confirm every date on the official source before you submit.',
    readingTime: '8 min read',
    sections: [
      {
        id: 'overview',
        heading: 'Same calendar, list view mindset',
        paragraphs: [
          'If you are building a country shortlist, pair this calendar with our Malaysia and Norway lists, then add university-specific awards from each faculty site.',
        ],
      },
      {
        id: 'priorities',
        heading: 'Prioritise by lead time',
        bullets: [
          'Hardest documents first: transcripts, translations, and recommendation letters.',
          'Programmes with interviews need earlier essay drafts.',
          'Visa-heavy destinations need buffer weeks after award letters.',
        ],
      },
      {
        id: 'monthly',
        heading: 'Seasonal checkpoints',
        bullets: [
          'Aug–Oct: Asia / China-related intakes and early Europe',
          'Nov–Jan: UK and many global leadership / Masters awards',
          'Feb–Apr: European government and institutional calls',
          'May–Jul: results, visas, and late rolling awards',
        ],
        note: 'Always verify on the official programme website. AfriRoar helps you plan. Providers set the dates.',
      },
    ],
    relatedLinks: [
      { label: 'Full deadlines guide', to: '/post/scholarship-deadlines-2026-2027' },
      { label: 'Browse scholarships', to: '/scholarships' },
    ],
  },
  {
    slug: 'fully-funded-scholarships-malaysia-2027',
    intro:
      'Malaysia hosts competitive awards for international students across public universities and national schemes. Below is a curated starting list. Verify eligibility, coverage, and deadlines on each official page.',
    readingTime: '9 min read',
    sections: [
      {
        id: 'why-malaysia',
        heading: 'Why students choose Malaysia',
        bullets: [
          'English-taught programmes are widely available.',
          'Living costs are often lower than many Western destinations.',
          'Strong options in engineering, IT, business, Islamic finance, and health sciences.',
        ],
      },
      {
        id: 'programmes',
        heading: 'Programmes and channels to research',
        bullets: [
          'Malaysian International Scholarship (MIS) and related national calls when open.',
          'University of Malaya (UM) international postgraduate awards.',
          'Universiti Putra Malaysia (UPM) graduate research assistantships and scholarships.',
          'UKM, USM, and UTM faculty-funded research positions.',
          'Islamic Development Bank (IsDB) pathways that may include Malaysian host institutions.',
        ],
        note: 'Names and availability change by year. Search the university’s “International Student” or “Scholarship” office pages for the 2027 intake.',
      },
      {
        id: 'prepare',
        heading: 'What to prepare',
        bullets: [
          'Bachelor’s transcripts and certificate for Masters entry',
          'Research proposal for research degrees',
          'English proof (IELTS/TOEFL or university waiver)',
          'Two academic references',
          'Passport with sufficient validity',
        ],
      },
      {
        id: 'next',
        heading: 'Next steps on AfriRoar',
        paragraphs: [
          'Shortlist 3–5 Malaysian programmes, confirm they appear on official sites, then open AfriRoar application drafts so documents and deadlines stay organised.',
        ],
      },
    ],
    relatedLinks: [
      { label: 'Browse scholarships', to: '/scholarships' },
      { label: 'Norway scholarship list', to: '/post/fully-funded-scholarships-norway-2027' },
      { label: 'Disclaimer', to: '/disclaimer' },
    ],
  },
  {
    slug: 'fully-funded-scholarships-norway-2027',
    intro:
      'Norway remains attractive for quality public higher education. Tuition policies and scholarship labels change. Read each university’s international fees page carefully for the year you apply.',
    readingTime: '9 min read',
    sections: [
      {
        id: 'reality',
        heading: 'Important reality check',
        paragraphs: [
          'Norway has adjusted tuition rules for many outside-EU/EEA students in recent years. “Fully funded” may mean a scholarship that covers tuition plus living support, a research contract, or a named award, not automatic free tuition for everyone.',
          'Always confirm cost of living estimates for Oslo, Bergen, Trondheim, and Tromsø.',
        ],
      },
      {
        id: 'where',
        heading: 'Where to look',
        bullets: [
          'University of Oslo, Bergen, NTNU, and Tromsø international Masters pages',
          'Norwegian research council / project-funded PhD positions (often paid positions)',
          'Erasmus Mundus joint Masters that include a Norwegian partner',
          'Faculty vacancies labelled PhD fellow / research fellow',
        ],
      },
      {
        id: 'profile',
        heading: 'Competitive profile signals',
        bullets: [
          'Strong academic transcripts',
          'Clear motivation tied to Norway’s research strengths (energy, ocean, climate, tech, peace studies, etc.)',
          'Relevant methods skills for research degrees',
          'Early contact with supervisors for PhD tracks',
        ],
      },
      {
        id: 'living',
        heading: 'Living costs and work rules',
        paragraphs: [
          'Budget honestly for rent and winter costs. Check current student residence permit rules for part-time work. Do not rely on informal advice from social media alone.',
        ],
        note: 'AfriRoar lists opportunities to help you discover pathways. Norwegian universities and immigration authorities set the official rules.',
      },
    ],
    relatedLinks: [
      { label: 'Browse scholarships', to: '/scholarships' },
      { label: 'Malaysia scholarship list', to: '/post/fully-funded-scholarships-malaysia-2027' },
      { label: 'Motivation letter guide', to: '/post/motivation-letter-examples' },
    ],
  },
  {
    slug: 'scholarship-documents-checklist',
    intro:
      'Most rejected applications fail on paperwork, not talent. Use this checklist to assemble a clean packet before deadlines hit.',
    readingTime: '7 min read',
    sections: [
      {
        id: 'core',
        heading: 'Core documents almost every programme asks for',
        bullets: [
          'Valid passport bio page',
          'Degree certificate(s) and full transcripts',
          'Curriculum vitae (2 pages max for most Masters awards)',
          'Motivation / personal statement',
          'Two or three recommendation letters',
          'English or other language test results when required',
        ],
      },
      {
        id: 'extra',
        heading: 'Often requested extras',
        bullets: [
          'Research proposal (PhD / research Masters)',
          'Portfolio (design, architecture, media)',
          'Proof of work experience or volunteering',
          'Medical / police clearance forms (destination-specific)',
          'Study gap explanation letter if needed',
        ],
      },
      {
        id: 'naming',
        heading: 'File naming that looks professional',
        paragraphs: [
          'Use: Lastname_Firstname_DocumentType_Year.pdf, for example Owusu_Ama_Transcript_2025.pdf. Avoid finalfinal2.docx.',
        ],
      },
      {
        id: 'quality',
        heading: 'Quality control before upload',
        bullets: [
          'Scans are straight, readable, and under portal size limits',
          'Names match your passport spelling',
          'Dates and programme titles are consistent across forms',
          'You kept offline copies of everything submitted',
        ],
        note: 'Upload the same documents into your AfriRoar application drafts so you can reuse them across programmes.',
      },
    ],
    checklist: [
      'Passport valid long enough for the visa window',
      'Transcripts complete (all semesters)',
      'Recommenders confirmed delivery method',
      'Essays fit word limits',
      'PDF versions ready',
    ],
    relatedLinks: [
      { label: 'Start application draft', to: '/dashboard/applications/new' },
      { label: 'Complete your profile', to: '/dashboard/profile' },
      { label: 'Motivation letter guide', to: '/post/motivation-letter-examples' },
    ],
  },
  {
    slug: 'common-scholarship-mistakes',
    intro:
      'Avoidable mistakes sink strong candidates. Review this list before you press submit.',
    readingTime: '6 min read',
    sections: [
      {
        id: 'eligibility',
        heading: 'Skipping eligibility fine print',
        paragraphs: [
          'Nationality, age, field, work experience, and return-home clauses matter. If you are unsure, email the official contact. Do not guess.',
        ],
      },
      {
        id: 'generic',
        heading: 'Generic essays',
        paragraphs: [
          'If you can swap the university name and the letter still works, it is too generic. Name modules, labs, or country-specific goals.',
        ],
      },
      {
        id: 'late',
        heading: 'Starting too late',
        bullets: [
          'Recommenders need weeks, not days',
          'English tests have booking delays',
          'Portals crash near deadlines',
        ],
      },
      {
        id: 'fees',
        heading: 'Falling for fee scams',
        paragraphs: [
          'Be cautious of anyone asking for “agent processing fees” to guarantee a scholarship. Prefer official university and government channels. When unsure, stop and verify.',
        ],
        note: 'Read our Disclaimer for how AfriRoar handles listings and verification expectations.',
      },
      {
        id: 'followup',
        heading: 'No tracking after submit',
        paragraphs: [
          'Save reference numbers, watch email spam folders, and prepare for interviews. Use AfriRoar application statuses so nothing sits forgotten.',
        ],
      },
    ],
    relatedLinks: [
      { label: 'Disclaimer', to: '/disclaimer' },
      { label: 'My applications', to: '/dashboard/applications' },
      { label: 'Browse scholarships', to: '/scholarships' },
    ],
  },
  {
    slug: 'un-internship-programme',
    intro:
      'United Nations internship programmes offer exposure to multilateral work. Most tracks are competitive and requirements vary by duty station and office.',
    readingTime: '7 min read',
    sections: [
      {
        id: 'reality',
        heading: 'What to expect',
        paragraphs: [
          'Many UN internships are unpaid or differently compensated depending on office policy and year. Confirm benefits, visa support, and duration on the official vacancy.',
          'Strong applications show relevant coursework, languages, and evidence you understand the office’s mandate, not only that you “want international experience.”',
        ],
      },
      {
        id: 'prepare',
        heading: 'How to prepare',
        bullets: [
          'Monitor careers.un.org and specific agency sites (UNDP, UNICEF, UNEP, etc.)',
          'Tailor your PHP / profile to keywords in the vacancy',
          'Prepare concise motivation answers tied to SDGs or the office theme',
          'Secure academic enrollment proof when required',
        ],
      },
      {
        id: 'tips',
        heading: 'Practical tips',
        bullets: [
          'Apply broadly across duty stations you can realistically relocate to',
          'Keep a spreadsheet of requisition numbers and dates',
          'Do not pay agents who promise UN placements',
        ],
      },
    ],
    relatedLinks: [
      { label: 'Browse internships', to: '/internships' },
      { label: 'Document checklist', to: '/post/scholarship-documents-checklist' },
    ],
  },
  {
    slug: 'google-summer-internship',
    intro:
      'Google student internship programmes are highly selective. Success usually comes from strong CS fundamentals, projects, and interview preparation, not last-minute applications.',
    readingTime: '6 min read',
    sections: [
      {
        id: 'tracks',
        heading: 'Typical tracks',
        bullets: [
          'Software engineering internships',
          'STEP / early career programmes where available',
          'APM or other specialised student roles in some regions',
        ],
      },
      {
        id: 'prepare',
        heading: 'Preparation that matters',
        bullets: [
          'Data structures and algorithms practice',
          'GitHub or portfolio projects with clear README stories',
          'Resume bullets with impact metrics',
          'Mock interviews with peers or campus clubs',
        ],
      },
      {
        id: 'process',
        heading: 'Application process notes',
        paragraphs: [
          'Openings appear on Google Careers by region and year. Deadlines differ. Apply early, track recruiter email closely, and never share assessment answers publicly.',
        ],
        note: 'AfriRoar highlights internship pathways for discovery. Hiring decisions belong to Google.',
      },
    ],
    relatedLinks: [
      { label: 'Browse internships', to: '/internships' },
      { label: 'Common application mistakes', to: '/post/common-scholarship-mistakes' },
    ],
  },
];

const bySlug = Object.fromEntries(guideArticles.map((a) => [a.slug, a]));

export function getGuideArticle(slug: string) {
  return bySlug[slug];
}
