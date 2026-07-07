export const PERMISSIONS = {
  PRODUCTS_VIEW: "products:view",
  PRODUCTS_MANAGE: "products:manage",
  SALES_CREATE: "sales:create",
  SALES_VIEW: "sales:view",
  DASHBOARD_VIEW: "dashboard:view",
  ROLES_MANAGE: "roles:manage",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: { key: PermissionKey; description: string }[] = [
  { key: PERMISSIONS.PRODUCTS_VIEW, description: "View products" },
  { key: PERMISSIONS.PRODUCTS_MANAGE, description: "Create, update, and delete products" },
  { key: PERMISSIONS.SALES_CREATE, description: "Create sales" },
  { key: PERMISSIONS.SALES_VIEW, description: "View sale history" },
  { key: PERMISSIONS.DASHBOARD_VIEW, description: "View dashboard stats" },
  { key: PERMISSIONS.ROLES_MANAGE, description: "Manage roles and their permissions" },
];

export const DEFAULT_ROLE_PERMISSIONS: Record<string, PermissionKey[]> = {
  admin: [
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_MANAGE,
    PERMISSIONS.SALES_CREATE,
    PERMISSIONS.SALES_VIEW,
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.ROLES_MANAGE,
  ],
  manager: [
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_MANAGE,
    PERMISSIONS.SALES_CREATE,
    PERMISSIONS.SALES_VIEW,
    PERMISSIONS.DASHBOARD_VIEW,
  ],
  employee: [PERMISSIONS.PRODUCTS_VIEW, PERMISSIONS.SALES_CREATE, PERMISSIONS.DASHBOARD_VIEW],
};
