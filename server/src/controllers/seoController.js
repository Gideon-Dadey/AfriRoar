const Scholarship = require('../models/Scholarship');
const Content = require('../models/Content');
const Job = require('../models/Job');
const config = require('../config');
const catchAsync = require('../utils/catchAsync');

const SITE = config.clientUrl || 'https://afriroar.onrender.com';

const robotsTxt = (_req, res) => {
  res.type('text/plain').send(
    [
      'User-agent: *',
      'Allow: /',
      'Disallow: /dashboard',
      'Disallow: /api/',
      '',
      `Sitemap: ${SITE}/sitemap.xml`,
      '',
    ].join('\n')
  );
};

const sitemapXml = catchAsync(async (_req, res) => {
  const [scholarships, contents, jobs] = await Promise.all([
    Scholarship.find({ status: 'approved' }).select('slug updatedAt').lean(),
    Content.find({ status: 'published' }).select('slug category updatedAt publishedAt').lean().catch(() => []),
    Job.find({ status: 'published' }).select('slug updatedAt').lean().catch(() => []),
  ]);

  const staticPaths = [
    '',
    '/scholarships',
    '/jobs',
    '/internships',
    '/guides',
    '/lists',
    '/countries',
    '/about',
    '/contact',
    '/pricing',
    '/terms',
    '/privacy',
    '/disclaimer',
  ];

  const urls = [];

  for (const p of staticPaths) {
    urls.push({
      loc: `${SITE}${p || '/'}`,
      changefreq: p === '' || p === '/scholarships' ? 'daily' : 'weekly',
      priority: p === '' ? '1.0' : p === '/scholarships' ? '0.9' : '0.6',
    });
  }

  for (const s of scholarships) {
    urls.push({
      loc: `${SITE}/scholarships/${s.slug}`,
      lastmod: (s.updatedAt || new Date()).toISOString().slice(0, 10),
      changefreq: 'weekly',
      priority: '0.8',
    });
  }

  for (const j of jobs || []) {
    urls.push({
      loc: `${SITE}/jobs/${j.slug}`,
      lastmod: (j.updatedAt || new Date()).toISOString().slice(0, 10),
      changefreq: 'weekly',
      priority: '0.75',
    });
  }

  for (const c of contents || []) {
    const base =
      c.category === 'internship'
        ? '/internships'
        : c.category === 'list' || c.category === 'job'
          ? '/lists'
          : '/guides';
    urls.push({
      loc: `${SITE}/post/${c.slug}`,
      lastmod: (c.updatedAt || c.publishedAt || new Date()).toISOString().slice(0, 10),
      changefreq: 'monthly',
      priority: '0.5',
    });
    // Also list category-style URLs when they match public routes
    void base;
  }

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(
      (u) =>
        `<url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}<changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`
    ),
    '</urlset>',
  ].join('');

  res.type('application/xml').send(body);
});

module.exports = { robotsTxt, sitemapXml };
