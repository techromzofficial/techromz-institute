# December 2026 first-intake UI implementation

Branch: `feat/december-2026-intake-premium-ui`. Work is uncommitted. This report concerns the homepage intake section; the earlier remediation working tree is preserved.

## Implementation and reference fidelity

The intake section now uses a dedicated server-rendered component and scoped CSS. It recreates the centered calendar pill, navy/blue heading and underline, light-blue curves, four rounded image cards, category overlays, Beginner/Planned intake badges, blue subtitles, gradient detail buttons, shadows, and divided schedule/fee panels from the supplied reference. Flex layouts keep the cards, buttons and bottom panels aligned within each grid row.

The site's existing font family is inherited. The layout uses one column below 768px, two from 768px to 1439px, and four from 1440px. Two columns at 1024px preserve legibility. Buttons have visible keyboard focus and hover motion is restricted to users who have not requested reduced motion. The section adds no client state or new runtime dependency.

The supporting paragraph is preserved verbatim. Visual comparison uses real browser screenshots, not a pixel-difference measurement. The canonical subtitles and existing image compositions are intentionally preserved even where they differ from the reference.

## Canonical course data

The homepage passes the existing public records from `educationCourseService`. Card order and approved schedule/fee facts come from the existing `FIRST_INTAKE` configuration. Titles, subtitles, categories, levels, descriptions, image paths and alt text come from the canonical records. No course data file was edited.

| Course | Existing detail slug | Sri Lanka first class | Fee |
|---|---|---|---:|
| AI Kickstart | build-your-first-ai-assistant | Tuesday, 1 December 2026, 6:00 PM–8:00 PM | LKR 7,500 |
| Retail Kickstart | retail-kickstart | Tuesday, 1 December 2026, 8:00 PM–10:00 PM | LKR 7,500 |
| Mobile Kickstart | mobile-kickstart | Monday, 7 December 2026, 6:00 PM–8:00 PM | LKR 7,500 |
| Business Management Kickstart | business-management-kickstart | Monday, 7 December 2026, 8:00 PM–10:00 PM | LKR 10,000 |

Canonical subtitle differences retained:

- Retail: “Build your first retail application, one step at a time.”
- Mobile: “Build your first mobile application interface.”
- Business: “Understand, plan and manage the foundations of a small business”.

The source records and projected dates/fees were inspected before implementation. Existing enquiry and admission navigation remains on the detail pages; the new buttons use those existing routes.

## Image assets

All four images are reused from the canonical records. No assets were generated, downloaded, hotlinked or cropped from the reference screenshot, and no new licensing claim is made.

| Course | Existing WebP asset |
|---|---|
| AI | public/images/institute/learning/generated/ai-kickstart-v2-1200.webp |
| Retail | public/images/institute/learning/generated/retail-kickstart-1200.webp |
| Mobile | public/images/institute/learning/generated/mobile/mobile-kickstart.webp |
| Business | public/images/institute/learning/generated/business-management/business-management-kickstart.webp |

Existing AVIF siblings are offered through `picture`. AI and Retail also reuse their existing 768px variants. Next.js Image supplies the fallback, lazy loading, descriptive canonical alt text and responsive size hints. A reserved 16:10 image container prevents image-induced layout shift and uses cover cropping.

## Changed files for this task

- `src/features/education/components/InstituteHomepage.tsx`
- `src/features/education/components/DecemberFirstIntake.tsx`
- `src/features/education/components/DecemberFirstIntake.module.css`
- `src/tests/december-first-intake.test.tsx`
- `scripts/check-december-intake-ui.cjs`
- `package.json`
- `package-lock.json`
- `docs/remediation/DECEMBER_2026_INTAKE_UI_IMPLEMENTATION.md`

The only dependency addition is exact development dependency `@types/react-dom@18.3.7`. Initial type checking exposed missing declarations for an existing `react-dom/server` import. Adding the React 18-compatible declarations fixes that pre-existing validation dependency without changing tests or weakening type checking. Existing locked packages were verified unchanged.

## Verification

Validation is in progress; final measured results are appended below before delivery. Current task logs and screenshots are stored separately in `deployment-output/intake-ui/`.

The browser verifier checks the requested 375, 768, 1024, 1440 and 1920px widths, image loading, overflow, equal row/card/button/panel alignment, real clicks to all four course detail pages, keyboard focus and reduced motion. Scoped axe checks cover WCAG A/AA rules at mobile and desktop widths; these are automated checks, not a full assistive-technology audit.

Homepage source comparison confirms that only the target section and its import changed. Hash comparison against the initial working-tree snapshot checks preservation of earlier unrelated work. Temporary Next.js-generated TypeScript configuration references are restored after isolated development/build validation.

No database migration, backend change, environment-file change, deployment, commit or push is part of this task. Header, navigation, footer, other homepage sections, canonical/SEO configuration and existing enquiry, certificate, admission and authentication implementations are protected.
