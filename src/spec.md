# Specification

## Summary
**Goal:** Enable search engine indexing by adding robots.txt and sitemap.xml, and ensure required SEO image assets exist and load correctly.

**Planned changes:**
- Add `frontend/public/robots.txt` with permissive crawler rules and a `Sitemap: /sitemap.xml` directive.
- Add `frontend/public/sitemap.xml` with a valid XML `<urlset>` including at least the site root URL.
- Ensure the SEO images referenced by the app exist as static files under `frontend/public/assets/generated` with the exact expected filenames.

**User-visible outcome:** The deployed site exposes `/robots.txt` and `/sitemap.xml` for crawlers, and the homepage/social preview images render without broken assets—making the site eligible for Google indexing.
