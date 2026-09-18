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
      const formattedTitle = slug
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      const pageTitle = `${formattedTitle} | Skillsfy`;
      const canonicalUrl = `https://skillsfy.in/articles/${slug}`;

      htmlContent = htmlContent
        .replace(/<title id="seo-title">.*?<\/title>/, `<title id="seo-title">${pageTitle}</title>`)
        .replace(/<link rel="canonical" id="seo-canonical" href=".*?" \/>/, `<link rel="canonical" id="seo-canonical" href="${canonicalUrl}" />`)
        .replace(/<meta property="og:title" id="og-title" content=".*?" \/>/, `<meta property="og:title" id="og-title" content="${pageTitle}" />`)
        .replace(/<meta property="og:url" id="og-url" content=".*?" \/>/, `<meta property="og:url" id="og-url" content="${canonicalUrl}" />`);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.status(200).send(htmlContent);
  } catch (err) {
    console.error('Error serving articles.html via API:', err);
    return res.status(500).send('Internal Server Error loading articles');
  }
};
