export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - assets, css, js, images, fonts (static files)
     * - sitemap.xml, robots.txt, favicon.ico
     */
    '/((?!api|assets|css|js|images|fonts|sitemap\\.xml|robots\\.txt|favicon\\.ico).*)',
  ],
};

export default function middleware(req) {
  const url = new URL(req.url);
  const host = req.headers.get('host') || '';

  // 1. If requested on main domain (skillsfy.in), 301 redirect all /articles and /guides paths to articles.skillsfy.in
  if (!host.includes('articles.skillsfy.in')) {
    if (url.pathname === '/articles' || url.pathname === '/articles.html' || url.pathname === '/guides' || url.pathname === '/guides.html') {
      return Response.redirect('https://articles.skillsfy.in' + url.search, 301);
    }
    if (url.pathname.startsWith('/articles/')) {
      const subSlug = url.pathname.replace('/articles/', '');
      return Response.redirect('https://articles.skillsfy.in/' + subSlug + url.search, 301);
    }
    if (url.pathname.startsWith('/guides/')) {
      const subSlug = url.pathname.replace('/guides/', '');
      return Response.redirect('https://articles.skillsfy.in/' + subSlug + url.search, 301);
    }
    return;
  }

  // 2. If requested on subdomain (articles.skillsfy.in), rewrite to /api/articles engine
  if (host.includes('articles.skillsfy.in')) {
    let slug = url.pathname.replace(/^\/+/, '').trim();
    if (slug.endsWith('.html')) slug = slug.replace(/\.html$/, '');

    const targetUrl = new URL('/api/articles', req.url);
    if (slug && slug !== 'articles' && slug !== 'index') {
      targetUrl.searchParams.set('slug', slug);
    }

    return Response.rewrite(targetUrl);
  }
}
