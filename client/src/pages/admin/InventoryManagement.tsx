import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
  LogOut
} from "lucide-react";

export default function InventoryManagement() {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const adminToken = localStorage.getItem("adminToken");

  const { data: inventory, isLoading } = useQuery({
    queryKey: ["/api/admin/inventory"],
    enabled: !!adminToken
  });

  const updateInventoryMutation = useMutation({
    mutationFn: ({ id, stockQuantity, inStock }: any) => 
      apiRequest(`/api/admin/inventory/${id}`, "PATCH", { stockQuantity, inStock }, {
        Authorization: `Bearer ${adminToken}`
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/inventory"] });
      toast({ title: "Inventory updated successfully!" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    setLocation("/login");
  };

  const handleStockUpdate = (productId: string, currentStock: number, inStock: boolean) => {
    const newStock = prompt(`Update stock for product (current: ${currentStock}):`, currentStock.toString());
    if (newStock !== null) {
      updateInventoryMutation.mutate({ 
        id: productId, 
        stockQuantity: parseInt(newStock),
        inStock: parseInt(newStock) > 0 ? true : inStock
      });
    }
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

  const lowStockProducts = inventory?.filter((p: any) => p.stockQuantity < 10 && p.stockQuantity > 0) || [];
  const outOfStockProducts = inventory?.filter((p: any) => !p.inStock || p.stockQuantity === 0) || [];

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
              Inventory Management
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Track and manage product stock levels
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-orange-500">Low Stock Alert</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-low-stock-count">
                  {lowStockProducts.length}
                </div>
                <p className="text-sm text-gray-500">Products with less than 10 units</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-500">Out of Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-out-of-stock-count">
                  {outOfStockProducts.length}
                </div>
                <p className="text-sm text-gray-500">Products currently unavailable</p>
              </CardContent>
            </Card>
          </div>

          {isLoading ? (
            <div className="text-center py-12">Loading inventory...</div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Stock Levels</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory?.map((product: any) => (
                      <TableRow 
                        key={product._id} 
                        data-testid={`row-inventory-${product._id}`}
                        className={product.stockQuantity < 10 ? 'bg-orange-50 dark:bg-orange-900/10' : ''}
                      >
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>
                          <span className={`font-bold ${product.stockQuantity < 10 ? 'text-orange-500' : 'text-green-600'}`}>
                            {product.stockQuantity}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {product.inStock ? 'Available' : 'Out of Stock'}
                          </span>
                        </TableCell>
                        <TableCell>₹{product.price}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStockUpdate(product._id, product.stockQuantity, product.inStock)}
                            data-testid={`button-update-stock-${product._id}`}
                          >
                            Update Stock
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
