import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  LayoutDashboard, 
  Package, 
  Warehouse, 
  BarChart3, 
  Settings,
  LogOut,
  Users,
  ShoppingBag,
  Heart
} from "lucide-react";

export default function Analytics() {
  const [location, setLocation] = useLocation();
  const adminToken = localStorage.getItem("adminToken");

  const { data: customers, isLoading: loadingCustomers } = useQuery({
    queryKey: ["/api/admin/customers"],
    enabled: !!adminToken
  });

  const { data: orders, isLoading: loadingOrders } = useQuery({
    queryKey: ["/api/admin/orders"],
    enabled: !!adminToken
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ramani Admin</h1>
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
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-64 p-4">
          <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      <main className="ml-64 flex-1 p-8">
        <div className="max-w-7xl">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-page-title">
              Customer Analytics
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Detailed insights into your customer base
            </p>
          </div>

          {loadingCustomers ? (
            <div className="text-center py-12">Loading analytics...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-total-customers">
                      {customers?.length || 0}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-total-orders-analytics">
                      {orders?.length || 0}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-avg-order-value">
                      ₹{orders?.length ? Math.round(orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0) / orders.length) : 0}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Customer Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Total Orders</TableHead>
                        <TableHead>Total Spent</TableHead>
                        <TableHead>Wishlist Items</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers?.map((customer: any) => (
                        <TableRow key={customer._id} data-testid={`row-customer-${customer._id}`}>
                          <TableCell className="font-medium">{customer.name || 'N/A'}</TableCell>
                          <TableCell>{customer.email}</TableCell>
                          <TableCell>{customer.totalOrders || 0}</TableCell>
                          <TableCell>₹{customer.totalSpent?.toLocaleString() || 0}</TableCell>
                          <TableCell>{customer.wishlistCount || 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order Number</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders?.slice(0, 10).map((order: any) => (
                        <TableRow key={order._id} data-testid={`row-order-${order._id}`}>
                          <TableCell className="font-medium">{order.orderNumber || order._id}</TableCell>
                          <TableCell>{order.userId?.name || order.userId?.email || 'N/A'}</TableCell>
                          <TableCell>₹{order.totalAmount?.toLocaleString()}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                              {order.status || 'pending'}
                            </span>
                          </TableCell>
                          <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function TrendingUp({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
