import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import AdminLayout from "@/components/AdminLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Users,
  ShoppingBag,
  Heart,
  ArrowUpRight,
  ArrowDownRight,
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
  AreaChart,
  Legend
} from "recharts";

interface AnalyticsData {
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  recentOrders: any[];
  topProducts: any[];
  salesData: { month: string; revenue: number; orders: number }[];
  categoryData: { name: string; value: number; percentage: number }[];
  recentActivity: { month: string; sales: number }[];
  customerGrowthData: { month: string; customers: number; newCustomers: number }[];
  orderTrendsData: { month: string; completed: number; pending: number; cancelled: number; processing: number; shipped: number }[];
  growthStats: {
    orderGrowth: number;
    customerGrowthPercentage: number;
    avgOrderValueGrowth: number;
  };
}

export default function Analytics() {
  const adminToken = localStorage.getItem("adminToken");

  const { data: customersData, isLoading: loadingCustomers } = useQuery<{
    customers: any[];
    pagination: any;
  }>({
    queryKey: ["/api/admin/customers"],
    enabled: !!adminToken
  });

  const { data: ordersData, isLoading: loadingOrders } = useQuery<{
    orders: any[];
    pagination: any;
  }>({
    queryKey: ["/api/admin/orders"],
    enabled: !!adminToken
  });

  const { data: analyticsData, isLoading: loadingAnalytics } = useQuery<AnalyticsData>({
    queryKey: ["/api/admin/analytics"],
    enabled: !!adminToken
  });

  const customers = customersData?.customers || [];
  const orders = ordersData?.orders || [];

  // Use real data from analytics API or fallback to empty arrays
  const customerGrowth = analyticsData?.customerGrowthData || [];
  const orderTrends = analyticsData?.orderTrendsData || [];
  const growthStats = analyticsData?.growthStats || { orderGrowth: 0, customerGrowthPercentage: 0, avgOrderValueGrowth: 0 };

  const avgOrderValue = orders.length 
    ? Math.round(orders.reduce((sum: number, o: any) => sum + (o.total || o.totalAmount || 0), 0) / orders.length)
    : 0;

  return (
    <AdminLayout>
      <div className="p-8">
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

          {(loadingCustomers || loadingAnalytics) ? (
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
                      {customers.length}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center">
                      {growthStats.customerGrowthPercentage >= 0 ? (
                        <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
                      )}
                      <span className={`font-medium ${growthStats.customerGrowthPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(growthStats.customerGrowthPercentage)}%
                      </span> {growthStats.customerGrowthPercentage >= 0 ? 'growth' : 'decline'} this month
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
                      {orders.length}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center">
                      {growthStats.orderGrowth >= 0 ? (
                        <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
                      )}
                      <span className={`font-medium ${growthStats.orderGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(growthStats.orderGrowth)}%
                      </span> from last month
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
                      {growthStats.avgOrderValueGrowth >= 0 ? (
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 mr-1" />
                      )}
                      <span className="font-medium">{Math.abs(growthStats.avgOrderValueGrowth)}%</span> {growthStats.avgOrderValueGrowth >= 0 ? 'increase' : 'decrease'} this month
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
                    <CardDescription>Cumulative customer count over the last 6 months</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {customerGrowth.length > 0 ? (
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
                            formatter={(value: number, name: string) => [
                              value,
                              name === 'customers' ? 'Total Customers' : 'New This Month'
                            ]}
                          />
                          <Legend 
                            formatter={(value) => value === 'customers' ? 'Total Customers' : 'New This Month'}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="customers" 
                            name="customers"
                            stroke="#8b5cf6" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorCustomers)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        No customer data available for the last 6 months
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Order Status Trends */}
                <Card className="border-pink-100 dark:border-gray-700 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Order Status Trends</CardTitle>
                    <CardDescription>Monthly order status breakdown (last 6 months)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {orderTrends.length > 0 ? (
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
                          <Legend />
                          <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="cancelled" name="Cancelled" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        No order data available for the last 6 months
                      </div>
                    )}
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
                        {customers.map((customer: any) => (
                          <TableRow 
                            key={customer._id} 
                            data-testid={`row-customer-${customer._id}`}
                            className="hover:bg-pink-50 dark:hover:bg-gray-800/30 transition-colors"
                          >
                            <TableCell className="font-medium">{customer.name || 'N/A'}</TableCell>
                            <TableCell className="text-muted-foreground">{customer.email}</TableCell>
                            <TableCell>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400">
                                {customer.stats?.totalOrders || customer.totalOrders || 0}
                              </span>
                            </TableCell>
                            <TableCell className="font-semibold text-pink-600 dark:text-pink-400">
                              ₹{(customer.stats?.totalSpent || customer.totalSpent || 0).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Heart className="h-4 w-4 text-pink-500 mr-1" />
                                <span>{customer.stats?.wishlistCount || customer.wishlistCount || 0}</span>
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
                        {orders.slice(0, 10).map((order: any) => (
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
                              ₹{(order.total || order.totalAmount || 0).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                {order.orderStatus || order.status || 'pending'}
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
      </div>
    </AdminLayout>
  );
}
