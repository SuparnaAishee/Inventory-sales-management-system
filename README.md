# Inventory & Sales Management System (Mini ERP)

A full-stack MERN application for inventory and sales management with JWT authentication and role-based access control (admin / manager / employee).

## Structure

```
mini-erp-backend/    Node.js + Express + TypeScript + MongoDB API
mini-erp-frontend/   React + TypeScript + Tailwind CSS client
```

Each folder is a standalone project with its own `package.json`, `README.md` (setup instructions, environment variables) and, for the backend, full API documentation.

## Quick Start

1. **Backend** — see `mini-erp-backend/README.md`
   ```bash
   cd mini-erp-backend
   npm install
   cp .env.example .env   # fill in MongoDB URI, JWT secret, Cloudinary credentials
   npm run seed:admin     # creates the initial admin user
   npm run dev
   ```

2. **Frontend** — see `mini-erp-frontend/README.md`
   ```bash
   cd mini-erp-frontend
   npm install
   cp .env.example .env   # point VITE_API_BASE_URL at the backend
   npm run dev
   ```

## Roles

| Role | Permissions |
|---|---|
| Admin | Full access |
| Manager | Manage products, create sales |
| Employee | View products, create sales |

## Tech Stack

Node.js, Express, TypeScript, MongoDB, Mongoose, JWT — React, React Router, TypeScript, Tailwind CSS, TanStack Query, Redux Toolkit (auth state).
