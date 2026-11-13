# Search implementation and verification

Search indexing remains disabled. Enabling it requires Institute-only mode, the explicit existing flag, and the exact HTTPS techromzit.com host without credentials or a custom port. Arbitrary staging hosts fail closed even when the flag is true. Canonicals consistently reference production; a canonical does not authorize indexing.

Implemented canonical URLs, Open Graph, Twitter summary metadata, en_LK locale, deduplicated approved sitemap entries and private robots exclusions. GPTBot, ClaudeBot and Google-Extended remain disallowed pending an owner decision. No webmaster account, sitemap submission, IndexNow or analytics activation occurred.

JSON-LD uses EducationalOrganization, WebSite, Course, approved CourseInstance/Offer, BreadcrumbList, ItemList and department CollectionPage. It is gated by indexing and per-course publication/demo/approval status. Prices and first-class dates come from approved intake facts. No credentials, ratings, accreditation, addresses or enrolment availability were invented. Script-delimiter escaping now round-trips special characters safely.

Executed source/render tests parse the JSON-LD, verify an approved first-intake instance and suppress hidden/demo course schemas. Initial production-build HTTP checks confirmed canonical, HTML noindex and social tags. They exposed a missing global X-Robots-Tag; middleware now applies noindex/nofollow when indexing is disabled and always to API/admin paths. Rebuilt HTTP verification passed for all public courses and the homepage, with indexing still disabled. Final Lighthouse: mobile performance 95, desktop performance 100; both accessibility and best practices 100, SEO 69. Crawlability is intentionally blocked.

Outstanding: external Google/Schema.org validation after approved staging publication; owner-approved indexable URL manifest; actual hosting/CDN/WAF crawler access; legacy URL exports; webmaster ownership and submissions; consent/retention decisions for analytics; verified instructor biographies and case studies. No current Lighthouse score is claimed unless a successful measurement is listed in the QA report. Historical PDF scores are not fresh evidence.

Final regular suite includes passing SEO, route, security, intake and schema regressions (691 passed, 12 existing external opt-in tests skipped). Production build and all-route local HTTP acceptance also pass. Search activation and real hosting acceptance remain unauthorized/outstanding.

Local responsive/keyboard smoke also passed six representative routes at three viewport widths; homepage and mobile-menu screenshots were inspected. This supports local accessibility acceptance alongside Lighthouse 100, without claiming a full assistive-technology audit.
