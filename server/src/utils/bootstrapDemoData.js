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
 * Full AfriRoar applyable catalogue — mirrors homepage scholarship posts
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
        'Korea University offers Global KU scholarships, GKS quotas, and graduate assistantships covering tuition and living costs for competitive international applicants.\n\nUndergraduate Global KU awards recognise academic excellence; graduate funding often pairs research assistantships with tuition waivers in engineering, business, and social sciences.\n\nBuild your AfriRoar application packet—statement, CV, and recommendations—then complete the Korea University online application by the posted deadline.',
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

    // Seed a few published jobs for the careers board
    const Job = require('../models/Job');
    const jobDeadline = monthsFromNow(3);
    const sampleJobs = [
      {
        title: 'Graduate Analyst — Development Finance',
        slug: 'graduate-analyst-development-finance',
        company: 'AfriRoar Partners',
        shortDescription: 'Entry-level analyst role supporting scholarship and education finance research across Africa.',
        description:
          'Join a small research team tracking scholarship pipelines, donor programmes, and graduate outcomes.\n\nYou will prepare briefing notes, maintain opportunity databases, and support outreach to universities and employers.\n\nThis is a strong fit for recent graduates who care about education access and can write clearly under deadlines.',
        requirements:
          'Bachelor’s degree in economics, public policy, international relations, or related field.\nStrong written English.\nComfortable with spreadsheets and remote collaboration tools.\nAfrica-focused interest is a plus.',
        responsibilities:
          'Research and summarise funding programmes.\nUpdate opportunity listings and quality checks.\nDraft short reports for partners.\nSupport virtual information sessions.',
        country: 'Ghana',
        location: 'Accra (hybrid)',
        employmentType: 'full-time',
        workplaceType: 'hybrid',
        field: 'Research & Policy',
        deadline: jobDeadline,
        allowInternalApply: true,
        tags: ['graduate', 'research', 'africa'],
        status: 'published',
        isFeatured: true,
      },
      {
        title: 'Remote Content Intern — Scholarships Desk',
        slug: 'remote-content-intern-scholarships-desk',
        company: 'AfriRoar Editorial',
        shortDescription: 'Paid internship writing clear guides and listing summaries for African applicants.',
        description:
          'Help the editorial team turn dense programme pages into practical applicant guides.\n\nYou will draft short explainers, fact-check deadlines, and keep country pages accurate.\n\nRemote-friendly with weekly check-ins.',
        requirements:
          'Enrolled student or recent graduate.\nExcellent English writing.\nReliable internet and attention to detail.\nInterest in higher education and careers.',
        responsibilities:
          'Draft and edit guide sections.\nVerify official links and deadlines.\nSuggest topics based on applicant questions.',
        country: 'Remote',
        location: 'Remote — Africa timezone preferred',
        employmentType: 'internship',
        workplaceType: 'remote',
        field: 'Media & Communications',
        deadline: jobDeadline,
        allowInternalApply: true,
        tags: ['internship', 'remote', 'writing'],
        status: 'published',
        isFeatured: true,
      },
      {
        title: 'Programme Coordinator — University Partnerships',
        slug: 'programme-coordinator-university-partnerships',
        company: 'AfriRoar Partners',
        shortDescription: 'Coordinate university partnerships and applicant support workflows.',
        description:
          'Own day-to-day coordination with partner universities and scholarship desks.\n\nYou will track application cycles, prepare briefing packs, and keep stakeholders updated.\n\nIdeal for organisers who enjoy cross-border education work.',
        requirements:
          '2+ years in programme coordination, admissions, or NGO operations.\nStrong written and verbal communication.\nAbility to manage multiple deadlines.',
        responsibilities:
          'Maintain partner calendars and SLAs.\nPrepare weekly status reports.\nSupport applicant escalations with the ops team.',
        country: 'Kenya',
        location: 'Nairobi',
        employmentType: 'full-time',
        workplaceType: 'onsite',
        field: 'Operations',
        deadline: jobDeadline,
        allowInternalApply: true,
        tags: ['coordinator', 'partnerships'],
        status: 'published',
        isFeatured: false,
      },
    ];

    let jobsCreated = 0;
    for (const item of sampleJobs) {
      const existingJob = await Job.findOne({ slug: item.slug });
      if (!existingJob) {
        await Job.create({ ...item, createdBy: provider._id });
        jobsCreated += 1;
      } else if (!existingJob.deadline || existingJob.deadline < new Date()) {
        existingJob.deadline = item.deadline;
        existingJob.status = 'published';
        await existingJob.save();
      }
    }
    if (jobsCreated) {
      logger.info(`AfriRoar jobs catalogue: ${jobsCreated} sample job(s) created`);
    }
  } catch (error) {
    logger.warn(`Demo data bootstrap skipped: ${error.message}`);
  }
};

module.exports = { bootstrapDemoData, buildCatalog };
