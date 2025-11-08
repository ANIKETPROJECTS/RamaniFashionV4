import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  LogOut,
  Plus,
  Pencil,
  Trash2
} from "lucide-react";

export default function ProductManagement() {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const adminToken = localStorage.getItem("adminToken");

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    category: "",
    subcategory: "",
    fabric: "",
    color: "",
    occasion: "",
    pattern: "",
    workType: "",
    blousePiece: false,
    sareeLength: "",
    stockQuantity: "",
    inStock: true,
    isNew: false,
    isTrending: false,
    isBestseller: false,
    images: ""
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/products"],
    enabled: !!adminToken
  });

  const addProductMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/admin/products", "POST", data, {
      Authorization: `Bearer ${adminToken}`
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product added successfully!" });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: any) => apiRequest(`/api/admin/products/${id}`, "PATCH", data, {
      Authorization: `Bearer ${adminToken}`
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product updated successfully!" });
      setEditingProduct(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/admin/products/${id}`, "DELETE", undefined, {
      Authorization: `Bearer ${adminToken}`
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product deleted successfully!" });
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

  const resetForm = () => {
    setProductForm({
      name: "",
      description: "",
      price: "",
      originalPrice: "",
      category: "",
      subcategory: "",
      fabric: "",
      color: "",
      occasion: "",
      pattern: "",
      workType: "",
      blousePiece: false,
      sareeLength: "",
      stockQuantity: "",
      inStock: true,
      isNew: false,
      isTrending: false,
      isBestseller: false,
      images: ""
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formattedData = {
      ...productForm,
      price: parseFloat(productForm.price),
      originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : undefined,
      stockQuantity: parseInt(productForm.stockQuantity) || 0,
      images: productForm.images.split(",").map(url => url.trim()).filter(Boolean)
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct._id, data: formattedData });
    } else {
      addProductMutation.mutate(formattedData);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      originalPrice: product.originalPrice?.toString() || "",
      category: product.category || "",
      subcategory: product.subcategory || "",
      fabric: product.fabric || "",
      color: product.color || "",
      occasion: product.occasion || "",
      pattern: product.pattern || "",
      workType: product.workType || "",
      blousePiece: product.blousePiece || false,
      sareeLength: product.sareeLength || "",
      stockQuantity: product.stockQuantity?.toString() || "",
      inStock: product.inStock !== false,
      isNew: product.isNew || false,
      isTrending: product.isTrending || false,
      isBestseller: product.isBestseller || false,
      images: product.images?.join(", ") || ""
    });
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
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      <main className="ml-64 flex-1 p-8">
        <div className="max-w-7xl">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-page-title">
                Product Management
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Add, edit, and manage your products
              </p>
            </div>
            <Dialog open={isAddDialogOpen || !!editingProduct} onOpenChange={(open) => {
              if (!open) {
                setIsAddDialogOpen(false);
                setEditingProduct(null);
                resetForm();
              }
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-product">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        required
                        data-testid="input-product-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select value={productForm.category} onValueChange={(value) => setProductForm({ ...productForm, category: value })}>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ajrakh Modal">Ajrakh Modal</SelectItem>
                          <SelectItem value="Banarasi">Banarasi</SelectItem>
                          <SelectItem value="Chanderi">Chanderi</SelectItem>
                          <SelectItem value="Jamdani Paithani">Jamdani Paithani</SelectItem>
                          <SelectItem value="Kalamkari">Kalamkari</SelectItem>
                          <SelectItem value="Kanjeevaram">Kanjeevaram</SelectItem>
                          <SelectItem value="Katan">Katan</SelectItem>
                          <SelectItem value="Khadi Cotton">Khadi Cotton</SelectItem>
                          <SelectItem value="Khun / Irkal (Ilkal)">Khun / Irkal (Ilkal)</SelectItem>
                          <SelectItem value="Kota Doria">Kota Doria</SelectItem>
                          <SelectItem value="Mul Mul Cotton">Mul Mul Cotton</SelectItem>
                          <SelectItem value="Patch Work">Patch Work</SelectItem>
                          <SelectItem value="Pure Linen">Pure Linen</SelectItem>
                          <SelectItem value="Tissue">Tissue</SelectItem>
                          <SelectItem value="Contemporary">Contemporary</SelectItem>
                          <SelectItem value="Bridal">Bridal</SelectItem>
                          <SelectItem value="Party Wear">Party Wear</SelectItem>
                          <SelectItem value="Casual">Casual</SelectItem>
                          <SelectItem value="Daily Wear">Daily Wear</SelectItem>
                          <SelectItem value="Evening Wear">Evening Wear</SelectItem>
                          <SelectItem value="Festival Wear">Festival Wear</SelectItem>
                          <SelectItem value="Office Wear">Office Wear</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      required
                      data-testid="input-description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price (₹) *</Label>
                      <Input
                        id="price"
                        type="number"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        required
                        data-testid="input-price"
                      />
                    </div>
                    <div>
                      <Label htmlFor="originalPrice">Original Price (₹) - For Sale</Label>
                      <Input
                        id="originalPrice"
                        type="number"
                        value={productForm.originalPrice}
                        onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                        data-testid="input-original-price"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="fabric">Fabric</Label>
                      <Select value={productForm.fabric} onValueChange={(value) => setProductForm({ ...productForm, fabric: value })}>
                        <SelectTrigger data-testid="select-fabric">
                          <SelectValue placeholder="Select fabric" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Silk">Silk</SelectItem>
                          <SelectItem value="Cotton">Cotton</SelectItem>
                          <SelectItem value="Georgette">Georgette</SelectItem>
                          <SelectItem value="Chiffon">Chiffon</SelectItem>
                          <SelectItem value="Net">Net</SelectItem>
                          <SelectItem value="Crepe">Crepe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="color">Color</Label>
                      <Select value={productForm.color} onValueChange={(value) => setProductForm({ ...productForm, color: value })}>
                        <SelectTrigger data-testid="select-color">
                          <SelectValue placeholder="Select color" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Red">Red</SelectItem>
                          <SelectItem value="Blue">Blue</SelectItem>
                          <SelectItem value="Green">Green</SelectItem>
                          <SelectItem value="Pink">Pink</SelectItem>
                          <SelectItem value="Yellow">Yellow</SelectItem>
                          <SelectItem value="Black">Black</SelectItem>
                          <SelectItem value="White">White</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="occasion">Occasion</Label>
                      <Select value={productForm.occasion} onValueChange={(value) => setProductForm({ ...productForm, occasion: value })}>
                        <SelectTrigger data-testid="select-occasion">
                          <SelectValue placeholder="Select occasion" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Wedding">Wedding</SelectItem>
                          <SelectItem value="Party">Party</SelectItem>
                          <SelectItem value="Festival">Festival</SelectItem>
                          <SelectItem value="Casual">Casual</SelectItem>
                          <SelectItem value="Office">Office</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="stockQuantity">Stock Quantity *</Label>
                      <Input
                        id="stockQuantity"
                        type="number"
                        value={productForm.stockQuantity}
                        onChange={(e) => setProductForm({ ...productForm, stockQuantity: e.target.value })}
                        required
                        data-testid="input-stock-quantity"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sareeLength">Saree Length</Label>
                      <Input
                        id="sareeLength"
                        value={productForm.sareeLength}
                        onChange={(e) => setProductForm({ ...productForm, sareeLength: e.target.value })}
                        placeholder="e.g., 5.5 meters"
                        data-testid="input-saree-length"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="images">Image URLs (comma-separated)</Label>
                    <Textarea
                      id="images"
                      value={productForm.images}
                      onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                      placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                      data-testid="input-images"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="isNew"
                          checked={productForm.isNew}
                          onCheckedChange={(checked) => setProductForm({ ...productForm, isNew: checked as boolean })}
                          data-testid="checkbox-new-arrival"
                        />
                        <Label htmlFor="isNew">Mark as New Arrival</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="isTrending"
                          checked={productForm.isTrending}
                          onCheckedChange={(checked) => setProductForm({ ...productForm, isTrending: checked as boolean })}
                          data-testid="checkbox-trending"
                        />
                        <Label htmlFor="isTrending">Mark as Trending Collection</Label>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="isBestseller"
                          checked={productForm.isBestseller}
                          onCheckedChange={(checked) => setProductForm({ ...productForm, isBestseller: checked as boolean })}
                          data-testid="checkbox-bestseller"
                        />
                        <Label htmlFor="isBestseller">Mark as Bestseller</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="inStock"
                          checked={productForm.inStock}
                          onCheckedChange={(checked) => setProductForm({ ...productForm, inStock: checked as boolean })}
                          data-testid="checkbox-in-stock"
                        />
                        <Label htmlFor="inStock">In Stock</Label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => {
                      setIsAddDialogOpen(false);
                      setEditingProduct(null);
                      resetForm();
                    }}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={addProductMutation.isPending || updateProductMutation.isPending}
                      data-testid="button-save-product"
                    >
                      {editingProduct ? "Update Product" : "Add Product"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="text-center py-12">Loading products...</div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>All Products</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products?.products?.map((product: any) => (
                      <TableRow key={product._id} data-testid={`row-product-${product._id}`}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>₹{product.price}</TableCell>
                        <TableCell>{product.stockQuantity}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(product)}
                              data-testid={`button-edit-${product._id}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteProductMutation.mutate(product._id)}
                              data-testid={`button-delete-${product._id}`}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
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
