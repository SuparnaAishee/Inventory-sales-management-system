const productSchema = {
  type: "object",
  properties: {
    _id: { type: "string" },
    name: { type: "string" },
    sku: { type: "string" },
    category: { type: "string" },
    purchasePrice: { type: "number" },
    sellingPrice: { type: "number" },
    stockQuantity: { type: "number" },
    imageUrl: { type: "string" },
    imagePublicId: { type: "string" },
    createdBy: { type: "string" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
};

const saleSchema = {
  type: "object",
  properties: {
    _id: { type: "string" },
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          product: { type: "string" },
          quantity: { type: "number" },
          priceAtSale: { type: "number" },
          subtotal: { type: "number" },
        },
      },
    },
    grandTotal: { type: "number" },
    createdBy: { type: "string" },
    createdAt: { type: "string", format: "date-time" },
  },
};

const userSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    email: { type: "string" },
    role: { type: "string", enum: ["admin", "manager", "employee"] },
    permissions: { type: "array", items: { type: "string" } },
  },
};

const roleSchema = {
  type: "object",
  properties: {
    _id: { type: "string" },
    name: { type: "string" },
    permissions: { type: "array", items: { type: "string" } },
  },
};

const permissionSchema = {
  type: "object",
  properties: {
    _id: { type: "string" },
    key: { type: "string" },
    description: { type: "string" },
  },
};

const errorResponse = {
  type: "object",
  properties: {
    success: { type: "boolean", example: false },
    message: { type: "string" },
    errors: { type: "array", items: {} },
  },
};

function paginated(itemSchema: object) {
  return {
    type: "object",
    properties: {
      items: { type: "array", items: itemSchema },
      total: { type: "number" },
      page: { type: "number" },
      limit: { type: "number" },
      totalPages: { type: "number" },
    },
  };
}

function success(dataSchema: object) {
  return {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string" },
      data: dataSchema,
    },
  };
}

const bearerAuth = [{ bearerAuth: [] as string[] }];

export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "Mini ERP API",
    version: "1.0.0",
    description:
      "Inventory & Sales Management System — REST API. All responses use a consistent envelope: " +
      "`{ success, data, message }` on success, `{ success: false, message, errors }` on failure.",
  },
  servers: [
    { url: "https://inventory-sales-management-system.onrender.com/api/v1", description: "Production (Render)" },
    { url: "http://localhost:5000/api/v1", description: "Local development" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    responses: {
      Unauthorized: { description: "Missing or invalid JWT", content: { "application/json": { schema: errorResponse } } },
      Forbidden: { description: "Authenticated but lacks the required permission", content: { "application/json": { schema: errorResponse } } },
      NotFound: { description: "Resource not found", content: { "application/json": { schema: errorResponse } } },
      ValidationError: { description: "Input validation failed", content: { "application/json": { schema: errorResponse } } },
    },
  },
  security: bearerAuth,
  tags: [
    { name: "Auth" },
    { name: "Products" },
    { name: "Sales" },
    { name: "Dashboard" },
    { name: "Roles & Permissions" },
  ],
  paths: {
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Log in and receive a JWT",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", example: "admin@example.com" },
                  password: { type: "string", example: "Admin@12345" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful",
            content: {
              "application/json": {
                schema: success({
                  type: "object",
                  properties: { token: { type: "string" }, user: userSchema },
                }),
              },
            },
          },
          401: { description: "Invalid credentials", content: { "application/json": { schema: errorResponse } } },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get the current authenticated user's profile",
        responses: {
          200: { description: "Current user", content: { "application/json": { schema: success(userSchema) } } },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/products": {
      get: {
        tags: ["Products"],
        summary: "List products (search, filter, sort, paginate)",
        parameters: [
          { name: "search", in: "query", schema: { type: "string" }, description: "Matches name, sku, or category" },
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          { name: "sort", in: "query", schema: { type: "string", default: "-createdAt" } },
        ],
        responses: {
          200: { description: "Paginated product list", content: { "application/json": { schema: success(paginated(productSchema)) } } },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
      post: {
        tags: ["Products"],
        summary: "Create a product (requires products:manage)",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["name", "sku", "category", "purchasePrice", "sellingPrice", "stockQuantity", "image"],
                properties: {
                  name: { type: "string" },
                  sku: { type: "string" },
                  category: { type: "string" },
                  purchasePrice: { type: "number" },
                  sellingPrice: { type: "number" },
                  stockQuantity: { type: "number" },
                  image: { type: "string", format: "binary", description: "Required on create" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Product created", content: { "application/json": { schema: success(productSchema) } } },
          400: { $ref: "#/components/responses/ValidationError" },
          403: { $ref: "#/components/responses/Forbidden" },
          409: { description: "Duplicate SKU", content: { "application/json": { schema: errorResponse } } },
        },
      },
    },
    "/products/{id}": {
      get: {
        tags: ["Products"],
        summary: "Get a single product",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Product", content: { "application/json": { schema: success(productSchema) } } },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
      put: {
        tags: ["Products"],
        summary: "Update a product (requires products:manage)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  sku: { type: "string" },
                  category: { type: "string" },
                  purchasePrice: { type: "number" },
                  sellingPrice: { type: "number" },
                  stockQuantity: { type: "number" },
                  image: { type: "string", format: "binary", description: "Optional — omit to keep current image" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Product updated", content: { "application/json": { schema: success(productSchema) } } },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
      delete: {
        tags: ["Products"],
        summary: "Delete a product (requires products:manage)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Product deleted", content: { "application/json": { schema: success({ type: "null" }) } } },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/sales": {
      post: {
        tags: ["Sales"],
        summary: "Create a sale (requires sales:create)",
        description:
          "Validates stock availability for every item before decrementing any stock, snapshots sellingPrice as priceAtSale, computes grandTotal, and stores the sale.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["items"],
                properties: {
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      required: ["productId", "quantity"],
                      properties: {
                        productId: { type: "string" },
                        quantity: { type: "number", minimum: 1 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Sale created", content: { "application/json": { schema: success(saleSchema) } } },
          400: { description: "Insufficient stock or validation error", content: { "application/json": { schema: errorResponse } } },
          404: { description: "A product id does not exist", content: { "application/json": { schema: errorResponse } } },
        },
      },
      get: {
        tags: ["Sales"],
        summary: "List sale history (requires sales:view)",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          { name: "sort", in: "query", schema: { type: "string", default: "-createdAt" } },
        ],
        responses: {
          200: { description: "Paginated sale list", content: { "application/json": { schema: success(paginated(saleSchema)) } } },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/sales/{id}": {
      get: {
        tags: ["Sales"],
        summary: "Get sale detail (requires sales:view)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Sale", content: { "application/json": { schema: success(saleSchema) } } },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/dashboard/stats": {
      get: {
        tags: ["Dashboard"],
        summary: "Get aggregate stats (requires dashboard:view)",
        responses: {
          200: {
            description: "Dashboard stats",
            content: {
              "application/json": {
                schema: success({
                  type: "object",
                  properties: {
                    totalProducts: { type: "number" },
                    totalSales: { type: "number" },
                    lowStockProducts: { type: "array", items: productSchema, description: "stockQuantity < 5" },
                  },
                }),
              },
            },
          },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/roles": {
      get: {
        tags: ["Roles & Permissions"],
        summary: "List all roles with their permissions (requires roles:manage)",
        responses: {
          200: { description: "Roles", content: { "application/json": { schema: success({ type: "array", items: roleSchema }) } } },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/roles/permissions": {
      get: {
        tags: ["Roles & Permissions"],
        summary: "List all available permission keys (requires roles:manage)",
        responses: {
          200: { description: "Permissions", content: { "application/json": { schema: success({ type: "array", items: permissionSchema }) } } },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/roles/{name}": {
      put: {
        tags: ["Roles & Permissions"],
        summary: "Replace a role's permission set (requires roles:manage)",
        description: "Takes effect immediately for every user with that role — no redeploy needed.",
        parameters: [{ name: "name", in: "path", required: true, schema: { type: "string", example: "employee" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["permissions"],
                properties: {
                  permissions: {
                    type: "array",
                    items: { type: "string" },
                    example: ["products:view", "sales:create", "dashboard:view"],
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Role updated", content: { "application/json": { schema: success(roleSchema) } } },
          400: { description: "Unknown permission key", content: { "application/json": { schema: errorResponse } } },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
  },
};
