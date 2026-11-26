# Vendor Risk Tracker

A small React + TypeScript app for reviewing third-party vendors by risk, status and owner. Built as a portfolio project to practise the things real product teams care about: state design, API handling, forms, routing, accessibility, tests and performance.

**Demo sign-in:** `analyst@certa.demo` / `password123`

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # 18 tests (Vitest + React Testing Library)
npm run build    # type-check + production build
```

## What it demonstrates

| Area | Where to look |
| --- | --- |
| **State: what lives where** | Server data in `useAsync` (`src/hooks`), session in `AuthContext`, filters in the **URL** (`VendorsPage`), form values in local state (`NewVendorPage`) |
| **API integration** | `src/api/mockApi.ts` simulates latency, `401`, `404`, `409` and `500`. Every screen has loading, error (with retry) and empty states. Stale responses are ignored (`useAsync`) |
| **Auth & protected routes** | `ProtectedRoute` redirects to `/login` and returns the person to the page they wanted |
| **Routing** | Nested routes (`/vendors/:id` with Overview and Assessments tabs), query params (`?risk=High&status=Active&sort=name&q=pay`), 404 page |
| **Forms** | Client validation plus server-aware errors (wrong password, duplicate vendor name). Errors are linked with `aria-describedby`, and focus moves to the first invalid field |
| **Performance** | `React.memo` rows, `useMemo` filtering, `useDeferredValue` for search, route-level code splitting with `React.lazy` |
| **Accessibility** | Skip link, labelled inputs, table headers and caption, visible focus, risk shown as text and number rather than colour alone, `prefers-reduced-motion` |
| **Testing** | Auth redirects, validation, server errors, retry after failure, URL-driven filtering, nested routes, form creation flow |

## Project layout

```
src/
  api/mockApi.ts        fake backend (latency, errors, validation)
  auth/                 AuthContext + ProtectedRoute
  components/           Layout, RiskBadge, VendorRow, loading/error/empty states
  hooks/useAsync.ts     loading / error / data with stale-request protection
  pages/                Login, Vendors, VendorDetail (nested), NewVendor
  test/                 setup + render helper
```

## Deploy to GitHub Pages

```bash
VITE_BASE=/vendor-risk-tracker/ npm run build
```

Publish the `dist` folder (for example with the `gh-pages` package or a GitHub Actions workflow). The build copies `index.html` to `404.html`, so refreshing a deep link still works.

## Decisions worth explaining in an interview

- **Filters in the URL**, not component state: shareable, survives refresh, and the back button behaves.
- **A small custom `useAsync`** instead of a library, to show the loading/error/race-condition handling. In a larger app I would use TanStack Query for caching and background refetching.
- **Mock API with real failure modes**, so error handling is tested rather than assumed.
- **Session in `sessionStorage`** only for the demo. A real app would use httpOnly cookies, because tokens in JS-readable storage are exposed to XSS.

## Possible next steps

- Edit and delete vendors, with optimistic updates
- Pagination or virtualised rows for large lists
- Playwright end-to-end test for the main flow
- Lighthouse and React DevTools Profiler results added here
