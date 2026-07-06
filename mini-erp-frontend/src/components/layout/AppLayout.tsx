import { NavLink, Outlet } from "react-router-dom";
import { useAppDispatch, useAuth } from "@/hooks/useAuth";
import { logout } from "@/store/authSlice";
import { cn } from "@/lib/cn";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/products", label: "Products" },
  { to: "/sales/new", label: "Create Sale" },
];

export function AppLayout() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-60 flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-4">
          <h1 className="text-lg font-bold text-brand-700">Mini ERP</h1>
          <p className="text-xs text-slate-500">Inventory & Sales</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100",
                  isActive && "bg-brand-50 text-brand-700"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-100 p-4">
          <p className="text-sm font-medium text-slate-900">{user?.name}</p>
          <p className="text-xs capitalize text-slate-500">{user?.role}</p>
          <button
            onClick={() => dispatch(logout())}
            className="mt-3 text-sm font-medium text-red-600 hover:underline"
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
