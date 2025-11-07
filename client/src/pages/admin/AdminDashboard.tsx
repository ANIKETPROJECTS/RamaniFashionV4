import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Package, 
  Warehouse, 
  BarChart3, 
  Settings,
  LogOut,
  Users,
  ShoppingCart,
  TrendingUp,
  AlertCircle
} from "lucide-react";

export default function AdminDashboard() {
  const [location, setLocation] = useLocation();
  const adminToken = localStorage.getItem("adminToken");

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["/api/admin/analytics"],
    enabled: !!adminToken,
    refetchInterval: 30000,
  });

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    setLocation("/login");
  };

  if (!adminToken) {
    setLocation("/login");
    return null;
  }

  const menuItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/products", label: "Products", icon: Package },
    { path: "/admin/inventory", label: "Inventory", icon: Warehouse },
    { path: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { path: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed h-full">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-admin-title">
            Ramani Admin
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Fashion Management</p>
        </div>
        
        <nav className="px-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  data-testid={`link-${item.label.toLowerCase()}`}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-64 p-4">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      <main className="ml-64 flex-1 p-8">
        <div className="max-w-7xl">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-page-title">
              Dashboard Overview
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Monitor your store's performance
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card data-testid="card-stat-products">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-total-products">
                      {analytics?.totalProducts || 0}
                    </div>
                  </CardContent>
                </Card>

                <Card data-testid="card-stat-users">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-total-users">
                      {analytics?.totalUsers || 0}
                    </div>
                  </CardContent>
                </Card>

                <Card data-testid="card-stat-orders">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-total-orders">
                      {analytics?.totalOrders || 0}
                    </div>
                  </CardContent>
                </Card>

                <Card data-testid="card-stat-revenue">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-total-revenue">
                      ₹{analytics?.totalRevenue?.toLocaleString() || 0}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card data-testid="card-inventory-alerts">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertCircle className="mr-2 h-5 w-5 text-orange-500" />
                      Inventory Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Low Stock Products:</span>
                        <span className="font-bold text-orange-500" data-testid="text-low-stock">
                          {analytics?.lowStockProducts || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Out of Stock:</span>
                        <span className="font-bold text-red-500" data-testid="text-out-of-stock">
                          {analytics?.outOfStockProducts || 0}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card data-testid="card-recent-orders">
                  <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analytics?.recentOrders?.slice(0, 5).map((order: any) => (
                        <div key={order._id} className="flex justify-between text-sm" data-testid={`order-${order._id}`}>
                          <span className="truncate">{order.orderNumber || order._id}</span>
                          <span className="font-medium">₹{order.totalAmount}</span>
                        </div>
                      )) || <p className="text-gray-500">No recent orders</p>}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
