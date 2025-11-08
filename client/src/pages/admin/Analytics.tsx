import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  TrendingUp,
  Heart,
  ArrowUpRight,
  IndianRupee
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";

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

  // Sample data for customer growth chart
  const customerGrowth = [
    { month: 'Jan', customers: 120 },
    { month: 'Feb', customers: 145 },
    { month: 'Mar', customers: 178 },
    { month: 'Apr', customers: 210 },
    { month: 'May', customers: 245 },
    { month: 'Jun', customers: 280 },
  ];

  // Sample data for order trends
  const orderTrends = [
    { month: 'Jan', completed: 95, pending: 15, cancelled: 10 },
    { month: 'Feb', completed: 110, pending: 20, cancelled: 15 },
    { month: 'Mar', completed: 125, pending: 18, cancelled: 12 },
    { month: 'Apr', completed: 145, pending: 22, cancelled: 8 },
    { month: 'May', completed: 155, pending: 25, cancelled: 10 },
    { month: 'Jun', completed: 175, pending: 28, cancelled: 7 },
  ];

  const avgOrderValue = orders?.length 
    ? Math.round(orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0) / orders.length)
    : 0;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-pink-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Sidebar */}
      <aside className="w-72 bg-white dark:bg-gray-800 border-r border-pink-100 dark:border-gray-700 fixed h-full shadow-lg">
        <div className="p-6 border-b border-pink-100 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-pink-500 bg-clip-text text-transparent">
                Ramani Admin
              </h1>
              <p className="text-xs text-muted-foreground">Fashion Management</p>
            </div>
          </div>
        </div>
        
        <nav className="px-4 py-6 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start ${isActive ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700' : 'hover:bg-pink-50 dark:hover:bg-gray-700'}`}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-72 p-4 border-t border-pink-100 dark:border-gray-700 bg-white dark:bg-gray-800">
          <Button
            variant="outline"
            className="w-full justify-start border-pink-200 hover:bg-pink-50 hover:border-pink-300 dark:border-gray-600 dark:hover:bg-gray-700"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-4 w-4 text-pink-600 dark:text-pink-400" />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-72 flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2" data-testid="text-page-title">
              Customer Analytics
            </h2>
            <p className="text-muted-foreground">
              Detailed insights into your customer base and order trends
            </p>
          </div>

          {loadingCustomers ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading analytics...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="border-purple-100 dark:border-gray-700 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-gray-750">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Customers</CardTitle>
                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1" data-testid="text-total-customers">
                      {customers?.length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                      <span className="text-green-600 font-medium">18%</span> growth this month
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-blue-100 dark:border-gray-700 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-750">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Orders</CardTitle>
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <ShoppingBag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1" data-testid="text-total-orders-analytics">
                      {orders?.length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                      <span className="text-green-600 font-medium">12%</span> from last month
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-pink-100 dark:border-gray-700 hover:shadow-lg transition-shadow bg-gradient-to-br from-pink-500 to-pink-600 text-white">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-pink-50">Avg. Order Value</CardTitle>
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                      <IndianRupee className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-1" data-testid="text-avg-order-value">
                      ₹{avgOrderValue.toLocaleString()}
                    </div>
                    <p className="text-xs text-pink-100 flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      <span className="font-medium">8%</span> increase this month
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Customer Growth Chart */}
                <Card className="border-pink-100 dark:border-gray-700 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Customer Growth</CardTitle>
                    <CardDescription>New customer registrations over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={customerGrowth}>
                        <defs>
                          <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e9d5ff',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="customers" 
                          stroke="#8b5cf6" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorCustomers)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Order Status Trends */}
                <Card className="border-pink-100 dark:border-gray-700 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Order Status Trends</CardTitle>
                    <CardDescription>Monthly order status breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={orderTrends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }} 
                        />
                        <Bar dataKey="completed" fill="#10b981" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="pending" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="cancelled" fill="#ef4444" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Customer Details Table */}
              <Card className="mb-6 border-pink-100 dark:border-gray-700 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Customer Details</CardTitle>
                  <CardDescription>Comprehensive customer information and statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-pink-100 dark:border-gray-700 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-pink-50 dark:bg-gray-800/50 hover:bg-pink-50 dark:hover:bg-gray-800/50">
                          <TableHead className="font-semibold text-gray-900 dark:text-white">Customer Name</TableHead>
                          <TableHead className="font-semibold text-gray-900 dark:text-white">Email</TableHead>
                          <TableHead className="font-semibold text-gray-900 dark:text-white">Total Orders</TableHead>
                          <TableHead className="font-semibold text-gray-900 dark:text-white">Total Spent</TableHead>
                          <TableHead className="font-semibold text-gray-900 dark:text-white">Wishlist</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customers?.map((customer: any) => (
                          <TableRow 
                            key={customer._id} 
                            data-testid={`row-customer-${customer._id}`}
                            className="hover:bg-pink-50 dark:hover:bg-gray-800/30 transition-colors"
                          >
                            <TableCell className="font-medium">{customer.name || 'N/A'}</TableCell>
                            <TableCell className="text-muted-foreground">{customer.email}</TableCell>
                            <TableCell>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400">
                                {customer.totalOrders || 0}
                              </span>
                            </TableCell>
                            <TableCell className="font-semibold text-pink-600 dark:text-pink-400">
                              ₹{customer.totalSpent?.toLocaleString() || 0}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Heart className="h-4 w-4 text-pink-500 mr-1" />
                                <span>{customer.wishlistCount || 0}</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Orders Table */}
              <Card className="border-pink-100 dark:border-gray-700 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Recent Orders</CardTitle>
                  <CardDescription>Latest orders from your customers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-pink-100 dark:border-gray-700 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-pink-50 dark:bg-gray-800/50 hover:bg-pink-50 dark:hover:bg-gray-800/50">
                          <TableHead className="font-semibold text-gray-900 dark:text-white">Order Number</TableHead>
                          <TableHead className="font-semibold text-gray-900 dark:text-white">Customer</TableHead>
                          <TableHead className="font-semibold text-gray-900 dark:text-white">Amount</TableHead>
                          <TableHead className="font-semibold text-gray-900 dark:text-white">Status</TableHead>
                          <TableHead className="font-semibold text-gray-900 dark:text-white">Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders?.slice(0, 10).map((order: any) => (
                          <TableRow 
                            key={order._id} 
                            data-testid={`row-order-${order._id}`}
                            className="hover:bg-pink-50 dark:hover:bg-gray-800/30 transition-colors"
                          >
                            <TableCell className="font-medium">{order.orderNumber || order._id.slice(0, 8)}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {order.userId?.name || order.userId?.email || 'N/A'}
                            </TableCell>
                            <TableCell className="font-semibold text-pink-600 dark:text-pink-400">
                              ₹{order.totalAmount?.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                {order.status || 'pending'}
                              </span>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
