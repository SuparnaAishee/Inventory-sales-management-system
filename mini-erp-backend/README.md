# Mini ERP – Backend

Inventory & Sales Management System — REST API built with Node.js, Express, TypeScript, MongoDB/Mongoose, and JWT authentication.

## Tech Stack

- Node.js + Express.js + TypeScript
- MongoDB + Mongoose
- JWT authentication, role-based authorization (admin / manager / employee)
- Multer + Cloudinary for product image uploads
- express-validator for input validation

## Project Structure

```
src/
├── config/          # db connection, cloudinary config
├── modules/
│   ├── auth/         # login, /me
│   ├── user/         # User model
│   ├── product/      # Product CRUD, search, pagination, image upload
│   ├── sale/          # Create sale, stock logic, sale history
│   └── dashboard/     # Aggregate stats
├── middleware/       # authenticate, authorize, upload, validate, errorHandler
├── utils/            # ApiError, ApiResponse, asyncHandler, generic queryBuilder
├── scripts/          # seedAdmin.ts
├── app.ts
└── server.ts
```

## Setup & Installation

### Prerequisites
- Node.js 18+
- A MongoDB connection string (local or [MongoDB Atlas](https://www.mongodb.com/atlas) free tier)
- A [Cloudinary](https://cloudinary.com/) account (free tier) for image uploads

### Steps

```bash
git clone <this-repo-url>
cd mini-erp-backend
npm install
cp .env.example .env
# edit .env with your Mongo URI, JWT secret, Cloudinary credentials
```

Fill in `.env`:

```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/mini-erp
JWT_SECRET=<long-random-string>
JWT_EXPIRES_IN=1d
CORS_ORIGIN=http://localhost:5173
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
SEED_ADMIN_NAME=Admin
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=Admin@12345
```

Seed default permissions/roles, then the initial admin user (run in this order on a fresh database):

```bash
npm run seed:roles   # creates the Permission/Role documents (admin/manager/employee)
npm run seed:admin   # creates one User document with role "admin"
npm run seed:data    # optional — sample products + sales for demo/testing
```

Run in development (auto-reload):

```bash
npm run dev
```

Build and run in production:

```bash
npm run build
npm start
```

Health check: `GET /health` → `{ success: true, message: "OK" }`

## Admin Credentials (seeded via `npm run seed:admin`)

- Email: value of `SEED_ADMIN_EMAIL` in `.env` (default `admin@example.com`)
- Password: value of `SEED_ADMIN_PASSWORD` in `.env` (default `Admin@12345`)

> Change these in `.env` before seeding your deployed database, and list the actual credentials you used in your assessment submission.

## Roles & Permissions

| Action | Admin | Manager | Employee |
|---|---|---|---|
| Manage Products (create/update/delete) | Yes | Yes | No |
| View Products | Yes | Yes | Yes |
| Create Sales | Yes | Yes | Yes |
| View Sale History | Yes | Yes | No |
| View Dashboard | Yes | Yes | Yes |

## API Documentation

**Interactive Swagger UI:** `GET /api-docs` (raw OpenAPI 3.0 spec at `GET /api-docs.json`, importable into Postman/Insomnia).
Live: https://inventory-sales-management-system.onrender.com/api-docs

Base URL: `/api/v1`

All responses use a consistent envelope:

```json
// success
{ "success": true, "message": "...", "data": { } }

// error
{ "success": false, "message": "...", "errors": [] }
```

### Auth

#### `POST /auth/login`
Public. Body:
```json
{ "email": "admin@example.com", "password": "Admin@12345" }
```
`200` →
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "<jwt>",
    "user": { "id": "...", "name": "...", "email": "...", "role": "admin" }
  }
}
```
`401` if invalid credentials.

#### `GET /auth/me`
Requires `Authorization: Bearer <token>`. Returns the current user's profile.

### Products
All endpoints require `Authorization: Bearer <token>`.

| Method | Endpoint | Roles | Notes |
|---|---|---|---|
| GET | `/products?search=&page=&limit=&category=&sort=` | any authenticated | paginated list |
| GET | `/products/:id` | any authenticated | single product |
| POST | `/products` | admin, manager | `multipart/form-data`, `image` field required |
| PUT | `/products/:id` | admin, manager | `multipart/form-data`, `image` optional |
| DELETE | `/products/:id` | admin, manager | |

Product fields: `name, sku, category, purchasePrice, sellingPrice, stockQuantity, imageUrl`.

`GET /products` response `data`:
```json
{ "items": [...], "total": 42, "page": 1, "limit": 10, "totalPages": 5 }
```

### Sales
| Method | Endpoint | Roles | Notes |
|---|---|---|---|
| POST | `/sales` | admin, manager, employee | creates a sale |
| GET | `/sales` | admin, manager | paginated sale history |
| GET | `/sales/:id` | admin, manager | sale detail |

`POST /sales` body:
```json
{
  "items": [
    { "productId": "<id>", "quantity": 2 },
    { "productId": "<id>", "quantity": 1 }
  ]
}
```
Server validates stock availability for every item before decrementing any stock, computes `subtotal` per item (snapshotting `sellingPrice` at time of sale) and `grandTotal`, then stores the sale. Returns `400` if any item has insufficient stock, `404` if a product id doesn't exist.

### Dashboard
| Method | Endpoint | Roles |
|---|---|---|
| GET | `/dashboard/stats` | any authenticated |

Response `data`: `{ totalProducts, totalSales, lowStockProducts }` (`lowStockProducts` = full product docs where `stockQuantity < 5`).

### Roles & Permissions (Dynamic RBAC — bonus)
All endpoints require the `roles:manage` permission (granted to `admin` by default).

| Method | Endpoint | Notes |
|---|---|---|
| GET | `/roles` | list all roles with their permission keys |
| GET | `/roles/permissions` | list all available permission keys + descriptions |
| PUT | `/roles/:name` | body `{ permissions: string[] }` — replaces a role's permission set |

Authorization is **not** hardcoded to role names — `authorize()` looks up the caller's role's permissions from MongoDB (via `Role`/`Permission` models) on every request, cached in memory and invalidated on write. Changing a role's permissions here takes effect immediately for every user with that role, no redeploy needed. Seed the default mapping with `npm run seed:roles`. `login`/`GET /auth/me` responses include the resolved `permissions[]` for the current user.

### Status Codes Used
`200` OK · `201` Created · `400` Validation/bad request · `401` Not authenticated · `403` Not authorized · `404` Not found · `409` Conflict (duplicate SKU) · `500` Server error

## Notes on Architecture Choices

- **Modular feature-based structure**: each domain (`auth`, `product`, `sale`, `dashboard`) owns its model/controller/service/routes/validation.
- **Generic query builder** (`src/utils/queryBuilder.ts`): reusable search/filter/sort/pagination helper shared by the products and sales list endpoints.
- **Global error handler**: all thrown errors (including Mongoose validation/cast errors and duplicate-key errors) are normalized to the same JSON error shape.
- **Cloudinary for images**: used when `CLOUDINARY_*` env vars are set to real values — required in production, since hosting platforms like Render/Railway use ephemeral filesystems and files written to disk are lost on redeploy/restart. If Cloudinary isn't configured, uploads automatically fall back to local disk (served at `/uploads/products/...`) — convenient for local dev, but **do not rely on this in production**.
- **Dynamic Role & Permission Management**: role → permission mapping lives in Mongo (`Role`, `Permission` models) instead of a hardcoded array, so `authorize()` can be reconfigured via the `/roles` API without a code change.
