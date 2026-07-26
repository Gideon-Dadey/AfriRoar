const User = require('../models/User');
const Scholarship = require('../models/Scholarship');
const logger = require('../utils/logger');

const monthsFromNow = (months) => {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d;
};

/** Map display level strings to Scholarship.level enum */
const mapLevel = (level) => {
  const s = String(level || '').toLowerCase();
  if (s.includes('phd') && !s.includes('master') && !s.includes('under')) return 'phd';
  if (s.includes('under') && !s.includes('master') && !s.includes('phd')) return 'bachelors';
  if (s.includes('master') && !s.includes('under') && !s.includes('phd')) return 'masters';
  if (s.includes('postdoc')) return 'postdoc';
  if (s.includes('/') || s.includes('multiple') || s.includes('any')) return 'any';
  if (s.includes('phd')) return 'phd';
  if (s.includes('master')) return 'masters';
  if (s.includes('under') || s.includes('bachelor')) return 'bachelors';
  return 'any';
};

/**
 * Full AfriRoar applyable catalogue - mirrors homepage scholarship posts
 * plus flagship Africa programmes (Mastercard, DAAD).
 * Upserted by slug on every server start so existing DBs gain new listings.
 */
const buildCatalog = () => {
  const deadline = monthsFromNow(6);

  return [
    {
      title: 'Chevening Scholarship 2027 (Fully Funded)',
      slug: 'chevening-scholarship-2027',
      description:
        'The Chevening Scholarship is the UK government’s global scholarship programme for future leaders. It funds one-year master’s degrees at UK universities and covers tuition, living allowance, airfare, and arrival packages.\n\nApplicants need a strong undergraduate record, at least two years’ work experience, and a clear leadership and networking plan. Alumni join a worldwide network of professionals across government, business, media, and civil society.\n\nAfriRoar helps you assemble your personal statement, references, and supporting documents before you submit through the official Chevening portal.',
      shortDescription: 'Fully funded UK master’s scholarships for future leaders.',
      country: 'UK',
      level: 'masters',
      field: 'Any',
      eligibility:
        'Citizens of Chevening-eligible countries; bachelor’s degree; 2+ years work experience; leadership potential; return to home country for at least two years after the award.',
      fundingType: 'full',
      amount: { value: 50000, currency: 'GBP' },
      deadline,
      tags: ['uk', 'masters', 'fully-funded', 'africa', 'chevening'],
      status: 'approved',
      isFeatured: true,
      coverImage: '/sr/posts/chevening.png',
      applicationUrl: 'https://www.chevening.org/scholarships/',
    },
    {
      title: 'Romania Government Scholarships 2027 | Fully Funded',
      slug: 'romania-government-scholarships-2027',
      description:
        'The Romanian Government Scholarship programme offers fully funded places for international students at accredited Romanian universities. Awards typically cover tuition, accommodation support, and a monthly stipend for undergraduate, master’s, and doctoral study.\n\nProgrammes are taught in Romanian (with a preparatory language year where required) or in English/French/German depending on the host university. Priority fields often include engineering, agriculture, economics, and medical sciences.\n\nUse AfriRoar to draft your motivation letter, gather transcripts, and track deadlines before applying through the official Romanian Ministry of Foreign Affairs channel.',
      shortDescription: 'Fully funded Romanian Government awards for international students.',
      country: 'Romania',
      level: 'any',
      field: 'Any',
      eligibility:
        'Non-Romanian citizens; strong academic record; age limits may apply by degree level; medical fitness and language requirements as set by the host university.',
      fundingType: 'full',
      amount: { value: 15000, currency: 'EUR' },
      deadline,
      tags: ['romania', 'europe', 'fully-funded', 'undergraduate', 'masters', 'phd'],
      status: 'approved',
      isFeatured: true,
      coverImage: '/sr/posts/romania.webp',
      applicationUrl: 'https://www.mae.ro/',
    },
    {
      title: 'Shanghai Jiao Tong University Scholarships 2027 (Fully Funded)',
      slug: 'shanghai-jiao-tong-university-scholarships-2027',
      description:
        'Shanghai Jiao Tong University (SJTU) offers Chinese Government Scholarship (CSC), Shanghai Government Scholarship, and university-funded awards for outstanding international master’s and PhD candidates.\n\nFunding commonly includes tuition waiver, on-campus accommodation or subsidy, comprehensive medical insurance, and a monthly living stipend. Competitive STEM, business, and medicine programmes are especially popular with African and Asian applicants.\n\nPrepare your research proposal, recommendation letters, and CSC materials on AfriRoar, then submit via the SJTU online application system.',
      shortDescription: 'Fully funded SJTU awards for international master’s and PhD students.',
      country: 'China',
      level: 'any',
      field: 'STEM',
      eligibility:
        'Non-Chinese citizens in good health; bachelor’s for master’s entry / master’s for PhD; strong academic and research record; language requirements (English or Chinese) per programme.',
      fundingType: 'full',
      amount: { value: 25000, currency: 'CNY' },
      deadline,
      tags: ['china', 'sjtu', 'csc', 'masters', 'phd', 'fully-funded'],
      status: 'approved',
      isFeatured: true,
      coverImage: '/sr/posts/shanghai.webp',
      applicationUrl: 'https://isc.sjtu.edu.cn/',
    },
    {
      title: 'Yonsei University Scholarships 2027 | South Korea',
      slug: 'yonsei-university-scholarships-2027',
      description:
        'Yonsei University provides Global Korea Scholarship (GKS) placements, Underwood International College awards, and graduate research scholarships for international students.\n\nPackages range from partial tuition reductions to full tuition plus stipend for high-achieving applicants. Seoul-based programmes emphasise leadership, Korean language support, and industry partnerships.\n\nAfriRoar walks you through personal statements, transcripts, and document uploads before you apply on the Yonsei admissions portal.',
      shortDescription: 'International funding at Yonsei University, South Korea.',
      country: 'South Korea',
      level: 'any',
      field: 'Any',
      eligibility:
        'International students meeting Yonsei academic entry requirements; GKS candidates must satisfy NIIED nationality and age rules where applicable.',
      fundingType: 'full',
      amount: { value: 20000, currency: 'USD' },
      deadline,
      tags: ['korea', 'yonsei', 'gks', 'undergraduate', 'masters'],
      status: 'approved',
      isFeatured: false,
      coverImage: '/sr/posts/yonsei.webp',
      applicationUrl: 'https://admission.yonsei.ac.kr/',
    },
    {
      title: 'Korea University Scholarships 2027 for International Students',
      slug: 'korea-university-scholarships-2027',
      description:
        'Korea University offers Global KU scholarships, GKS quotas, and graduate assistantships covering tuition and living costs for competitive international applicants.\n\nUndergraduate Global KU awards recognise academic excellence; graduate funding often pairs research assistantships with tuition waivers in engineering, business, and social sciences.\n\nBuild your AfriRoar application packet - statement, CV, and recommendations - then complete the Korea University online application by the posted deadline.',
      shortDescription: 'Competitive KU funding packages for international degree seekers.',
      country: 'South Korea',
      level: 'any',
      field: 'Any',
      eligibility:
        'Non-Korean citizens with strong academics; language of instruction requirements (English or Korean) vary by college; GKS rules apply for government tracks.',
      fundingType: 'full',
      amount: { value: 18000, currency: 'USD' },
      deadline,
      tags: ['korea', 'korea-university', 'gks', 'fully-funded'],
      status: 'approved',
      isFeatured: false,
      coverImage: '/sr/posts/korea.webp',
      applicationUrl: 'https://oia.korea.ac.kr/',
    },
    {
      title: 'University of Auckland Scholarship 2027 | New Zealand',
      slug: 'university-of-auckland-scholarship-2027',
      description:
        'The University of Auckland awards University of Auckland International Student Excellence Scholarships, doctoral scholarships, and faculty-funded research awards.\n\nSupport may include tuition contributions, living stipends for doctoral candidates, and relocation assistance. New Zealand’s post-study work pathways make these awards attractive for African STEM and health graduates.\n\nUse AfriRoar to organise transcripts, English scores, and motivation essays ahead of the Auckland online application.',
      shortDescription: 'International excellence and research awards at Auckland.',
      country: 'New Zealand',
      level: 'any',
      field: 'Any',
      eligibility:
        'International fee-paying students meeting programme entry standards; academic merit thresholds apply; some awards require a full offer of place first.',
      fundingType: 'partial',
      amount: { value: 20000, currency: 'NZD' },
      deadline,
      tags: ['new-zealand', 'auckland', 'undergraduate', 'masters', 'phd'],
      status: 'approved',
      isFeatured: false,
      coverImage: '/sr/posts/auckland.png',
      applicationUrl: 'https://www.auckland.ac.nz/en/study/scholarships-and-awards.html',
    },
    {
      title: 'Harvard University Scholarships 2027 (Fully Funded)',
      slug: 'harvard-university-scholarships-2027',
      description:
        'Harvard University meets demonstrated financial need for admitted undergraduates and offers fellowships, assistantships, and school-specific scholarships for graduate students.\n\nUndergraduate aid is need-based and can cover full cost of attendance. Graduate funding depends on the school (GSAS, HKS, HSPH, etc.) and may include stipends, tuition, and health fees.\n\nAfriRoar helps you prepare essays and supporting documents while you pursue admission and aid through Harvard’s official channels.',
      shortDescription: 'Need-based and merit funding for Harvard international students.',
      country: 'USA',
      level: 'any',
      field: 'Any',
      eligibility:
        'Admitted Harvard students; undergraduate aid requires CSS Profile / financial documentation; graduate awards are school- and programme-specific.',
      fundingType: 'full',
      amount: { value: 80000, currency: 'USD' },
      deadline,
      tags: ['usa', 'harvard', 'need-based', 'fully-funded'],
      status: 'approved',
      isFeatured: false,
      coverImage: '/sr/posts/chevening.png',
      applicationUrl: 'https://college.harvard.edu/financial-aid',
    },
    {
      title: 'Gates Cambridge Scholarship 2027 (Fully Funded)',
      slug: 'gates-cambridge-scholarship-2027',
      description:
        'Gates Cambridge Scholarships fund outstanding applicants from outside the UK to pursue full-time postgraduate degrees at the University of Cambridge.\n\nThe award covers University Composition Fee, maintenance allowance, travel, and discretionary funding for academic development. Selection emphasises academic excellence, leadership, and a commitment to improving lives.\n\nDraft your personal statement and research summary on AfriRoar, then apply for admission and the Gates Cambridge award via the Cambridge postgraduate application.',
      shortDescription: 'Prestigious fully funded postgraduate awards at Cambridge.',
      country: 'UK',
      level: 'any',
      field: 'Any',
      eligibility:
        'Citizens of any country outside the UK; applying to an eligible full-time residential postgraduate degree at Cambridge; outstanding academic record.',
      fundingType: 'full',
      amount: { value: 60000, currency: 'GBP' },
      deadline,
      tags: ['uk', 'cambridge', 'gates', 'masters', 'phd', 'fully-funded'],
      status: 'approved',
      isFeatured: false,
      coverImage: '/sr/posts/chevening.png',
      applicationUrl: 'https://www.gatescambridge.org/',
    },
    {
      title: 'Hong Kong PhD Fellowship Scheme 2027 | Fully Funded',
      slug: 'hong-kong-phd-fellowship-2027',
      description:
        'The Hong Kong PhD Fellowship Scheme (HKPFS), established by the Research Grants Council, attracts the best students worldwide to pursue PhD studies at UGC-funded universities in Hong Kong.\n\nFellows receive an annual stipend, conference and research travel allowance, and tuition support as set by the host university. Fields span STEM, humanities, business, and medicine.\n\nPrepare your research proposal and CV on AfriRoar, then nominate through the HKPFS electronic system and the chosen Hong Kong university.',
      shortDescription: 'Competitive PhD fellowships with stipend and travel support in Hong Kong.',
      country: 'Hong Kong',
      level: 'phd',
      field: 'Any',
      eligibility:
        'New full-time PhD applicants to participating Hong Kong universities; outstanding academic performance; research potential; English proficiency as required by the host.',
      fundingType: 'full',
      amount: { value: 331200, currency: 'HKD' },
      deadline,
      tags: ['hong-kong', 'phd', 'hkpfs', 'fully-funded'],
      status: 'approved',
      isFeatured: false,
      coverImage: '/sr/posts/yonsei.webp',
      applicationUrl: 'https://cerg1.ugc.edu.hk/hkpfs/',
    },
    {
      title: 'RMIT University Scholarships 2027 | Australia (Fully Funded)',
      slug: 'rmit-university-scholarships-2027',
      description:
        'RMIT University offers RTP scholarships, RMIT Research Stipend Scholarships, and coursework awards for international master’s and PhD candidates in Melbourne and online programmes.\n\nResearch awards typically include tuition offset and a living stipend. Coursework scholarships may reduce tuition for high-achieving applicants in design, engineering, business, and health.\n\nOrganise your portfolio, academic CV, and statements with AfriRoar before applying through RMIT’s scholarship and admissions portals.',
      shortDescription: 'Research and coursework scholarships for international students at RMIT.',
      country: 'Australia',
      level: 'any',
      field: 'Any',
      eligibility:
        'International students meeting RMIT entry requirements; research applicants need a supervisory match; RTP rules apply for Commonwealth-funded places.',
      fundingType: 'full',
      amount: { value: 34000, currency: 'AUD' },
      deadline,
      tags: ['australia', 'rmit', 'masters', 'phd', 'rtp'],
      status: 'approved',
      isFeatured: false,
      coverImage: '/sr/posts/norway.webp',
      applicationUrl: 'https://www.rmit.edu.au/students/careers-opportunities/scholarships',
    },
    {
      title: 'Mastercard Foundation Scholars Program',
      slug: 'mastercard-foundation-scholars-2027',
      description:
        'The Mastercard Foundation Scholars Program supports academically talented young people from Africa who face financial barriers to higher education. Partner universities across Africa, Europe, and North America provide fully funded undergraduate and master’s pathways.\n\nCoverage typically includes tuition, accommodation, living expenses, leadership training, and career support. Scholars commit to giving back to their communities after graduation.\n\nComplete your AfriRoar draft application, then follow the partner university’s Mastercard Foundation application instructions.',
      shortDescription: 'Flagship Africa-focused fully funded undergraduate and master’s scholarships.',
      country: 'Multiple',
      level: 'bachelors',
      field: 'Any',
      eligibility:
        'African citizens or refugees; academic excellence; demonstrated commitment to community; financial need; age and programme criteria set by each partner university.',
      fundingType: 'full',
      amount: { value: 40000, currency: 'USD' },
      deadline,
      tags: ['africa', 'undergraduate', 'masters', 'fully-funded', 'mastercard'],
      status: 'approved',
      isFeatured: true,
      coverImage: '/sr/posts/motivation.png',
      applicationUrl: 'https://mastercardfdn.org/all/scholars/',
    },
    {
      title: 'DAAD Scholarship for African Students',
      slug: 'daad-africa-scholarship-2027',
      description:
        'The German Academic Exchange Service (DAAD) funds African students for postgraduate study and research in Germany through programmes such as EPOS, Helmut-Schmidt, and development-related postgraduate courses.\n\nTypical benefits include a monthly stipend, travel allowance, health insurance, and study/research costs. Many courses are taught in English; German language support is often included.\n\nUse AfriRoar to prepare your motivation letter, CV, and academic documents before applying via the DAAD portal and your chosen German university.',
      shortDescription: 'German postgraduate funding opportunities for African students.',
      country: 'Germany',
      level: 'masters',
      field: 'STEM',
      eligibility:
        'African graduates with strong academic records; relevant work experience often required for development-related courses; language requirements per programme.',
      fundingType: 'full',
      amount: { value: 12000, currency: 'EUR' },
      deadline,
      tags: ['germany', 'africa', 'masters', 'phd', 'daad'],
      status: 'approved',
      isFeatured: true,
      coverImage: '/sr/posts/norway.webp',
      applicationUrl: 'https://www.daad.de/en/',
    },
  ].map((item) => ({
    ...item,
    level: item.level || mapLevel(item.level),
  }));
};

/**
 * Multi-country careers catalogue - US, Canada, NZ, UK, Africa + remote.
 * Mix of degree and non-degree pathways; upserted by slug on every boot.
 */
const buildJobsCatalog = () => {
  const deadline = monthsFromNow(4);
  const soon = monthsFromNow(2);

  return [
    {
      title: 'Graduate Analyst - Development Finance',
      slug: 'graduate-analyst-development-finance',
      company: 'AfriRoar Partners',
      companyWebsite: 'https://afriror.com',
      shortDescription:
        'Entry-level analyst role supporting scholarship and education finance research across Africa.',
      description:
        'Join a small research team tracking scholarship pipelines, donor programmes, and graduate outcomes.\n\nYou will prepare briefing notes, maintain opportunity databases, and support outreach to universities and employers.\n\nThis is a strong fit for recent graduates who care about education access and can write clearly under deadlines.\n\nCompensation is competitive for Accra market rates, with hybrid flexibility after onboarding.',
      requirements:
        'Bachelor’s degree in economics, public policy, international relations, or related field - or equivalent analytical experience.\nStrong written English.\nComfortable with spreadsheets and remote collaboration tools.\nAfrica-focused interest is a plus.',
      responsibilities:
        'Research and summarise funding programmes.\nUpdate opportunity listings and quality checks.\nDraft short reports for partners.\nSupport virtual information sessions.',
      country: 'Ghana',
      location: 'Accra (hybrid)',
      employmentType: 'full-time',
      workplaceType: 'hybrid',
      field: 'Research & Policy',
      salary: { min: 2500, max: 4000, currency: 'GHS', period: 'month' },
      deadline,
      allowInternalApply: true,
      tags: ['graduate', 'research', 'africa', 'degree-or-experience'],
      status: 'published',
      isFeatured: true,
    },
    {
      title: 'Remote Content Intern - Scholarships Desk',
      slug: 'remote-content-intern-scholarships-desk',
      company: 'AfriRoar Editorial',
      shortDescription:
        'Paid internship writing clear guides and listing summaries for African applicants.',
      description:
        'Help the editorial team turn dense programme pages into practical applicant guides.\n\nYou will draft short explainers, fact-check deadlines, and keep country pages accurate.\n\nRemote-friendly with weekly check-ins. No bachelor’s degree required - strong writing samples matter more.',
      requirements:
        'Enrolled student, HND/diploma holder, or recent graduate.\nExcellent English writing (portfolio or sample required in cover letter).\nReliable internet and attention to detail.\nInterest in higher education and careers.',
      responsibilities:
        'Draft and edit guide sections.\nVerify official links and deadlines.\nSuggest topics based on applicant questions.',
      country: 'Remote',
      location: 'Remote - Africa timezone preferred',
      employmentType: 'internship',
      workplaceType: 'remote',
      field: 'Media & Communications',
      salary: { min: 300, max: 500, currency: 'USD', period: 'month' },
      deadline: soon,
      allowInternalApply: true,
      tags: ['internship', 'remote', 'writing', 'no-degree-required'],
      status: 'published',
      isFeatured: true,
    },
    {
      title: 'Programme Coordinator - University Partnerships',
      slug: 'programme-coordinator-university-partnerships',
      company: 'AfriRoar Partners',
      shortDescription: 'Coordinate university partnerships and applicant support workflows.',
      description:
        'Own day-to-day coordination with partner universities and scholarship desks.\n\nYou will track application cycles, prepare briefing packs, and keep stakeholders updated.\n\nIdeal for organisers who enjoy cross-border education work. Degree preferred but not mandatory if you have proven coordination experience.',
      requirements:
        '2+ years in programme coordination, admissions, NGO operations, or office administration.\nStrong written and verbal communication.\nAbility to manage multiple deadlines.\nDiploma, HND, or bachelor’s accepted.',
      responsibilities:
        'Maintain partner calendars and SLAs.\nPrepare weekly status reports.\nSupport applicant escalations with the ops team.',
      country: 'Kenya',
      location: 'Nairobi',
      employmentType: 'full-time',
      workplaceType: 'onsite',
      field: 'Operations',
      salary: { min: 80000, max: 120000, currency: 'KES', period: 'month' },
      deadline,
      allowInternalApply: true,
      tags: ['coordinator', 'partnerships', 'flexible-education'],
      status: 'published',
      isFeatured: false,
    },
    {
      title: 'Customer Support Associate (Bilingual English)',
      slug: 'customer-support-associate-bilingual-english-usa',
      company: 'Harborline Support Co.',
      companyWebsite: 'https://example.com',
      shortDescription:
        'Full-time customer support role in Austin serving North American clients - diploma or strong experience accepted.',
      description:
        'Harborline runs high-volume support for e-commerce and SaaS brands. We hire for clarity, patience, and ownership - not for a specific degree.\n\nYou will handle tickets and live chat, escalate product bugs cleanly, and hit quality targets with coaching from a team lead.\n\nTraining is paid for the first two weeks. Night and weekend rotation is shared fairly across the floor.\n\nThis role is open to candidates with secondary school certificates, HND/diplomas, or prior call-centre experience. A bachelor’s degree is welcome but not required.',
      requirements:
        'Secondary school certificate, HND, diploma, or equivalent work experience (no bachelor’s required).\nClear spoken and written English.\nAbility to follow SOPs and document cases accurately.\nComfortable with computers and typing ~40 WPM.\nEligible to work in the United States.',
      responsibilities:
        'Respond to customer tickets and chat within SLA.\nTroubleshoot common account and order issues.\nLog patterns and escalate product defects.\nMaintain empathy and accuracy under volume.',
      country: 'United States',
      location: 'Austin, Texas',
      employmentType: 'full-time',
      workplaceType: 'hybrid',
      field: 'Customer Support',
      salary: { min: 42000, max: 52000, currency: 'USD', period: 'year' },
      deadline,
      allowInternalApply: true,
      tags: ['usa', 'support', 'no-degree-required', 'entry-level'],
      status: 'published',
      isFeatured: true,
    },
    {
      title: 'Warehouse Operations Associate',
      slug: 'warehouse-operations-associate-ohio-usa',
      company: 'Midwest Fulfillment Hub',
      shortDescription:
        'On-site warehouse associate role in Columbus - physical work, clear shifts, no degree required.',
      description:
        'Midwest Fulfillment Hub ships consumer goods across the US Midwest. We need reliable associates who take safety seriously and work well in a paced environment.\n\nShifts include receiving, picking, packing, and inventory counts. Safety gear and on-the-job training are provided.\n\nAdvancement to team lead is available based on attendance and accuracy - not academic credentials.',
      requirements:
        'No degree required - secondary school or equivalent preferred.\nAble to lift up to 25 kg / 50 lbs with proper technique.\nReliable attendance and willingness to work rotating shifts.\nBasic English for safety briefings.\nEligible to work in the United States.',
      responsibilities:
        'Receive, scan, and stage inbound inventory.\nPick and pack orders to accuracy targets.\nKeep work areas clean and report hazards.\nSupport cycle counts with the inventory team.',
      country: 'United States',
      location: 'Columbus, Ohio',
      employmentType: 'full-time',
      workplaceType: 'onsite',
      field: 'Logistics & Warehousing',
      salary: { min: 18, max: 22, currency: 'USD', period: 'hour' },
      deadline,
      allowInternalApply: true,
      tags: ['usa', 'warehouse', 'no-degree-required', 'operations'],
      status: 'published',
      isFeatured: false,
    },
    {
      title: 'IT Helpdesk Technician (L1)',
      slug: 'it-helpdesk-technician-l1-atlanta-usa',
      company: 'Pinnacle Campus IT',
      shortDescription:
        'Level-1 IT helpdesk supporting staff and students - CompTIA or hands-on experience valued over degrees.',
      description:
        'Pinnacle Campus IT supports a multi-site education client. Level-1 technicians own password resets, device imaging, ticket triage, and clear handoffs to L2.\n\nWe invest in certifications. A bachelor’s is not required if you can demonstrate troubleshooting skill and customer patience.\n\nHybrid after the first 90 days for strong performers.',
      requirements:
        'Diploma, HND, CompTIA A+/Network+, or 1+ year hands-on IT support experience (bachelor’s optional).\nClear English communication with non-technical users.\nFamiliarity with Windows, Microsoft 365, and ticketing tools.\nEligible to work in the United States.',
      responsibilities:
        'Triage and resolve L1 tickets within SLA.\nImage and deploy laptops for new starters.\nDocument fixes in the knowledge base.\nEscalate complex incidents with full context.',
      country: 'United States',
      location: 'Atlanta, Georgia (hybrid)',
      employmentType: 'full-time',
      workplaceType: 'hybrid',
      field: 'Information Technology',
      salary: { min: 48000, max: 62000, currency: 'USD', period: 'year' },
      deadline: soon,
      allowInternalApply: true,
      tags: ['usa', 'it', 'helpdesk', 'flexible-education'],
      status: 'published',
      isFeatured: true,
    },
    {
      title: 'Sales Development Representative',
      slug: 'sales-development-representative-chicago-usa',
      company: 'Northshore SaaS',
      shortDescription:
        'Outbound SDR role for a B2B SaaS company - hungry communicators welcome; degree not mandatory.',
      description:
        'Northshore SaaS sells workflow software to mid-market operations teams. SDRs book qualified meetings for account executives.\n\nYou will run outbound sequences, qualify inbound leads, and keep CRM hygiene tight. Coaching is weekly and metrics are transparent.\n\nWe hire for coachability and persistence. Prior sales or hospitality experience can substitute for a degree.',
      requirements:
        'Secondary school, diploma, HND, or bachelor’s - any path accepted with strong communication.\nComfortable with phone and email outreach.\nOrganised, resilient, and target-driven.\nEligible to work in the United States.',
      responsibilities:
        'Prospect and book discovery meetings.\nQualify leads against ICP criteria.\nUpdate Salesforce / HubSpot accurately.\nHit weekly activity and meeting targets.',
      country: 'United States',
      location: 'Chicago, Illinois',
      employmentType: 'full-time',
      workplaceType: 'hybrid',
      field: 'Sales',
      salary: { min: 45000, max: 65000, currency: 'USD', period: 'year' },
      deadline,
      allowInternalApply: true,
      tags: ['usa', 'sales', 'sdr', 'no-degree-required'],
      status: 'published',
      isFeatured: false,
    },
    {
      title: 'Administrative Assistant - Healthcare Clinic',
      slug: 'administrative-assistant-healthcare-clinic-toronto',
      company: 'Maple Care Clinics',
      shortDescription:
        'Front-desk and admin support in Toronto - diploma preferred; experience can replace a degree.',
      description:
        'Maple Care Clinics operate multi-doctor practices across Greater Toronto. Administrative assistants keep patient flow smooth, calendars accurate, and records compliant.\n\nYou will greet patients, schedule appointments, process intake forms, and support billing follow-ups under supervision.\n\nWe welcome candidates with office admin diplomas, HNDs, or 2+ years of front-desk experience. A bachelor’s degree is not required.',
      requirements:
        'Office administration diploma, HND, or 2+ years front-desk / admin experience (bachelor’s not required).\nProfessional phone manner and clear written English.\nComfortable with electronic medical record systems (training provided).\nEligible to work in Canada.',
      responsibilities:
        'Manage reception and appointment booking.\nPrepare patient files and intake packets.\nSupport billing and insurance paperwork.\nMaintain a calm, confidential front desk.',
      country: 'Canada',
      location: 'Toronto, Ontario',
      employmentType: 'full-time',
      workplaceType: 'onsite',
      field: 'Healthcare Administration',
      salary: { min: 42000, max: 52000, currency: 'CAD', period: 'year' },
      deadline,
      allowInternalApply: true,
      tags: ['canada', 'admin', 'healthcare', 'flexible-education'],
      status: 'published',
      isFeatured: true,
    },
    {
      title: 'Junior Bookkeeper',
      slug: 'junior-bookkeeper-vancouver-canada',
      company: 'Cascade Ledger Services',
      shortDescription:
        'Junior bookkeeping role in Vancouver - accounting diploma/HND or QuickBooks experience accepted.',
      description:
        'Cascade Ledger Services supports SMEs with monthly bookkeeping, payroll inputs, and year-end prep for accountants.\n\nAs a junior bookkeeper you will reconcile bank feeds, code expenses, and chase missing receipts with clients.\n\nWe train on our stack. Formal accounting degrees are helpful but not mandatory if you have a diploma and clean attention to detail.',
      requirements:
        'Accounting / business diploma, HND, or 1+ year bookkeeping experience (bachelor’s optional).\nFamiliarity with QuickBooks, Xero, or similar.\nAccurate, discreet, and deadline-aware.\nEligible to work in Canada.',
      responsibilities:
        'Reconcile bank and credit card accounts.\nCode expenses and maintain vendor records.\nPrepare monthly packs for senior accountants.\nRespond to client document requests promptly.',
      country: 'Canada',
      location: 'Vancouver, British Columbia (hybrid)',
      employmentType: 'full-time',
      workplaceType: 'hybrid',
      field: 'Finance & Accounting',
      salary: { min: 48000, max: 58000, currency: 'CAD', period: 'year' },
      deadline,
      allowInternalApply: true,
      tags: ['canada', 'bookkeeping', 'finance', 'diploma'],
      status: 'published',
      isFeatured: false,
    },
    {
      title: 'Retail Team Member - Electronics',
      slug: 'retail-team-member-electronics-calgary',
      company: 'Northern Circuit Retail',
      shortDescription:
        'Customer-facing retail role in Calgary - no degree required; product curiosity valued.',
      description:
        'Northern Circuit is a regional electronics retailer. Team members help customers choose devices, process sales, and keep the floor presentation sharp.\n\nShifts include evenings and weekends. Product training is continuous.\n\nWe hire for energy and reliability. Secondary school completion is enough; university degrees are not required.',
      requirements:
        'No degree required - secondary school or equivalent preferred.\nFriendly customer service mindset.\nAble to stand for long periods and lift light stock.\nEligible to work in Canada.',
      responsibilities:
        'Greet and assist customers on the floor.\nProcess sales and returns accurately.\nRestock and maintain displays.\nMeet weekly attach and NPS goals with coaching.',
      country: 'Canada',
      location: 'Calgary, Alberta',
      employmentType: 'part-time',
      workplaceType: 'onsite',
      field: 'Retail',
      salary: { min: 17, max: 20, currency: 'CAD', period: 'hour' },
      deadline: soon,
      allowInternalApply: true,
      tags: ['canada', 'retail', 'no-degree-required', 'part-time'],
      status: 'published',
      isFeatured: false,
    },
    {
      title: 'Construction Site Labourer',
      slug: 'construction-site-labourer-auckland-nz',
      company: 'Harbourview Civils',
      shortDescription:
        'Site labourer roles in Auckland - trade interest welcome; no tertiary degree required.',
      description:
        'Harbourview Civils builds civil and light commercial projects across Auckland. Site labourers support carpenters and supervisors with prep, material moves, and site housekeeping.\n\nPPE is supplied. Safety induction is mandatory before first shift.\n\nThis pathway is ideal for candidates who prefer hands-on work. A university degree is not required; willingness to learn and follow site rules is.',
      requirements:
        'No degree required.\nPhysically fit and comfortable outdoors in varied weather.\nAble to follow safety instructions precisely.\nBasic English for toolbox talks.\nEligible to work in New Zealand.',
      responsibilities:
        'Assist skilled trades with site setup and cleanup.\nMove materials safely as directed.\nMaintain tidy work areas and report hazards.\nAttend daily toolbox meetings.',
      country: 'New Zealand',
      location: 'Auckland',
      employmentType: 'full-time',
      workplaceType: 'onsite',
      field: 'Construction & Trades',
      salary: { min: 25, max: 30, currency: 'NZD', period: 'hour' },
      deadline,
      allowInternalApply: true,
      tags: ['new-zealand', 'construction', 'no-degree-required', 'trades'],
      status: 'published',
      isFeatured: true,
    },
    {
      title: 'Hospitality Front of House - Café',
      slug: 'hospitality-front-of-house-wellington-nz',
      company: 'Southern Roast Café Group',
      shortDescription:
        'Café front-of-house in Wellington - hospitality experience valued over academic credentials.',
      description:
        'Southern Roast runs busy city cafés. Front-of-house staff take orders, manage the till, and keep service warm and fast during peaks.\n\nWe provide barista basics training for strong hires. Weekend availability is a plus.\n\nNo tertiary degree required - prior café, restaurant, or retail experience helps.',
      requirements:
        'No degree required - prior hospitality or retail experience preferred.\nCalm under pressure and guest-focused.\nBasic cash handling and food hygiene awareness (training available).\nEligible to work in New Zealand.',
      responsibilities:
        'Take orders and process payments accurately.\nDeliver excellent guest service during rush periods.\nKeep the floor and counters clean.\nSupport opening/closing checklists.',
      country: 'New Zealand',
      location: 'Wellington',
      employmentType: 'part-time',
      workplaceType: 'onsite',
      field: 'Hospitality',
      salary: { min: 23, max: 27, currency: 'NZD', period: 'hour' },
      deadline,
      allowInternalApply: true,
      tags: ['new-zealand', 'hospitality', 'no-degree-required'],
      status: 'published',
      isFeatured: false,
    },
    {
      title: 'Junior Digital Marketing Assistant',
      slug: 'junior-digital-marketing-assistant-christchurch-nz',
      company: 'Kiwi Reach Agency',
      shortDescription:
        'Junior marketing assistant in Christchurch - portfolio and certificates can replace a degree.',
      description:
        'Kiwi Reach is a boutique agency helping local brands with social content, email campaigns, and basic SEO.\n\nAs a junior assistant you will schedule posts, pull simple reports, and help with asset organisation. Senior strategists own creative direction.\n\nGoogle Digital Garage, Meta Blueprint, or a strong personal portfolio can substitute for a marketing degree.',
      requirements:
        'Marketing diploma, digital certificates, HND, or demonstrable portfolio (bachelor’s optional).\nOrganised writer with basic Canva / Google Analytics familiarity.\nCurious about performance metrics.\nEligible to work in New Zealand.',
      responsibilities:
        'Schedule and publish approved social content.\nAssemble weekly performance snapshots.\nMaintain asset libraries and brand folders.\nSupport campaign launches under senior guidance.',
      country: 'New Zealand',
      location: 'Christchurch (hybrid)',
      employmentType: 'full-time',
      workplaceType: 'hybrid',
      field: 'Marketing',
      salary: { min: 52000, max: 62000, currency: 'NZD', period: 'year' },
      deadline: soon,
      allowInternalApply: true,
      tags: ['new-zealand', 'marketing', 'flexible-education', 'junior'],
      status: 'published',
      isFeatured: true,
    },
    {
      title: 'Remote Data Entry Specialist',
      slug: 'remote-data-entry-specialist-uk-remote',
      company: 'Clearform Data Services',
      shortDescription:
        'Fully remote data entry for UK business hours - accuracy first; no degree required.',
      description:
        'Clearform digitises forms and CRM updates for professional services clients. Specialists enter structured data, flag exceptions, and hit accuracy KPIs.\n\nWork is fully remote with UK-overlap hours. Equipment stipend available after probation.\n\nWe do not require a university degree. Reliable internet, typing speed, and integrity are the bar.',
      requirements:
        'No degree required - secondary school or diploma preferred.\nTyping accuracy over 98% on sample tests.\nReliable internet and quiet workspace.\nEligible to invoice / work with UK clients (discuss status at interview).',
      responsibilities:
        'Enter and validate structured records.\nFlag incomplete or inconsistent source files.\nMeet daily volume and accuracy targets.\nFollow data protection procedures strictly.',
      country: 'United Kingdom',
      location: 'Remote (UK hours)',
      employmentType: 'contract',
      workplaceType: 'remote',
      field: 'Operations',
      salary: { min: 12, max: 15, currency: 'GBP', period: 'hour' },
      deadline,
      allowInternalApply: true,
      tags: ['uk', 'remote', 'data-entry', 'no-degree-required'],
      status: 'published',
      isFeatured: false,
    },
    {
      title: 'Community Health Outreach Worker',
      slug: 'community-health-outreach-worker-lagos',
      company: 'CivicCare Outreach',
      shortDescription:
        'Community outreach in Lagos - certificate or community experience accepted; bachelor’s not mandatory.',
      description:
        'CivicCare runs neighbourhood health education campaigns on maternal health and vaccination awareness.\n\nOutreach workers engage households, log visits, and escalate clinical concerns to nurses. Cultural sensitivity and reliability matter more than academic titles.\n\nCommunity health certificates, nursing assistant training, or NGO field experience are all accepted pathways.',
      requirements:
        'Community health certificate, HND, nursing assistant training, or 1+ year community outreach experience (bachelor’s optional).\nFluent in English and a local language relevant to assignment areas.\nComfortable with door-to-door fieldwork.\nBased in / willing to work in Lagos.',
      responsibilities:
        'Conduct scheduled household visits.\nDeliver approved health education messages.\nCapture visit data accurately on mobile forms.\nEscalate clinical red flags to supervisors.',
      country: 'Nigeria',
      location: 'Lagos',
      employmentType: 'full-time',
      workplaceType: 'onsite',
      field: 'Community Health',
      salary: { min: 180000, max: 250000, currency: 'NGN', period: 'month' },
      deadline,
      allowInternalApply: true,
      tags: ['nigeria', 'health', 'community', 'flexible-education'],
      status: 'published',
      isFeatured: true,
    },
    {
      title: 'Junior Software QA Tester',
      slug: 'junior-software-qa-tester-berlin-remote',
      company: 'Nordic Soft Labs',
      shortDescription:
        'Remote-friendly junior QA role - bootcamp or self-taught testers welcome alongside degree holders.',
      description:
        'Nordic Soft Labs builds B2B productivity tools. Junior QA testers write test cases, run regression suites, and log clear bug reports.\n\nMentorship is built into the first six months. ISTQB Foundation or a solid portfolio of test write-ups can replace a computer science degree.\n\nCore hours overlap with CET; fully remote within approved countries.',
      requirements:
        'CS diploma, bootcamp, ISTQB, or demonstrable testing portfolio (bachelor’s optional).\nClear written English for bug reports.\nBasic familiarity with browsers, APIs, and Git.\nLegal right to work remotely for an EU-facing employer (confirm at interview).',
      responsibilities:
        'Execute manual test cases each sprint.\nLog reproducible bugs with steps and severity.\nRetest fixes and update regression packs.\nPair with developers on acceptance criteria.',
      country: 'Germany',
      location: 'Berlin / remote (CET)',
      employmentType: 'full-time',
      workplaceType: 'remote',
      field: 'Software Quality Assurance',
      salary: { min: 32000, max: 42000, currency: 'EUR', period: 'year' },
      deadline,
      allowInternalApply: true,
      tags: ['germany', 'qa', 'remote', 'flexible-education'],
      status: 'published',
      isFeatured: false,
    },
    {
      title: 'Farm Operations Assistant',
      slug: 'farm-operations-assistant-canterbury-nz',
      company: 'Greenridge Agri Co-op',
      shortDescription:
        'Seasonal-to-permanent farm operations support in Canterbury - practical skills over degrees.',
      description:
        'Greenridge supports dairy and mixed farms with seasonal labour coordination and on-farm assistance.\n\nAssistants help with animal care routines, equipment checks, and harvest logistics under experienced supervisors.\n\nAgricultural certificates help but are not mandatory. Reliability, fitness, and respect for farm safety culture are essential.',
      requirements:
        'No degree required - agricultural certificate or farm experience preferred.\nPhysically capable of outdoor work.\nWilling to start early and follow biosecurity rules.\nEligible to work in New Zealand.',
      responsibilities:
        'Support daily animal and paddock routines.\nAssist with equipment checks and cleaning.\nHelp load and record harvest or feed movements.\nReport animal welfare concerns immediately.',
      country: 'New Zealand',
      location: 'Canterbury',
      employmentType: 'temporary',
      workplaceType: 'onsite',
      field: 'Agriculture',
      salary: { min: 24, max: 28, currency: 'NZD', period: 'hour' },
      deadline,
      allowInternalApply: true,
      tags: ['new-zealand', 'agriculture', 'no-degree-required', 'temporary'],
      status: 'published',
      isFeatured: false,
    },
    {
      title: 'Remote Virtual Assistant',
      slug: 'remote-virtual-assistant-global',
      company: 'Atlas Executive Support',
      shortDescription:
        'Remote VA supporting founders across time zones - organisation and English first; degree optional.',
      description:
        'Atlas matches skilled virtual assistants with startups and consultants. You will manage calendars, inbox triage, travel research, and light research briefs.\n\nTools include Google Workspace, Notion, and Slack. We measure turnaround time and communication quality.\n\nA university degree is optional. Proven admin experience, HND/diploma, or strong freelance references are enough.',
      requirements:
        'Admin diploma, HND, or 1+ year executive / virtual assistant experience (bachelor’s optional).\nExcellent written English.\nProactive, discreet, and timezone-flexible.\nStable internet and professional home setup.',
      responsibilities:
        'Manage calendars and meeting logistics.\nTriage email and draft routine replies.\nPrepare simple research summaries.\nKeep task boards current for principals.',
      country: 'Remote',
      location: 'Remote - global (overlap with GMT / EST)',
      employmentType: 'contract',
      workplaceType: 'remote',
      field: 'Administration',
      salary: { min: 8, max: 15, currency: 'USD', period: 'hour' },
      deadline,
      allowInternalApply: true,
      tags: ['remote', 'virtual-assistant', 'flexible-education', 'contract'],
      status: 'published',
      isFeatured: true,
    },
  ];
};

const bootstrapDemoData = async () => {
  try {
    let provider = await User.findOne({ role: 'provider' });
    if (!provider) {
      provider = await User.create({
        name: 'AfriRoar Programs',
        email: 'provider@afriror.com',
        password: 'Provider@123456',
        role: 'provider',
        isEmailVerified: true,
      });
    }

    const catalog = buildCatalog();
    let created = 0;
    let refreshed = 0;

    for (const item of catalog) {
      let existing = await Scholarship.findOne({ slug: item.slug });

      // Repair rows whose slug was auto-mangled from the title
      if (!existing) {
        existing = await Scholarship.findOne({
          title: item.title,
          slug: { $ne: item.slug },
        });
        if (existing) {
          existing.slug = item.slug;
        }
      }

      if (!existing) {
        await Scholarship.create({
          ...item,
          providerId: provider._id,
          approvedAt: new Date(),
        });
        created += 1;
        continue;
      }

      // Keep applyable: refresh expired deadlines and fill missing catalogue fields.
      let dirty = false;
      if (existing.slug !== item.slug) {
        existing.slug = item.slug;
        dirty = true;
      }
      if (!existing.deadline || existing.deadline < new Date()) {
        existing.deadline = item.deadline;
        dirty = true;
      }
      if (existing.status !== 'approved') {
        existing.status = 'approved';
        dirty = true;
      }
      if (!existing.coverImage && item.coverImage) {
        existing.coverImage = item.coverImage;
        dirty = true;
      }
      if (!existing.applicationUrl && item.applicationUrl) {
        existing.applicationUrl = item.applicationUrl;
        dirty = true;
      }
      if (!existing.description || existing.description.length < 120) {
        existing.description = item.description;
        dirty = true;
      }
      if (!existing.eligibility && item.eligibility) {
        existing.eligibility = item.eligibility;
        dirty = true;
      }
      if (dirty) {
        await existing.save();
        refreshed += 1;
      }
    }

    // Remove duplicate mangled-slug leftovers that point at the same titles
    const catalogTitles = catalog.map((c) => c.title);
    const catalogSlugs = catalog.map((c) => c.slug);
    const dupes = await Scholarship.find({
      title: { $in: catalogTitles },
      slug: { $nin: catalogSlugs },
    });
    if (dupes.length) {
      await Scholarship.deleteMany({ _id: { $in: dupes.map((d) => d._id) } });
      logger.info(`Removed ${dupes.length} duplicate scholarship rows with mangled slugs`);
    }

    if (created || refreshed) {
      logger.info(
        `AfriRoar scholarship catalogue synced: ${created} created, ${refreshed} refreshed (${catalog.length} total in catalogue)`,
      );
    }

    // Seed / refresh published jobs for the careers board (multi-country catalogue)
    const Job = require('../models/Job');
    const sampleJobs = buildJobsCatalog();

    let jobsCreated = 0;
    let jobsRefreshed = 0;
    for (const item of sampleJobs) {
      const existingJob = await Job.findOne({ slug: item.slug });
      if (!existingJob) {
        await Job.create({ ...item, createdBy: provider._id });
        jobsCreated += 1;
      } else {
        let dirty = false;
        const syncFields = [
          'title',
          'company',
          'companyWebsite',
          'shortDescription',
          'description',
          'requirements',
          'responsibilities',
          'country',
          'location',
          'employmentType',
          'workplaceType',
          'field',
          'salary',
          'applicationUrl',
          'allowInternalApply',
          'tags',
          'status',
          'isFeatured',
        ];
        for (const key of syncFields) {
          if (item[key] !== undefined) {
            existingJob[key] = item[key];
            dirty = true;
          }
        }
        if (!existingJob.deadline || existingJob.deadline < new Date()) {
          existingJob.deadline = item.deadline;
          dirty = true;
        }
        if (dirty) {
          await existingJob.save();
          jobsRefreshed += 1;
        }
      }
    }
    if (jobsCreated || jobsRefreshed) {
      logger.info(
        `AfriRoar jobs catalogue synced: ${jobsCreated} created, ${jobsRefreshed} refreshed (${sampleJobs.length} total in catalogue)`,
      );
    }
  } catch (error) {
    logger.warn(`Demo data bootstrap skipped: ${error.message}`);
  }
};

module.exports = { bootstrapDemoData, buildCatalog, buildJobsCatalog };
