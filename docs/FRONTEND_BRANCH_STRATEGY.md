# Frontend Branch Strategy

This project should use page branches as parent branches and section/component branches as focused child branches. The goal is to keep integration stable while allowing multiple developers to work on different frontend areas.

## Protected Branches

- `main`: release-only and protected
- `integration`: stable integration branch for accepted frontend/backend work

Never develop directly on `main`.

## Parent / Page Branches

Use page-level branches for complete user-facing surfaces:

- `feature/frontend-homepage`
- `feature/frontend-products-page`
- `feature/frontend-product-detail-page`
- `feature/frontend-suppliers-page`
- `feature/frontend-supplier-profile-page`
- `feature/frontend-auth`
- `feature/frontend-buyer-dashboard`
- `feature/frontend-supplier-dashboard`
- `feature/frontend-rfq-inquiry`

Page branches should be created from `integration`.

## Section / Component Branches

Use section branches for focused parts of a page:

- `feature/frontend-homepage-mega-menu`
- `feature/frontend-homepage-hero-section`
- `feature/frontend-homepage-category-section`
- `feature/frontend-homepage-trending-products`
- `feature/frontend-homepage-featured-products`
- `feature/frontend-homepage-verified-suppliers`
- `feature/frontend-products-filter-sidebar`
- `feature/frontend-products-grid`
- `feature/frontend-product-detail-gallery`
- `feature/frontend-product-detail-rfq-action`
- `feature/frontend-supplier-profile-header`
- `feature/frontend-supplier-products-section`
- `feature/frontend-supplier-certificates-section`

Section branches should be created from the relevant page branch, not directly from `integration`.

## Merge Flow

1. Create page branch from `integration`.
2. Create section branch from the page branch.
3. Open a section PR back into the page branch.
4. Merge reviewed section PRs into the page branch.
5. Run page-level verification on the page branch.
6. Open the page PR into `integration`.
7. Keep `integration` demo-stable.
8. Merge `integration` into `main` only for release.

Example:

```text
integration
  -> feature/frontend-homepage
    -> feature/frontend-homepage-hero-section
    -> feature/frontend-homepage-category-section
    -> feature/frontend-homepage-featured-products
  -> integration
  -> main
```

## PR Rules

- Keep PRs scoped to one page or section.
- Do not mix backend migrations with frontend component changes.
- Do not commit `.env`.
- Include screenshots or short recordings for visible UI changes.
- Include API endpoint notes when a component depends on backend data.
- Run `npm run lint` before requesting review.
- Run `npm run build` for page branches before merging into `integration`.

## API And Demo Stability Rules

- Demo-critical pages must keep real backend API data connected.
- Do not replace integrated data with frontend-only mock data.
- Mock data is acceptable only for secondary pages or controlled fallback states.
- If a backend endpoint is missing, document the limitation in the PR instead of faking a production workflow.

## Naming Guidance

Use lowercase branch names with hyphens:

```text
feature/frontend-area-name
fix/frontend-area-issue
chore/frontend-tooling-task
docs/frontend-topic
```

Avoid vague branches such as:

```text
feature/frontend-updates
feature/fixes
feature/new-ui
```

## Review Checklist

- Route still loads.
- API calls use `src/lib/api/*` or `src/lib/services.js`.
- Loading, empty, and error states are handled.
- Mobile and desktop layouts are checked.
- No secrets or `.env` changes are committed.
- Lint passes.
- Page branch build passes before merging to `integration`.
