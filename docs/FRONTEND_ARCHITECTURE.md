# Frontend Architecture

This frontend is a Next.js application for the Made in Sri Lanka national B2B marketplace. The current architecture is already partially modular and should be improved incrementally, without rewriting working pages or breaking backend API integration.

## Current Folder Structure

```text
frontend/
  src/
    app/                    Next.js app routes
    components/
      home/                 Homepage sections
      layout/               Header, footer, global layout UI
      notifications/        Notification UI
      product/              Product cards and product actions
      shared/               Shared non-domain UI
      supplier/             Supplier profile and supplier dashboard UI
      ui/                   Small generic UI primitives
    contexts/               Client state providers
    hooks/                  Reusable React hooks
    lib/
      api/                  Focused backend API modules
      api.js                Backwards-compatible API barrel
      constants.js          Static navigation and presentation constants
      services.js           Higher-level service wrappers
      utils.js              Shared utilities
```

The folders `components/product` and `components/supplier` should remain as-is for now. Renaming them to plural folders would create broad import churn without improving demo stability.

## Recommended Enterprise Structure

Keep the current structure and evolve toward this ownership model:

```text
src/
  app/                      Route-level screens only
  components/
    home/                   Homepage-only sections
    layout/                 Shell, header, footer, navigation
    product/                Product cards, gallery, pricing, actions
    supplier/               Supplier storefront and supplier workspace UI
    notifications/          Notification UI
    shared/                 Cross-domain composed components
    ui/                     Generic primitives
  contexts/                 Auth/cart/global state providers
  hooks/                    Reusable client behavior
  lib/
    api/                    Backend API modules by domain
    constants.js            Static constants and temporary presentation data
    services.js             Page-friendly service wrappers
```

Avoid creating a large `components/common` folder. Put components near their domain unless they are truly reusable across multiple domains.

## Route Structure

Demo-critical routes:

- `/` homepage
- `/products` product listing
- `/products/[id]` product detail
- `/categories/[slug]` category listing
- `/suppliers` supplier listing
- `/suppliers/[id]` supplier profile/storefront
- `/login`, `/register`, `/forgot-password`, `/reset-password`
- `/dashboard` buyer/supplier-aware account dashboard
- `/supplier-dashboard` supplier overview
- `/rfq`, `/rfq/[id]`
- `/cart`, `/wishlist`, `/messages`

Secondary routes:

- `/compare`
- `/reviews`
- `/quotations`
- `/trade-shows`
- `/orders/[id]/invoice`
- `/orders/[id]/tracking`
- supplier dashboard subpages such as messages, RFQs, products, orders, analytics, and settings

## Component Ownership Model

- Route files in `src/app` should compose data loading, route state, and page layout.
- Domain components should own visual rendering and local interaction state.
- API calls should live in `src/lib/api/*` or `src/lib/services.js`, not inside deeply nested presentational components unless the component is explicitly a data manager.
- `components/ui` should stay small and generic. Do not put marketplace business logic there.
- `components/layout/Header.jsx` and `Footer.jsx` own shell navigation and should not become product/supplier data containers.

## API Integration Pattern

The canonical API layer is now:

```text
src/lib/api/client.js       fetch client, auth cookie helpers, query builder
src/lib/api/home.js         homepage APIs
src/lib/api/products.js     products, categories, product tags
src/lib/api/suppliers.js    public suppliers and supplier workspace APIs
src/lib/api/auth.js         login/register/session APIs
src/lib/api/rfq.js          RFQs and quotations
src/lib/api/dashboard.js    dashboard and order APIs
src/lib/api.js              compatibility barrel for existing imports
```

Preferred new imports:

```js
import { productsApi } from '@/lib/api/products';
import { homeApi } from '@/lib/api/home';
import { authApi } from '@/lib/api/auth';
```

Existing imports from `@/lib/api` are still supported to keep the current app stable while pages are migrated gradually.

## Environment Variables

Use:

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_AUTH_COOKIE=_el_tok
```

`NEXT_PUBLIC_API_URL` is kept only as a legacy fallback for older branches. Do not hardcode localhost inside components. Do not commit `.env`.

## Contexts And Hooks

Current contexts:

- `AuthContext.jsx`: auth token, session restore, login, register, logout
- `CartContext.jsx`: inquiry basket/cart state

Current hooks:

- `useCategories.js`: category loading helper

Rules:

- Keep global state limited to cross-route concerns.
- Prefer route state or component state for filters, tabs, sort, pagination, and modal state.
- Use hooks for repeated behavior, not one-off page logic.

## Adding A New Page

1. Create the route under `src/app`.
2. Add a small `page.jsx` that composes layout and data components.
3. Put large client behavior in a sibling `*Content.jsx` file when needed.
4. Add or reuse API methods from `src/lib/api/*`.
5. Reuse existing layout, product, supplier, shared, and UI components.
6. Run `npm run lint` before opening the PR.

## Adding A Homepage Section

1. Add the visual component under `src/components/home`.
2. Add backend data access in `src/lib/api/home.js` if needed.
3. Compose the section in `src/app/page.jsx`.
4. Keep fallbacks empty or minimal. Do not add large mock data for demo-critical homepage content.

## Adding Product Or Supplier Components

Product components belong in `src/components/product`.

Supplier components belong in `src/components/supplier`.

Keep these components focused:

- Product cards should render product data and actions.
- Product detail sections should not own global auth/session logic.
- Supplier profile sections should render supplier/company data.
- Supplier dashboard managers may call supplier APIs when they are true workspace components.

## Mock Data Inventory

Backend-connected demo-critical pages:

- homepage
- category pages
- product listing
- product detail
- supplier listing
- supplier profile
- buyer dashboard
- RFQ creation/detail
- auth pages
- messages overview
- cart and wishlist

Pages/components with mock fallback or presentation data:

- `src/app/reviews/page.jsx`
- `src/app/quotations/page.jsx`
- `src/app/quotations/[id]/page.jsx`
- `src/app/compare/page.jsx`
- `src/app/trade-shows/[id]/page.jsx`
- `src/app/messages/[conversationId]/page.jsx`
- `src/app/orders/[id]/invoice/page.jsx`
- `src/app/orders/[id]/tracking/page.jsx`
- `src/app/supplier-dashboard/page.jsx` fallback only
- `src/app/supplier-dashboard/orders/page.jsx`
- `src/app/supplier-dashboard/rfqs/page.jsx`
- `src/app/supplier-dashboard/products/page.jsx`
- `src/app/supplier-dashboard/products/[id]/page.jsx`
- `src/app/supplier-dashboard/messages/page.jsx`

These should be migrated in feature branches after the demo-critical flow remains stable.

## Known Limitations

- Some secondary pages still fall back to mock datasets when API endpoints are absent or fail.
- `src/lib/services.js` still wraps some APIs for page convenience. New domain API methods should be added under `src/lib/api/*` first.
- The supplier dashboard overview is backend-connected but keeps fallback demo values for resilience.
- The real `.env` currently uses the older variable name in some local setups. The client supports both, but new setup should use `NEXT_PUBLIC_API_BASE_URL`.
- Do not run broad component folder renames until imports are covered by tests or a dedicated refactor PR.
