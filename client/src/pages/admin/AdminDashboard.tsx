import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";

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

  // Use real data from API, with fallback for empty data
  const salesData = analytics?.salesData && analytics.salesData.length > 0 
    ? analytics.salesData 
    : [{ month: 'No data', revenue: 0, orders: 0 }];

  const categoryData = analytics?.categoryData && analytics.categoryData.length > 0
    ? analytics.categoryData
    : [{ name: 'No data', value: 1 }];

  const recentActivity = analytics?.recentActivity && analytics.recentActivity.length > 0
    ? analytics.recentActivity
    : [{ month: 'No data', sales: 0 }];

  const COLORS = ['#ec4899', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#6366f1'];

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
              <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-pink-500 bg-clip-text text-transparent" data-testid="text-admin-title">
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
                  data-testid={`link-${item.label.toLowerCase()}`}
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
            data-testid="button-logout"
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
              Dashboard Overview
            </h2>
            <p className="text-muted-foreground">
              Monitor your store's performance and insights
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading analytics...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="border-pink-100 dark:border-gray-700 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-pink-50 dark:from-gray-800 dark:to-gray-750" data-testid="card-stat-products">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Products</CardTitle>
                    <div className="w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                      <Package className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1" data-testid="text-total-products">
                      {analytics?.totalProducts || 0}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                      <span className="text-green-600 font-medium">12%</span> from last month
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-purple-100 dark:border-gray-700 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-gray-750" data-testid="card-stat-users">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Customers</CardTitle>
                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1" data-testid="text-total-users">
                      {analytics?.totalUsers || 0}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                      <span className="text-green-600 font-medium">8%</span> from last month
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-cyan-100 dark:border-gray-700 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-cyan-50 dark:from-gray-800 dark:to-gray-750" data-testid="card-stat-orders">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Orders</CardTitle>
                    <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1" data-testid="text-total-orders">
                      {analytics?.totalOrders || 0}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
                      <span className="text-red-600 font-medium">3%</span> from last month
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-pink-100 dark:border-gray-700 hover:shadow-lg transition-shadow bg-gradient-to-br from-pink-500 to-pink-600 text-white" data-testid="card-stat-revenue">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-pink-50">Total Revenue</CardTitle>
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                      <IndianRupee className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-1" data-testid="text-total-revenue">
                      ₹{analytics?.totalRevenue?.toLocaleString() || 0}
                    </div>
                    <p className="text-xs text-pink-100 flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      <span className="font-medium">15%</span> from last month
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Revenue Trend Chart */}
                <Card className="border-pink-100 dark:border-gray-700 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Trend</CardTitle>
                    <CardDescription>Monthly revenue overview</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={salesData}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #d1fae5',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorRevenue)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Category Distribution */}
                <Card className="border-pink-100 dark:border-gray-700 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Category Distribution</CardTitle>
                    <CardDescription>Sales by product category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #fce7f3',
                            borderRadius: '8px'
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Orders Trend */}
                <Card className="border-pink-100 dark:border-gray-700 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Orders Overview</CardTitle>
                    <CardDescription>Monthly order statistics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #dbeafe',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }} 
                        />
                        <Bar dataKey="orders" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="border-pink-100 dark:border-gray-700 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Weekly Sales</CardTitle>
                    <CardDescription>Last 4 weeks performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={recentActivity}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #fed7aa',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="sales" 
                          stroke="#f59e0b" 
                          strokeWidth={3}
                          dot={{ fill: '#f59e0b', r: 5 }}
                          activeDot={{ r: 7 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Bottom Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Inventory Alerts */}
                <Card className="border-pink-100 dark:border-gray-700 shadow-md" data-testid="card-inventory-alerts">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mr-3">
                        <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      Inventory Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-orange-500 mr-3"></div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Low Stock Products</span>
                      </div>
                      <span className="font-bold text-2xl text-orange-600 dark:text-orange-400" data-testid="text-low-stock">
                        {analytics?.lowStockProducts || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-red-500 mr-3"></div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Out of Stock</span>
                      </div>
                      <span className="font-bold text-2xl text-red-600 dark:text-red-400" data-testid="text-out-of-stock">
                        {analytics?.outOfStockProducts || 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Orders */}
                <Card className="border-pink-100 dark:border-gray-700 shadow-md" data-testid="card-recent-orders">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Recent Orders</CardTitle>
                    <CardDescription>Latest customer purchases</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics?.recentOrders?.slice(0, 5).map((order: any) => (
                        <div 
                          key={order._id} 
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-pink-50 dark:hover:bg-gray-700/50 transition-colors border border-gray-100 dark:border-gray-700" 
                          data-testid={`order-${order._id}`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
                              <ShoppingCart className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                {order.orderNumber || order._id.slice(0, 8)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-pink-600 dark:text-pink-400">
                            ₹{order.totalAmount?.toLocaleString()}
                          </span>
                        </div>
                      )) || <p className="text-center text-muted-foreground py-8">No recent orders</p>}
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
