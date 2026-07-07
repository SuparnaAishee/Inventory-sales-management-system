import { NavLink, Outlet } from "react-router-dom";
import { useAppDispatch, useAuth } from "@/hooks/useAuth";
import { logout } from "@/store/authSlice";
import { cn } from "@/lib/cn";
import { Barcode } from "@/components/ui/Barcode";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/products", label: "Products" },
  { to: "/sales/new", label: "Create Sale" },
];

export function AppLayout() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const canManageRoles = user?.permissions?.includes("roles:manage") ?? false;

  return (
    <div className="flex min-h-screen bg-[#f7f4ec]">
      <aside className="flex w-60 flex-col bg-stone-900 text-stone-300">
        <div className="flex items-center gap-3 px-5 py-5">
          <Barcode className="h-6 text-brand-500" barClassName="rounded-[1px]" />
          <div>
            <h1 className="font-display text-base font-extrabold tracking-wide text-white">
              MINI ERP
            </h1>
            <p className="text-[11px] uppercase tracking-widest text-stone-500">
              Inventory &amp; Sales
            </p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "rounded-md border-l-4 border-transparent px-3 py-2 text-sm font-medium text-stone-400 transition-colors hover:bg-stone-800 hover:text-white",
                  isActive && "border-brand-500 bg-stone-800 text-white"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
          {canManageRoles && (
            <NavLink
              to="/roles"
              className={({ isActive }) =>
                cn(
                  "rounded-md border-l-4 border-transparent px-3 py-2 text-sm font-medium text-stone-400 transition-colors hover:bg-stone-800 hover:text-white",
                  isActive && "border-brand-500 bg-stone-800 text-white"
                )
              }
            >
              Roles
            </NavLink>
          )}
        </nav>
        <div className="border-t border-stone-800 p-4">
          <p className="text-sm font-medium text-white">{user?.name}</p>
          <p className="font-mono text-[11px] uppercase tracking-widest text-brand-500">
            {user?.role}
          </p>
          <button
            onClick={() => dispatch(logout())}
            className="mt-3 text-sm font-medium text-stone-400 hover:text-red-400 hover:underline"
          >
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
