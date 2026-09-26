/**
 * Skillsfy Automated Sitemap Synchronizer
 * Automatically syncs core pages and published articles from published-articles.json into sitemap.xml.
 */

const fs = require('fs');
const path = require('path');

function generateSitemap() {
  const rootDir = path.resolve(__dirname, '..');
  const articlesJsonPath = path.join(rootDir, 'published-articles.json');
  const sitemapPath = path.join(rootDir, 'sitemap.xml');

  const today = new Date().toISOString().split('T')[0];

  let articles = [];
  if (fs.existsSync(articlesJsonPath)) {
    try {
      articles = JSON.parse(fs.readFileSync(articlesJsonPath, 'utf8'));
    } catch (e) {
      console.error('Error parsing published-articles.json:', e);
    }
  }

  const staticPages = [
    {
      loc: 'https://skillsfy.in/',
      priority: '1.0',
      changefreq: 'daily',
      image: 'https://skillsfy.in/assets/logo.png',
      imageTitle: 'Skillsfy - Institute of Technology'
    },
    {
      loc: 'https://skillsfy.in/lp1',
      priority: '0.9',
      changefreq: 'daily',
      image: 'https://skillsfy.in/assets/logo.png',
      imageTitle: 'Skillsfy AI Mastery & Career Workshop'
    },
    {
      loc: 'https://skillsfy.in/courses',
      priority: '0.8',
      changefreq: 'weekly',
      image: 'https://skillsfy.in/assets/logo.png',
      imageTitle: 'Skillsfy Industry Courses & Certifications'
    },
    {
      loc: 'https://skillsfy.in/course-details',
      priority: '0.8',
      changefreq: 'weekly'
    },
    {
      loc: 'https://skillsfy.in/about',
      priority: '0.7',
      changefreq: 'monthly',
      image: 'https://skillsfy.in/assets/logo.png',
      imageTitle: 'About Skillsfy Institute'
    },
    {
      loc: 'https://skillsfy.in/contact',
      priority: '0.7',
      changefreq: 'monthly'
    },
    {
      loc: 'https://skillsfy.in/verify',
      priority: '0.6',
      changefreq: 'monthly'
    },
    {
      loc: 'https://skillsfy.in/lms',
      priority: '0.7',
      changefreq: 'weekly'
    },
    {
      loc: 'https://skillsfy.in/privacy-policy',
      priority: '0.3',
      changefreq: 'yearly'
    },
    {
      loc: 'https://skillsfy.in/terms',
      priority: '0.3',
      changefreq: 'yearly'
    },
    {
      loc: 'https://skillsfy.in/refund-policy',
      priority: '0.3',
      changefreq: 'yearly'
    },
    {
      loc: 'https://articles.skillsfy.in',
      priority: '0.9',
      changefreq: 'daily',
      image: 'https://skillsfy.in/assets/logo.png',
      imageTitle: 'Skillsfy Articles & Insights'
    }
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd
        http://www.google.com/schemas/sitemap-image/1.1
        http://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd">

  <!-- Core Platform Pages -->\n`;

  for (const p of staticPages) {
    xml += `  <url>\n    <loc>${p.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n`;
    if (p.image) {
      xml += `    <image:image>\n      <image:loc>${p.image}</image:loc>\n      <image:title>${escapeXml(p.imageTitle || '')}</image:title>\n    </image:image>\n`;
    }
    xml += `  </url>\n`;
  }

  xml += `\n  <!-- Published Articles (Direct Subdomain Canonical URLs) -->\n`;

  for (const art of articles) {
    if (!art.slug) continue;
    const artUrl = `https://articles.skillsfy.in/${art.slug}`;
    const artImg = art.cover_image || 'https://skillsfy.in/assets/logo.png';
    const artTitle = art.title || 'Skillsfy Article';
    const artDate = art.timestamp ? new Date(art.timestamp).toISOString().split('T')[0] : today;

    xml += `  <url>\n    <loc>${artUrl}</loc>\n    <lastmod>${artDate}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n`;
    xml += `    <image:image>\n      <image:loc>${artImg}</image:loc>\n      <image:title>${escapeXml(artTitle)}</image:title>\n    </image:image>\n`;
    xml += `  </url>\n`;
  }

  xml += `\n</urlset>\n`;

  fs.writeFileSync(sitemapPath, xml, 'utf8');
  console.log(`✓ Generated sitemap.xml with ${staticPages.length + articles.length} URLs successfully!`);
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

if (require.main === module) {
  generateSitemap();
}

module.exports = { generateSitemap };
