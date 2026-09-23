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
    
    if (req.query && req.query.slug) {
      slug = req.query.slug.replace(/^\/+/, '').trim();
    } else {
      const matchArticles = url.match(/\/articles\/([a-zA-Z0-9_-]+)/);
      if (matchArticles && matchArticles[1] && matchArticles[1] !== 'index.html' && matchArticles[1] !== 'articles.html') {
        slug = matchArticles[1];
      } else {
        const rootMatch = url.match(/^\/([a-zA-Z0-9_-]+)/);
        if (rootMatch && rootMatch[1] && !rootMatch[1].startsWith('api') && !rootMatch[1].endsWith('.html') && !rootMatch[1].endsWith('.js') && !rootMatch[1].endsWith('.css') && !rootMatch[1].endsWith('.png')) {
          slug = rootMatch[1];
        }
      }
    }

    // Standard Organization Brand Names for SEO & Disambiguation
    const alternateBrandNames = [
      "Skillsfy",
      "skillfy",
      "skillsify",
      "best digital marketing course",
      "best skill based Institute",
      "best digital marketing Institute",
      "best perfomance marketing Institute",
      "digital skills",
      "jabalpur top courses",
      "india best digital marketing Institute",
      "india best perfomance marketing Institute",
      "best plcement assistant Institute",
      "affiliate program of skillsfy",
      "skill",
      "skills",
      "skillify",
      "pranjilsoni",
      "pranjil soni",
      "skillsfy Marketing course",
      "best courses",
      "best ai courses",
      "Skillsfy - Institute of Technology",
      "Skillsfy Jabalpur"
    ];

    if (slug) {
      const article = articlesList.find(a => a.slug === slug || a.id === slug);
      if (article) {
        const canonicalUrl = `https://articles.skillsfy.in/${article.slug}`;
        const desc = article.summary || article.title;
        const pageTitle = `${article.title} | Skillsfy`;
        const coverImg = article.cover_image || 'https://skillsfy.in/assets/logo.png';
        const datePublished = article.timestamp ? new Date(article.timestamp).toISOString() : "2026-09-20T00:00:00+05:30";

        // Extract full plain-text from article HTML for Google JSON-LD articleBody
        const plainArticleBody = (article.content || '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/\s+/g, ' ')
          .trim();

        // 1. SSR SEO Meta Tags
        htmlContent = htmlContent
          .replace(/<title id="seo-title">.*?<\/title>/, `<title id="seo-title">${pageTitle}</title>`)
          .replace(/<link rel="canonical" id="seo-canonical" href=".*?" \/>/, `<link rel="canonical" id="seo-canonical" href="${canonicalUrl}" />`)
          .replace(/<meta name="description" id="seo-desc" content=".*?" \/>/, `<meta name="description" id="seo-desc" content="${desc}" />`)
          .replace(/<meta property="og:title" id="og-title" content=".*?" \/>/, `<meta property="og:title" id="og-title" content="${pageTitle}" />`)
          .replace(/<meta property="og:description" id="og-desc" content=".*?" \/>/, `<meta property="og:description" id="og-desc" content="${desc}" />`)
          .replace(/<meta property="og:url" id="og-url" content=".*?" \/>/, `<meta property="og:url" id="og-url" content="${canonicalUrl}" />`)
          .replace(/<meta property="og:image" id="og-image" content=".*?" \/>/, `<meta property="og:image" id="og-image" content="${coverImg}" />`)
          .replace(/<meta name="twitter:title" id="tw-title" content=".*?" \/>/, `<meta name="twitter:title" id="tw-title" content="${pageTitle}" />`)
          .replace(/<meta name="twitter:description" id="tw-desc" content=".*?" \/>/, `<meta name="twitter:description" id="tw-desc" content="${desc}" />`)
          .replace(/<meta name="twitter:image" id="tw-image" content=".*?" \/>/, `<meta name="twitter:image" id="tw-image" content="${coverImg}" />`);

        // 2. Rich Article JSON-LD Schema (with full text articleBody for deep indexing)
        const articleJsonLd = {
          "@context": "https://schema.org",
          "@type": "TechArticle",
          "headline": article.title,
          "description": desc,
          "articleBody": plainArticleBody,
          "url": canonicalUrl,
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": canonicalUrl
          },
          "image": coverImg,
          "author": {
            "@type": "Person",
            "name": article.author || "Pranjil Soni",
            "url": "https://skillsfy.in/about"
          },
          "publisher": {
            "@type": "EducationalOrganization",
            "name": "Skillsfy - Institute of Technology",
            "alternateName": alternateBrandNames,
            "url": "https://skillsfy.in",
            "logo": {
              "@type": "ImageObject",
              "url": "https://skillsfy.in/assets/logo.png"
            }
          },
          "datePublished": datePublished,
          "dateModified": new Date().toISOString(),
          "keywords": [
            article.category || "Skill Development",
            "Skillsfy",
            "Pranjil Soni",
            "Digital Marketing",
            "AI Courses",
            "Software Development",
            "Online Degrees"
          ]
        };

        htmlContent = htmlContent.replace(
          /<script type="application\/ld\+json" id="seo-schema">[\s\S]*?<\/script>/,
          `<script type="application/ld+json" id="seo-schema">\n${JSON.stringify(articleJsonLd, null, 2)}\n</script>`
        );

        // 3. SSR Pre-render Single Article directly into DOM
        htmlContent = htmlContent
          .replace('id="article-detail-view" class="w-full max-w-[820px] mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-14 flex flex-col hidden text-left"', 'id="article-detail-view" class="w-full max-w-[820px] mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-14 flex flex-col text-left"')
          .replace('id="articles-list-view" class="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-margin py-8 md:py-14 flex flex-col gap-8 text-left"', 'id="articles-list-view" class="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-margin py-8 md:py-14 flex flex-col gap-8 text-left hidden"')
          .replace(/<h1 class="font-headline-xl text-headline-xl md:text-\[44px\] md:leading-\[52px\] text-on-surface font-bold tracking-tight" id="art-title">.*?<\/h1>/s, `<h1 class="font-headline-xl text-headline-xl md:text-[44px] md:leading-[52px] text-on-surface font-bold tracking-tight" id="art-title">${article.title}</h1>`)
          .replace('<span class="text-on-surface truncate" id="crumb-title">Article</span>', `<span class="text-on-surface truncate" id="crumb-title">${article.title}</span>`)
          .replace(/<p class="font-body-lead text-body-lead text-text-muted" id="art-lead">.*?<\/p>/s, `<p class="font-body-lead text-body-lead text-text-muted" id="art-lead">${desc}</p>`)
          .replace('<div id="art-body-html">\n          <!-- Populated from article object -->\n        </div>', `<div id="art-body-html">${article.content}</div>`);
      }
    } else {
      // Main articles listing schema
      const listingJsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Articles & Practical Blueprints | Skillsfy",
        "description": "Read actionable guides, tech analysis, and career frameworks from Skillsfy.",
        "url": "https://articles.skillsfy.in",
        "publisher": {
          "@type": "EducationalOrganization",
          "name": "Skillsfy - Institute of Technology",
          "alternateName": alternateBrandNames,
          "url": "https://skillsfy.in",
          "logo": {
            "@type": "ImageObject",
            "url": "https://skillsfy.in/assets/logo.png"
          }
        }
      };

      htmlContent = htmlContent
        .replace(/<link rel="canonical" id="seo-canonical" href=".*?" \/>/, '<link rel="canonical" id="seo-canonical" href="https://articles.skillsfy.in" />')
        .replace(/<meta property="og:url" id="og-url" content=".*?" \/>/, '<meta property="og:url" id="og-url" content="https://articles.skillsfy.in" />')
        .replace(
          /<script type="application\/ld\+json" id="seo-schema">[\s\S]*?<\/script>/,
          `<script type="application/ld+json" id="seo-schema">\n${JSON.stringify(listingJsonLd, null, 2)}\n</script>`
        );
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.status(200).send(htmlContent);
  } catch (err) {
    console.error('Error serving articles.html via API:', err);
    return res.status(500).send('Internal Server Error loading articles');
  }
};
