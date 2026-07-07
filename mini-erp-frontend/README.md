# Mini ERP – Frontend

Inventory & Sales Management System — React + TypeScript client built with Vite, React Router, Tailwind CSS, TanStack Query, and Redux Toolkit (auth state only).

## Tech Stack

- React + TypeScript + Vite
- React Router (protected routes, permission-gated routes)
- Tailwind CSS
- TanStack Query (server state: products, sales, dashboard, roles)
- Redux Toolkit (auth state only — token + current user, persisted to `localStorage`)
- Axios (with a request interceptor that attaches the JWT and a response interceptor that redirects to `/login` on `401`)

## Project Structure

```
src/
├── api/            # axios client + one module per backend resource
├── components/
│   ├── ui/         # Button, Input, Card, Modal, Badge, Toast, Spinner, Barcode
│   └── layout/     # AppLayout (sidebar + outlet)
├── features/
│   ├── auth/        # LoginPage
│   ├── dashboard/    # DashboardPage
│   ├── products/     # ProductsPage, ProductFormDialog
│   ├── sales/        # CreateSalePage
│   └── roles/        # RolesPage (dynamic role/permission management, admin-only)
├── hooks/           # useAuth, useAppDispatch/useAppSelector
├── routes/          # AppRoutes, ProtectedRoute (auth + permission gating)
├── store/           # authSlice
├── types/
├── App.tsx
└── main.tsx
```

## Setup & Installation

### Prerequisites
- Node.js 18+
- The backend API running (see `mini-erp-backend/README.md`)

### Steps

```bash
git clone <this-repo-url>
cd mini-erp-frontend
npm install
cp .env.example .env
```

Fill in `.env`:

```
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

Run in development:

```bash
npm run dev
```

Open http://localhost:5173.

Build for production:

```bash
npm run build
npm run preview
```

## Deployment

Deploy to Vercel or Netlify as a static SPA build (`npm run build` → `dist/`). Set `VITE_API_BASE_URL` to the deployed backend's URL (e.g. `https://your-api.onrender.com/api/v1`). `vercel.json` in this repo configures the SPA rewrite so client-side routes don't 404 on refresh.

## Roles & Permissions

Roles are `admin`, `manager`, and `employee`, but *what each role can do* is database-driven (see the backend's Dynamic Role & Permission Management) rather than hardcoded here. The UI reads `user.permissions` (returned on login and `/auth/me`) to decide what to show:

- `products:manage` — show Add/Edit/Delete controls on the Products page
- `roles:manage` — show the "Roles" nav link and page (admin by default)

Hiding controls in the UI is a UX nicety only — the backend independently enforces every permission check, so this cannot be bypassed by editing client state.

## Login

Use the admin credentials seeded on the backend (see `mini-erp-backend/README.md`, default `admin@example.com` / `Admin@12345`).
