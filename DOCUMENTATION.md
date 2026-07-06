# Mini ERP – Inventory & Sales Management System
## Project Documentation & Implementation Plan

**Position:** Full Stack (MERN) Developer — Technical Assessment
**Deadline:** 07/07/2026, 11:30 PM (today is 2026-07-06 — you have roughly **24–30 hours**. Read the "Time Management" section before you start coding.)

---

## 0. Time Management (read this first)

You do not have time to build everything perfectly. Build in this order and **stop and deploy** the moment the core is working — a deployed MVP beats an unfinished "complete" project.

| Priority | What | Time budget |
|---|---|---|
| P0 | Backend: Auth (JWT) + RBAC middleware | 1.5h |
| P0 | Backend: Product CRUD + image upload + search/pagination | 2h |
| P0 | Backend: Sales create (stock logic + grand total) | 1.5h |
| P0 | Backend: Dashboard stats API | 0.5h |
| P0 | Frontend: Login + protected routes | 1h |
| P0 | Frontend: Product list/add/edit/delete + search/pagination | 2.5h |
| P0 | Frontend: Create Sale page | 1.5h |
| P0 | Frontend: Dashboard | 1h |
| P1 | Validation, error handling, consistent response format | 1h (do incrementally, not at the end) |
| P1 | Deploy both (Render/Railway + Vercel) + MongoDB Atlas | 1.5h |
| P1 | README + API docs + seed admin user | 1h |
| P2 (bonus, only if time remains) | Generic query builder, global error handler, modular architecture polish, socket.io | remaining time |

**Do the P0 rows in order. Deploy early (even a bare-bones version) so you always have a working live URL — don't leave deployment for the last hour.**

---

## 1. Tech Stack

**Backend:** Node.js, Express.js, TypeScript, MongoDB, Mongoose, JWT, bcrypt, multer (+ Cloudinary for persistent image storage on hosted platforms), express-validator or zod.

**Frontend:** React (Vite), React Router, TypeScript, Tailwind CSS + shadcn/ui, TanStack Query (server state) + minimal Redux/Context (auth state only — don't use both for the same data).

> **Note on image storage:** Render/Railway free tiers have ephemeral disks — anything saved via `multer.diskStorage` is lost on redeploy/restart. Use **Cloudinary** (free tier) for product images in production; keep local disk storage only as a fallback for local dev.

---

## 2. Repository Structure

Submission requires **two separate public GitHub repos**. Create them as two folders locally, each its own git repo:

```
mini-erp-backend/
mini-erp-frontend/
```

### Backend structure (modular / feature-based — this satisfies the "Modular Feature-Based Architecture" bonus)

```
mini-erp-backend/
├── src/
│   ├── config/
│   │   ├── db.ts
│   │   └── cloudinary.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── auth.validation.ts
│   │   ├── user/
│   │   │   ├── user.model.ts
│   │   │   └── user.types.ts
│   │   ├── product/
│   │   │   ├── product.model.ts
│   │   │   ├── product.controller.ts
│   │   │   ├── product.service.ts
│   │   │   ├── product.routes.ts
│   │   │   └── product.validation.ts
│   │   ├── sale/
│   │   │   ├── sale.model.ts
│   │   │   ├── sale.controller.ts
│   │   │   ├── sale.service.ts
│   │   │   ├── sale.routes.ts
│   │   │   └── sale.validation.ts
│   │   └── dashboard/
│   │       ├── dashboard.controller.ts
│   │       └── dashboard.routes.ts
│   ├── middleware/
│   │   ├── authenticate.ts       # verifies JWT
│   │   ├── authorize.ts          # role/permission check
│   │   ├── upload.ts             # multer config
│   │   ├── validate.ts           # runs validation schemas
│   │   └── errorHandler.ts       # global error handler
│   ├── utils/
│   │   ├── ApiError.ts
│   │   ├── ApiResponse.ts
│   │   ├── asyncHandler.ts
│   │   └── queryBuilder.ts       # generic search/filter/sort/pagination
│   ├── types/
│   ├── app.ts
│   └── server.ts
├── .env.example
├── tsconfig.json
├── package.json
└── README.md
```

### Frontend structure

```
mini-erp-frontend/
├── src/
│   ├── api/
│   │   ├── axiosClient.ts
│   │   ├── auth.api.ts
│   │   ├── product.api.ts
│   │   ├── sale.api.ts
│   │   └── dashboard.api.ts
│   ├── components/
│   │   ├── ui/                  # shadcn components
│   │   ├── layout/
│   │   └── shared/
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── products/
│   │   └── sales/
│   ├── hooks/
│   ├── store/                   # redux/context for auth only
│   ├── routes/
│   │   ├── AppRoutes.tsx
│   │   └── ProtectedRoute.tsx
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
├── .env.example
├── tsconfig.json
├── package.json
└── README.md
```

---

## 3. Database Design (Mongoose Schemas)

### User
```ts
{
  name: string;
  email: string;          // unique, required
  password: string;       // hashed with bcrypt, select: false
  role: "admin" | "manager" | "employee";
  createdAt, updatedAt
}
```

### Product
```ts
{
  name: string;           // required
  sku: string;            // unique, required
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;  // default 0, min 0
  imageUrl: string;       // required on create (business rule)
  createdBy: ObjectId -> User;
  createdAt, updatedAt
}
```
Index: `{ name: "text", sku: "text" }` for search; `{ sku: 1 }` unique.

### Sale
```ts
{
  items: [
    {
      product: ObjectId -> Product;
      quantity: number;
      priceAtSale: number;   // snapshot of sellingPrice at time of sale
      subtotal: number;      // quantity * priceAtSale
    }
  ];
  grandTotal: number;
  createdBy: ObjectId -> User;
  createdAt, updatedAt
}
```

> Store `priceAtSale` as a snapshot — if `sellingPrice` changes later, historical sales must stay accurate.

---

## 4. Auth & RBAC Design

### JWT
- On login: verify email + bcrypt-compare password → sign JWT `{ sub: userId, role }`, short expiry (e.g. 1h) + optional refresh token.
- `authenticate` middleware: reads `Authorization: Bearer <token>`, verifies, attaches `req.user`.
- `authorize(...allowedRoles)` middleware: checks `req.user.role` is in the allowed list; else `403`.

### Permission Matrix

| Action | Admin | Manager | Employee |
|---|---|---|---|
| Manage Products (create/update/delete) | ✅ | ✅ | ❌ |
| View Products | ✅ | ✅ | ✅ |
| Create Sales | ✅ | ✅ | ✅ |
| View Dashboard | ✅ | ✅ | ✅ (or restrict to admin/manager — your call, document it) |
| Manage Users/Roles | ✅ | ❌ | ❌ |

For the **bonus** "Dynamic Role & Permission Management," instead of hardcoding role checks, model a `Permission` collection and a `Role -> Permission[]` mapping in Mongo, and have `authorize("products:manage")` look up permissions from DB instead of a hardcoded array. Only attempt this after P0 is done and deployed.

---

## 5. API Specification

Base URL: `/api/v1`

Consistent response envelope for **every** endpoint:
```json
// success
{ "success": true, "data": { }, "message": "Products fetched successfully" }

// error
{ "success": false, "message": "Insufficient stock", "errors": [] }
```

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/login` | Public | Returns JWT + user info |
| GET | `/auth/me` | Authenticated | Returns current user profile |

### Products
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/products?search=&page=&limit=&category=&sort=` | Authenticated (all roles) | List with search/filter/pagination |
| GET | `/products/:id` | Authenticated | Get single product |
| POST | `/products` | Admin, Manager | Create (multipart/form-data, image required) |
| PUT | `/products/:id` | Admin, Manager | Update (image optional) |
| DELETE | `/products/:id` | Admin, Manager | Delete |

### Sales
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/sales` | Admin, Manager, Employee | Create sale — validates stock, reduces stock, computes grand total |
| GET | `/sales` | Admin, Manager | Sale history (list) |
| GET | `/sales/:id` | Admin, Manager | Sale details |

### Dashboard
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/dashboard/stats` | Authenticated | `{ totalProducts, totalSales, lowStockProducts }` (low stock = qty < 5) |

### Error status codes to use consistently
- `400` validation error / bad request
- `401` missing/invalid token
- `403` authenticated but not authorized (wrong role)
- `404` resource not found
- `409` conflict (e.g. duplicate SKU)
- `500` unhandled server error (caught by global error handler, never leak stack trace in prod)

---

## 6. Sales Creation Logic (critical business logic)

```
POST /sales  body: { items: [{ productId, quantity }] }

For each item (inside a MongoDB transaction/session if using a replica set, else sequential checks):
  1. Fetch product by id
  2. If product not found -> 404
  3. If stockQuantity < quantity -> 400 "Insufficient stock for <product>"
  4. subtotal = quantity * product.sellingPrice
  5. Decrement product.stockQuantity by quantity, save

Sum subtotals -> grandTotal
Create Sale document with item snapshots (productId, quantity, priceAtSale, subtotal) + grandTotal + createdBy
Return created sale
```
If MongoDB Atlas free tier (no replica set transactions available on some tiers — Atlas free tier *does* support transactions since it's a replica set), prefer wrapping in a session transaction so a failure partway through doesn't leave stock decremented without a sale record. If time-constrained, sequential validation-then-update is acceptable for the assessment.

---

## 7. Step-by-Step Implementation Plan

### Phase 1 — Backend Setup (≈30 min)
1. `npm init`, install: `express mongoose bcrypt jsonwebtoken dotenv cors multer cloudinary express-validator`
2. Dev deps: `typescript ts-node-dev @types/express @types/node @types/bcrypt @types/jsonwebtoken @types/multer @types/cors`
3. `tsconfig.json`, `src/server.ts` (connect Mongo), `src/app.ts` (express app, cors, json parser, routes mount, error handler)
4. `.env`: `PORT, MONGO_URI, JWT_SECRET, JWT_EXPIRES_IN, CLOUDINARY_*`

### Phase 2 — Auth Module (≈1.5h)
5. `User` model with pre-save bcrypt hash hook
6. Seed script or one-time route to create the initial **admin** user (document credentials for submission)
7. `auth.controller.ts`: `login` → validate → compare password → sign JWT → return `{ token, user }`
8. `authenticate` middleware, `authorize` middleware
9. `GET /auth/me`

### Phase 3 — Product Module (≈2h)
10. `Product` model + unique index on `sku`
11. `upload` middleware (multer memory storage → stream to Cloudinary) — reject request with 400 if no image on create
12. CRUD controllers + `queryBuilder` util for search (`name`/`sku` regex or text search), pagination (`page`, `limit`, return `{ items, total, page, totalPages }`), optional category filter
13. Wire routes with `authenticate` + `authorize(["admin","manager"])` on write ops, `authenticate` only on read ops

### Phase 4 — Sales Module (≈1.5h)
14. `Sale` model
15. Create-sale service implementing the stock-check/decrement/grandTotal logic above
16. Routes: `authenticate` + `authorize(["admin","manager","employee"])` for create; restrict list/detail to admin/manager if desired

### Phase 5 — Dashboard (≈30 min)
17. Aggregate: `Product.countDocuments()`, `Sale.countDocuments()`, `Product.find({ stockQuantity: { $lt: 5 } })`

### Phase 6 — Cross-cutting (do alongside, not after)
18. Global error handler (`errorHandler.ts`) catching `ApiError` + Mongoose validation errors + cast errors → uniform JSON shape
19. `asyncHandler` wrapper to avoid try/catch boilerplate in every controller
20. Input validation on every write endpoint (express-validator or zod schemas)

### Phase 7 — Frontend Setup (≈30 min)
21. `npm create vite@latest` (React + TS), install Tailwind, shadcn/ui, `react-router-dom`, `@tanstack/react-query`, `axios`, `redux`/`@reduxjs/toolkit` (auth slice only) or plain Context for auth
22. `axiosClient` with interceptor to attach JWT from storage and handle 401 → redirect to login

### Phase 8 — Frontend Auth (≈1h)
23. Login page/form → call `/auth/login` → store token + user (localStorage + auth store)
24. `ProtectedRoute` wrapper component checking auth store; redirect to `/login` if absent
25. Route layout with sidebar/nav showing role-based menu items

### Phase 9 — Frontend Products (≈2.5h)
26. Product list page: TanStack Query hook `useProducts({ search, page })`, table/grid, search input (debounced), pagination controls
27. Add/Edit Product form (shadcn Dialog or dedicated page) with image file input, client-side validation, `multipart/form-data` submit
28. Delete confirmation (shadcn AlertDialog)
29. Hide Add/Edit/Delete controls for `employee` role (still enforce server-side — UI hiding is UX only, not security)

### Phase 10 — Frontend Sales (≈1.5h)
30. Create Sale page: multi-product selector (searchable combobox), quantity input per line, live subtotal + grand total calculation client-side (still authoritative server-side), submit → `POST /sales`
31. Show success/error toast, reset form after success

### Phase 11 — Frontend Dashboard (≈1h)
32. Stat cards (Total Products, Total Sales, Low Stock count) fed by `useQuery` on `/dashboard/stats`
33. Low stock product table

### Phase 12 — Deploy (≈1.5h)
34. MongoDB Atlas: create free cluster, network access `0.0.0.0/0` (or platform IP), get connection string
35. Backend → Render or Railway: set env vars, build command `tsc`, start command `node dist/server.js`
36. Cloudinary: create free account, get API key/secret/cloud name, set as backend env vars
37. Frontend → Vercel/Netlify: set `VITE_API_BASE_URL` env var pointing at deployed backend
38. Update backend CORS `origin` to the deployed frontend URL
39. Smoke test the live URLs end-to-end (login → add product → create sale → dashboard updates)

### Phase 13 — Docs & Submission (≈1h)
40. Write backend `README.md`: setup steps, env vars, seed/admin credentials, how to run locally
41. Write frontend `README.md`: setup steps, env vars, how to run locally
42. API documentation: either a markdown table (endpoints/params/responses) or a Postman collection exported to the repo — markdown is faster given time constraints
43. Push both repos to GitHub as **public**, double check no `.env` committed (add `.env` to `.gitignore` before first commit)
44. Compile submission: live frontend URL, live backend URL, both repo links, admin credentials, README, API docs

---

## 8. Validation & Best Practices Checklist

- [ ] Every write endpoint validates input (required fields, types, min/max) and returns `400` with field-level errors on failure
- [ ] Passwords never returned in any API response (`select: false` on schema + explicit `.select("-password")` where needed)
- [ ] All protected routes actually invoke `authenticate` (and `authorize` where role-restricted) — verify with a quick manual pass over `routes` files
- [ ] Every response uses the same `{ success, data/message/errors }` envelope
- [ ] Correct HTTP status codes used (see table in section 5)
- [ ] `.env` files git-ignored in both repos; `.env.example` committed instead
- [ ] CORS restricted to the actual frontend origin in production (not `*`)
- [ ] Global error handler is the last middleware in `app.ts` and catches everything (no unhandled promise rejections crashing the server — use `asyncHandler`)

---

## 9. Bonus Features (only attempt after P0 is fully working and deployed)

Ranked by effort-to-payoff given the time crunch:

1. **Global Error Handler** — you'll build this anyway as part of P1; cheap to also count as bonus.
2. **Reusable functions** (`ApiResponse`, `ApiError`, `asyncHandler`, `queryBuilder`) — also mostly built as part of P0; low extra cost.
3. **Generic Query Builder** — extend the products search/pagination util to accept arbitrary `sort`/`filter` query params reusably (usable by Sales list too).
4. **Modular Feature-Based Architecture** — achieved by following the folder structure in Section 2.
5. **Dynamic Role & Permission Management** — moderate effort; only attempt if P0 is deployed with hours to spare.
6. **Socket.io / WebSocket** — highest effort/lowest necessity; e.g. emit a `stock:low` event when a sale pushes stock below 5, shown as a live toast on the dashboard. Only attempt last, if at all.

---

## 10. Submission Checklist

- [ ] Live Frontend URL
- [ ] Live Backend API URL
- [ ] Frontend GitHub repo (public)
- [ ] Backend GitHub repo (public)
- [ ] Admin login credentials
- [ ] README with setup/installation guide (both repos)
- [ ] API documentation
