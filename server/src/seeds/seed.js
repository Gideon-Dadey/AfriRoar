const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const Scholarship = require('../models/Scholarship');
const Application = require('../models/Application');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/scholarhive';

const users = [
  {
    name: 'Admin User',
    email: 'admin@afriroar.com',
    password: 'admin@123',
    role: 'admin',
    isEmailVerified: true,
    profile: {
      country: 'United States',
      bio: 'Platform administrator',
    },
  },
  {
    name: 'John Student',
    email: 'student@scholarhive.com',
    password: 'Student@123456',
    role: 'student',
    isEmailVerified: true,
    profile: {
      country: 'Nigeria',
      educationLevel: 'bachelors',
      fieldOfStudy: 'Computer Science',
      institution: 'University of Lagos',
      bio: 'Aspiring software engineer looking for scholarship opportunities abroad.',
      interests: ['technology', 'engineering', 'computer science'],
      languages: ['English', 'Yoruba'],
      gpa: 3.7,
    },
  },
  {
    name: 'Maria Rodriguez',
    email: 'maria@scholarhive.com',
    password: 'Student@123456',
    role: 'student',
    isEmailVerified: true,
    profile: {
      country: 'Colombia',
      educationLevel: 'masters',
      fieldOfStudy: 'Environmental Science',
      institution: 'Universidad de los Andes',
      bio: 'Environmental researcher seeking graduate funding.',
      interests: ['environment', 'sustainability', 'biology'],
      languages: ['Spanish', 'English'],
      gpa: 3.9,
    },
  },
  {
    name: 'GlobalEd Foundation',
    email: 'provider@scholarhive.com',
    password: 'Provider@123456',
    role: 'provider',
    isEmailVerified: true,
    profile: {
      country: 'United Kingdom',
      bio: 'International education foundation supporting students worldwide.',
    },
  },
  {
    name: 'TechFuture Awards',
    email: 'techfuture@scholarhive.com',
    password: 'Provider@123456',
    role: 'provider',
    isEmailVerified: true,
    profile: {
      country: 'United States',
      bio: 'Technology company providing STEM scholarships.',
    },
  },
];

const createScholarships = (providerIds) => [
  {
    title: 'Global Excellence Scholarship 2025',
    description: 'The Global Excellence Scholarship is a fully-funded program designed to support outstanding international students pursuing undergraduate and graduate degrees at top universities worldwide. This scholarship covers tuition, living expenses, travel, and health insurance for the duration of study. Applicants must demonstrate exceptional academic achievement, leadership potential, and a commitment to making a positive impact in their communities. The program emphasizes diversity, equity, and inclusion, welcoming students from all backgrounds and disciplines.',
    shortDescription: 'Fully-funded scholarship for outstanding international students at top universities worldwide.',
    country: 'United Kingdom',
    level: 'masters',
    field: 'Any Field',
    eligibility: 'International students with GPA 3.5+ from developing countries',
    fundingType: 'full',
    amount: { value: 50000, currency: 'GBP' },
    deadline: new Date('2025-12-31'),
    tags: ['international', 'fully-funded', 'graduate', 'UK'],
    providerId: providerIds[0],
    status: 'approved',
    isFeatured: true,
    applicationUrl: 'https://example.com/apply',
  },
  {
    title: 'STEM Innovation Fellowship',
    description: 'The STEM Innovation Fellowship provides funding to exceptional students pursuing degrees in Science, Technology, Engineering, and Mathematics. This fellowship includes a generous stipend, research funding, mentorship from industry leaders, and networking opportunities with top tech companies. Recipients will join a vibrant community of innovators and gain access to cutting-edge research facilities. The fellowship is open to students at all levels, from undergraduate to PhD, who demonstrate exceptional promise in STEM fields.',
    shortDescription: 'Generous fellowship for STEM students with mentorship and research funding.',
    country: 'United States',
    level: 'phd',
    field: 'STEM',
    eligibility: 'Students enrolled in STEM programs with research experience',
    fundingType: 'full',
    amount: { value: 75000, currency: 'USD' },
    deadline: new Date('2025-09-15'),
    tags: ['STEM', 'research', 'PhD', 'fellowship', 'USA'],
    providerId: providerIds[1],
    status: 'approved',
    isFeatured: true,
    applicationUrl: 'https://example.com/stem-apply',
  },
  {
    title: 'Emerging Leaders Scholarship',
    description: 'The Emerging Leaders Scholarship recognizes and supports students who have demonstrated outstanding leadership in their communities. This scholarship provides partial funding for undergraduate studies and includes a comprehensive leadership development program, networking events, and mentorship opportunities. The program is designed to cultivate the next generation of global leaders who will drive positive change in their communities and beyond.',
    shortDescription: 'Partial scholarship for community leaders pursuing undergraduate studies.',
    country: 'Canada',
    level: 'bachelors',
    field: 'Social Sciences',
    eligibility: 'Students with demonstrated community leadership experience',
    fundingType: 'partial',
    amount: { value: 20000, currency: 'CAD' },
    deadline: new Date('2025-11-01'),
    tags: ['leadership', 'undergraduate', 'social sciences', 'Canada'],
    providerId: providerIds[0],
    status: 'approved',
    isFeatured: true,
  },
  {
    title: 'Women in Technology Scholarship',
    description: 'This scholarship aims to increase gender diversity in the technology sector by supporting women pursuing degrees in Computer Science, Information Technology, Cybersecurity, and related fields. The scholarship provides tuition support, mentorship from female tech leaders, internship opportunities at leading tech companies, and access to exclusive networking events. We believe that diversity drives innovation, and we are committed to empowering the next generation of female technology leaders.',
    shortDescription: 'Empowering women in tech with tuition support and industry mentorship.',
    country: 'United States',
    level: 'bachelors',
    field: 'Computer Science',
    eligibility: 'Female students pursuing technology-related degrees',
    fundingType: 'tuition',
    amount: { value: 30000, currency: 'USD' },
    deadline: new Date('2025-10-15'),
    tags: ['women', 'technology', 'diversity', 'computer science', 'USA'],
    providerId: providerIds[1],
    status: 'approved',
    isFeatured: false,
  },
  {
    title: 'Africa Development Scholarship',
    description: 'The Africa Development Scholarship supports students from African countries pursuing postgraduate education in fields related to sustainable development, agriculture, public health, and governance. This fully-funded scholarship aims to build capacity for sustainable development across the African continent. Recipients will benefit from world-class education, cross-cultural exchange, and a network of alumni working to transform their communities.',
    shortDescription: 'Supporting African students in development-focused postgraduate studies.',
    country: 'Germany',
    level: 'masters',
    field: 'Development Studies',
    eligibility: 'Students from African countries with development experience',
    fundingType: 'full',
    amount: { value: 40000, currency: 'EUR' },
    deadline: new Date('2025-08-30'),
    tags: ['Africa', 'development', 'fully-funded', 'Germany', 'postgraduate'],
    providerId: providerIds[0],
    status: 'approved',
    isFeatured: true,
  },
  {
    title: 'Environmental Sustainability Grant',
    description: 'This research grant supports students conducting groundbreaking research in environmental sustainability, climate change mitigation, renewable energy, and conservation biology. The grant provides research funding, access to laboratories and field stations, and opportunities to present findings at international conferences.',
    shortDescription: 'Research grant for environmental sustainability studies.',
    country: 'Australia',
    level: 'phd',
    field: 'Environmental Science',
    eligibility: 'PhD candidates with environmental research proposals',
    fundingType: 'research',
    amount: { value: 35000, currency: 'AUD' },
    deadline: new Date('2025-07-31'),
    tags: ['environment', 'research', 'sustainability', 'Australia'],
    providerId: providerIds[1],
    status: 'approved',
    isFeatured: false,
  },
  {
    title: 'Creative Arts & Humanities Fellowship',
    description: 'The Creative Arts & Humanities Fellowship supports talented students pursuing studies in visual arts, music, literature, philosophy, history, and cultural studies. This fellowship provides a generous stipend, studio or workspace access, and exhibition or publication opportunities. We celebrate the crucial role of the arts and humanities in building understanding and enriching our shared human experience.',
    shortDescription: 'Fellowship for arts and humanities students with studio access.',
    country: 'France',
    level: 'any',
    field: 'Arts & Humanities',
    eligibility: 'Students with portfolio demonstrating creative excellence',
    fundingType: 'stipend',
    amount: { value: 25000, currency: 'EUR' },
    deadline: new Date('2025-12-01'),
    tags: ['arts', 'humanities', 'creative', 'France', 'fellowship'],
    providerId: providerIds[0],
    status: 'approved',
    isFeatured: false,
  },
  {
    title: 'Healthcare Innovation Scholarship',
    description: 'This scholarship supports aspiring healthcare professionals and researchers from developing countries. It covers tuition and living costs for medical, nursing, and public health programs. Recipients gain access to world-class clinical training and research facilities.',
    shortDescription: 'Supporting healthcare students from developing countries.',
    country: 'Japan',
    level: 'masters',
    field: 'Healthcare',
    eligibility: 'Healthcare students from developing nations, GPA 3.0+',
    fundingType: 'full',
    amount: { value: 45000, currency: 'JPY' },
    deadline: new Date('2025-09-30'),
    tags: ['healthcare', 'medicine', 'Japan', 'fully-funded'],
    providerId: providerIds[1],
    status: 'approved',
    isFeatured: true,
  },
  {
    title: 'Digital Transformation Award',
    description: 'This award recognizes students leading digital transformation initiatives. Open to those studying AI, data science, cybersecurity, and digital business. Includes tuition waiver and industry placement.',
    shortDescription: 'Award for students driving digital transformation.',
    country: 'Singapore',
    level: 'bachelors',
    field: 'Information Technology',
    eligibility: 'Students with digital innovation projects or experience',
    fundingType: 'tuition',
    amount: { value: 15000, currency: 'SGD' },
    deadline: new Date('2025-11-15'),
    tags: ['digital', 'AI', 'technology', 'Singapore'],
    providerId: providerIds[0],
    status: 'pending',
    isFeatured: false,
  },
  {
    title: 'South Asian Merit Scholarship',
    description: 'Merit-based scholarship for students from South Asian countries pursuing undergraduate education in any field. Provides partial tuition coverage and a monthly living stipend. Designed to make quality education accessible regardless of financial background.',
    shortDescription: 'Merit-based partial scholarship for South Asian undergrad students.',
    country: 'United Kingdom',
    level: 'bachelors',
    field: 'Any Field',
    eligibility: 'Students from India, Pakistan, Bangladesh, Sri Lanka, Nepal, Bhutan',
    fundingType: 'partial',
    amount: { value: 12000, currency: 'GBP' },
    deadline: new Date('2025-10-30'),
    tags: ['South Asia', 'merit', 'UK', 'undergraduate'],
    providerId: providerIds[1],
    status: 'approved',
    isFeatured: false,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Scholarship.deleteMany({}),
      Application.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // Create users
    const createdUsers = await User.create(users);
    console.log(`Created ${createdUsers.length} users`);

    // Get provider IDs
    const providerIds = createdUsers
      .filter((u) => u.role === 'provider')
      .map((u) => u._id);

    // Create scholarships
    const scholarships = createScholarships(providerIds);
    const createdScholarships = await Scholarship.create(scholarships);
    console.log(`Created ${createdScholarships.length} scholarships`);

    console.log('\n--- Test Accounts ---');
    console.log('Admin:    admin@afriroar.com / admin@123');
    console.log('Student:  student@scholarhive.com / Student@123456');
    console.log('Student2: maria@scholarhive.com / Student@123456');
    console.log('Provider: provider@scholarhive.com / Provider@123456');
    console.log('Provider2: techfuture@scholarhive.com / Provider@123456');
    console.log('\nSeed complete! ✅');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
