const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  try {
    let htmlContent = '';
    const localPath = path.join(__dirname, '..', 'articles.html');
    const cwdPath = path.join(process.cwd(), 'articles.html');

    if (fs.existsSync(localPath)) {
      htmlContent = fs.readFileSync(localPath, 'utf8');
    } else if (fs.existsSync(cwdPath)) {
      htmlContent = fs.readFileSync(cwdPath, 'utf8');
    } else {
      return res.status(404).send('Articles template not found');
    }

    // Load published articles
    let articlesList = [];
    const jsonPath = path.join(__dirname, '..', 'published-articles.json');
    const cwdJsonPath = path.join(process.cwd(), 'published-articles.json');
    if (fs.existsSync(jsonPath)) {
      try { articlesList = JSON.parse(fs.readFileSync(jsonPath, 'utf8')); } catch(e) {}
    } else if (fs.existsSync(cwdJsonPath)) {
      try { articlesList = JSON.parse(fs.readFileSync(cwdJsonPath, 'utf8')); } catch(e) {}
    }

    // Extract slug from URL if present
    const url = req.url || '';
    let slug = '';
    const match = url.match(/\/articles\/([a-zA-Z0-9_-]+)/);
    if (match && match[1] && match[1] !== 'index.html' && match[1] !== 'articles.html') {
      slug = match[1];
    } else if (req.query && req.query.slug) {
      slug = req.query.slug;
    }

    if (slug) {
      const article = articlesList.find(a => a.slug === slug);
      if (article) {
        const canonicalUrl = `https://skillsfy.in/articles/${article.slug}`;
        const desc = article.summary || article.title;
        const pageTitle = `${article.title} | Skillsfy`;

        // 1. SSR SEO Meta Tags
        htmlContent = htmlContent
          .replace(/<title id="seo-title">.*?<\/title>/, `<title id="seo-title">${pageTitle}</title>`)
          .replace(/<link rel="canonical" id="seo-canonical" href=".*?" \/>/, `<link rel="canonical" id="seo-canonical" href="${canonicalUrl}" />`)
          .replace(/<meta name="description" id="seo-desc" content=".*?" \/>/, `<meta name="description" id="seo-desc" content="${desc}" />`)
          .replace(/<meta property="og:title" id="og-title" content=".*?" \/>/, `<meta property="og:title" id="og-title" content="${pageTitle}" />`)
          .replace(/<meta property="og:description" id="og-desc" content=".*?" \/>/, `<meta property="og:description" id="og-desc" content="${desc}" />`)
          .replace(/<meta property="og:url" id="og-url" content=".*?" \/>/, `<meta property="og:url" id="og-url" content="${canonicalUrl}" />`)
          .replace(/<meta name="twitter:title" id="tw-title" content=".*?" \/>/, `<meta name="twitter:title" id="tw-title" content="${pageTitle}" />`)
          .replace(/<meta name="twitter:description" id="tw-desc" content=".*?" \/>/, `<meta name="twitter:description" id="tw-desc" content="${desc}" />`);

        // 2. SSR Pre-render Single Article directly into DOM (Zero blank flash)
        htmlContent = htmlContent
          .replace('id="article-detail-view" class="w-full max-w-[820px] mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-14 flex flex-col hidden text-left"', 'id="article-detail-view" class="w-full max-w-[820px] mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-14 flex flex-col text-left"')
          .replace('id="articles-list-view" class="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-margin py-8 md:py-14 flex flex-col gap-8 text-left"', 'id="articles-list-view" class="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-margin py-8 md:py-14 flex flex-col gap-8 text-left hidden"')
          .replace('<h1 class="font-headline-xl text-headline-xl md:text-[44px] md:leading-[52px] text-on-surface font-bold tracking-tight" id="art-title">.*?<\/h1>/s', `<h1 class="font-headline-xl text-headline-xl md:text-[44px] md:leading-[52px] text-on-surface font-bold tracking-tight" id="art-title">${article.title}</h1>`)
          .replace('<span class="text-on-surface truncate" id="crumb-title">Article</span>', `<span class="text-on-surface truncate" id="crumb-title">${article.title}</span>`)
          .replace('<p class="font-body-lead text-body-lead text-text-muted" id="art-lead">.*?<\/p>/s', `<p class="font-body-lead text-body-lead text-text-muted" id="art-lead">${desc}</p>`)
          .replace('<div id="art-body-html">\n          <!-- Populated from article object -->\n        </div>', `<div id="art-body-html">${article.content}</div>`);
      }
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.status(200).send(htmlContent);
  } catch (err) {
    console.error('Error serving articles.html via API:', err);
    return res.status(500).send('Internal Server Error loading articles');
  }
};
