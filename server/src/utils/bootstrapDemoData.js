const User = require('../models/User');
const Scholarship = require('../models/Scholarship');
const logger = require('../utils/logger');

const bootstrapDemoData = async () => {
  try {
    const scholarshipCount = await Scholarship.countDocuments();
    if (scholarshipCount > 0) return;

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

    const deadline = new Date();
    deadline.setMonth(deadline.getMonth() + 6);

    const demos = [
      {
        title: 'Chevening Scholarship 2027 (Fully Funded)',
        slug: 'chevening-scholarship-2027',
        description:
          'The Chevening Scholarship is the UK government’s global scholarship programme for future leaders. Fully funded master’s degrees at UK universities for outstanding candidates from around the world, including Africa.',
        shortDescription: 'Fully funded UK master’s scholarships for future leaders.',
        country: 'UK',
        level: 'masters',
        field: 'Any',
        eligibility: 'Citizens of Chevening-eligible countries with leadership potential and a bachelor’s degree.',
        fundingType: 'full',
        amount: { value: 50000, currency: 'GBP' },
        deadline,
        tags: ['uk', 'masters', 'fully-funded', 'africa'],
        status: 'approved',
        isFeatured: true,
        coverImage: '/sr/posts/chevening.png',
      },
      {
        title: 'Mastercard Foundation Scholars Program',
        slug: 'mastercard-foundation-scholars-2027',
        description:
          'Scholarships for academically talented young people from Africa facing financial barriers to higher education. Covers tuition, living expenses, and leadership development.',
        shortDescription: 'Flagship Africa-focused fully funded undergraduate and master’s scholarships.',
        country: 'Multiple',
        level: 'bachelors',
        field: 'Any',
        eligibility: 'African citizens with academic excellence and demonstrated commitment to community.',
        fundingType: 'full',
        amount: { value: 40000, currency: 'USD' },
        deadline,
        tags: ['africa', 'undergraduate', 'masters', 'fully-funded'],
        status: 'approved',
        isFeatured: true,
        coverImage: '/sr/posts/motivation.png',
      },
      {
        title: 'DAAD Scholarship for African Students',
        slug: 'daad-africa-scholarship-2027',
        description:
          'German Academic Exchange Service scholarships supporting African students pursuing postgraduate study in Germany across STEM, social sciences, and development fields.',
        shortDescription: 'German postgraduate funding opportunities for African students.',
        country: 'Germany',
        level: 'masters',
        field: 'STEM',
        eligibility: 'African graduates with strong academic records applying to German universities.',
        fundingType: 'full',
        amount: { value: 12000, currency: 'EUR' },
        deadline,
        tags: ['germany', 'africa', 'masters', 'phd'],
        status: 'approved',
        isFeatured: true,
        coverImage: '/sr/posts/norway.webp',
      },
    ];

    await Scholarship.insertMany(
      demos.map((item) => ({
        ...item,
        providerId: provider._id,
      }))
    );

    logger.info(`Bootstrapped ${demos.length} demo scholarships for AfriRoar MVP`);
  } catch (error) {
    logger.warn(`Demo data bootstrap skipped: ${error.message}`);
  }
};

module.exports = { bootstrapDemoData };
