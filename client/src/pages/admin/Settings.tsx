import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  LayoutDashboard, 
  Package, 
  Warehouse, 
  BarChart3, 
  Settings,
  LogOut
} from "lucide-react";

export default function AdminSettings() {
  const [location, setLocation] = useLocation();
  const adminToken = localStorage.getItem("adminToken");

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
        <div className="max-w-4xl">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-page-title">
              Settings
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Manage your admin preferences and store settings
            </p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Admin Profile</CardTitle>
                <CardDescription>Update your admin account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="adminEmail">Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    defaultValue="admin@ramanifashion.com"
                    disabled
                    data-testid="input-admin-email"
                  />
                </div>
                <div>
                  <Label htmlFor="adminRole">Role</Label>
                  <Input
                    id="adminRole"
                    defaultValue="Administrator"
                    disabled
                    data-testid="input-admin-role"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Store Settings</CardTitle>
                <CardDescription>Configure your store's basic settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input
                    id="storeName"
                    defaultValue="Ramani Fashion"
                    data-testid="input-store-name"
                  />
                </div>
                <div>
                  <Label htmlFor="storeEmail">Contact Email</Label>
                  <Input
                    id="storeEmail"
                    type="email"
                    defaultValue="contact@ramanifashion.com"
                    data-testid="input-store-email"
                  />
                </div>
                <div>
                  <Label htmlFor="storePhone">Contact Phone</Label>
                  <Input
                    id="storePhone"
                    defaultValue="+91 5555555555"
                    data-testid="input-store-phone"
                  />
                </div>
                <Button data-testid="button-save-settings">Save Changes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Manage your notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="lowStockAlert">Low Stock Alerts</Label>
                  <input type="checkbox" id="lowStockAlert" defaultChecked className="h-4 w-4" data-testid="checkbox-low-stock" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="newOrderAlert">New Order Notifications</Label>
                  <input type="checkbox" id="newOrderAlert" defaultChecked className="h-4 w-4" data-testid="checkbox-new-order" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="customerAlert">New Customer Alerts</Label>
                  <input type="checkbox" id="customerAlert" className="h-4 w-4" data-testid="checkbox-new-customer" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
