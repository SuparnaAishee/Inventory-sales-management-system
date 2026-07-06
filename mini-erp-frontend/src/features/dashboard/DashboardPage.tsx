import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStats } from "@/api/dashboard.api";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (isError || !data) {
    return <p className="text-sm text-red-600">Failed to load dashboard stats.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Overview of inventory and sales</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Products" value={data.totalProducts} />
        <StatCard label="Total Sales" value={data.totalSales} />
        <StatCard label="Low Stock Products" value={data.lowStockProducts.length} />
      </div>

      <Card>
        <CardContent>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            Low Stock Products (below 5 units)
          </h2>
          {data.lowStockProducts.length === 0 ? (
            <p className="text-sm text-slate-500">No low stock products.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">SKU</th>
                    <th className="py-2 pr-4">Category</th>
                    <th className="py-2 pr-4">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {data.lowStockProducts.map((product) => (
                    <tr key={product._id} className="border-b border-slate-100">
                      <td className="py-2 pr-4 font-medium text-slate-900">{product.name}</td>
                      <td className="py-2 pr-4 text-slate-600">{product.sku}</td>
                      <td className="py-2 pr-4 text-slate-600">{product.category}</td>
                      <td className="py-2 pr-4">
                        <Badge tone="danger">{product.stockQuantity} left</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
