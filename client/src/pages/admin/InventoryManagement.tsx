import { useState, useMemo, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Pencil, Trash2, Upload, X, Link as LinkIcon } from "lucide-react";

export default function InventoryManagement() {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const adminToken = localStorage.getItem("adminToken");

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("stock");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStockStatus, setFilterStockStatus] = useState("all");

  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  
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
    onSale: false,
    fabricComposition: "",
    dimensions: "",
    weight: "",
    careInstructions: "",
    countryOfOrigin: ""
  });

  const { data: inventory, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/inventory"],
    enabled: !!adminToken
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (uploadedImages.length + files.length > 5) {
      toast({ 
        title: "Too many images", 
        description: "Maximum 5 images allowed per product",
        variant: "destructive" 
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    try {
      const response = await fetch('/api/admin/upload-images', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setUploadedImages([...uploadedImages, ...data.urls]);
      toast({ title: "Images uploaded successfully!" });
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      toast({ 
        title: "Upload failed", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const handleAddImageUrl = () => {
    if (!imageUrl.trim()) {
      toast({ 
        title: "URL required", 
        description: "Please enter a valid image URL",
        variant: "destructive" 
      });
      return;
    }

    if (uploadedImages.length >= 5) {
      toast({ 
        title: "Too many images", 
        description: "Maximum 5 images allowed per product",
        variant: "destructive" 
      });
      return;
    }

    try {
      new URL(imageUrl);
      setUploadedImages([...uploadedImages, imageUrl]);
      setImageUrl("");
      toast({ title: "Image URL added successfully!" });
    } catch (error) {
      toast({ 
        title: "Invalid URL", 
        description: "Please enter a valid image URL",
        variant: "destructive" 
      });
    }
  };

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: any) => apiRequest(`/api/admin/products/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product updated successfully!" });
      handleCloseEditDialog();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/admin/products/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product deleted successfully!" });
      setDeleteProductId(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const handleEdit = async (product: any) => {
    setIsLoadingProduct(true);
    setIsEditDialogOpen(true);
    
    try {
      const response = await fetch(`/api/products/${product._id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product details');
      }
      const fullProduct = await response.json();
      
      const images = fullProduct.images || 
        (fullProduct.colorVariants && fullProduct.colorVariants[0]?.images) || 
        [];
      
      console.log("Full product:", fullProduct);
      console.log("Images found:", images);
      
      setEditingProduct(fullProduct);
      setUploadedImages(images);
      setProductForm({
        name: fullProduct.name || "",
        description: fullProduct.description || "",
        price: fullProduct.price?.toString() || "",
        originalPrice: fullProduct.originalPrice?.toString() || "",
        category: fullProduct.category || "",
        subcategory: fullProduct.subcategory || "",
        fabric: fullProduct.fabric || "",
        color: fullProduct.color || (fullProduct.colorVariants && fullProduct.colorVariants[0]?.color) || "",
        occasion: fullProduct.occasion || "",
        pattern: fullProduct.pattern || "",
        workType: fullProduct.workType || "",
        blousePiece: fullProduct.blousePiece || false,
        sareeLength: fullProduct.sareeLength || "",
        stockQuantity: fullProduct.stockQuantity?.toString() || "",
        inStock: fullProduct.inStock !== false,
        isNew: fullProduct.isNew || false,
        isTrending: fullProduct.isTrending || false,
        isBestseller: fullProduct.isBestseller || false,
        onSale: fullProduct.onSale || false,
        fabricComposition: fullProduct.specifications?.fabricComposition || "",
        dimensions: fullProduct.specifications?.dimensions || "",
        weight: fullProduct.specifications?.weight || "",
        careInstructions: fullProduct.specifications?.careInstructions || "",
        countryOfOrigin: fullProduct.specifications?.countryOfOrigin || ""
      });
    } catch (error: any) {
      toast({ 
        title: "Error loading product", 
        description: error.message,
        variant: "destructive" 
      });
      setIsEditDialogOpen(false);
    } finally {
      setIsLoadingProduct(false);
    }
  };
  
  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingProduct(null);
    setUploadedImages([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let colorVariants;
    if (editingProduct) {
      colorVariants = editingProduct.colorVariants || [{
        color: productForm.color || 'Default',
        images: uploadedImages.length > 0 ? uploadedImages : (editingProduct.images || [])
      }];

      if (uploadedImages.length > 0 && productForm.color && colorVariants.length > 0) {
        colorVariants[0] = {
          color: productForm.color,
          images: uploadedImages
        };
      }
    } else {
      colorVariants = [{
        color: productForm.color || 'Default',
        images: uploadedImages
      }];
    }
    
    const formattedData = {
      name: productForm.name,
      description: productForm.description,
      price: parseFloat(productForm.price),
      originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : undefined,
      category: productForm.category,
      subcategory: productForm.subcategory || undefined,
      fabric: productForm.fabric || undefined,
      color: productForm.color || undefined,
      colorVariants: colorVariants,
      occasion: productForm.occasion || undefined,
      pattern: productForm.pattern || undefined,
      workType: productForm.workType || undefined,
      blousePiece: productForm.blousePiece,
      sareeLength: productForm.sareeLength || undefined,
      stockQuantity: parseInt(productForm.stockQuantity) || 0,
      inStock: productForm.inStock,
      isNew: productForm.isNew,
      isTrending: productForm.isTrending,
      isBestseller: productForm.isBestseller,
      onSale: productForm.onSale,
      images: uploadedImages,
      specifications: {
        fabricComposition: productForm.fabricComposition || undefined,
        dimensions: productForm.dimensions || undefined,
        weight: productForm.weight || undefined,
        careInstructions: productForm.careInstructions || undefined,
        countryOfOrigin: productForm.countryOfOrigin || undefined,
      }
    };

    updateProductMutation.mutate({ id: editingProduct._id, data: formattedData });
  };

  const filteredInventory = useMemo(() => {
    if (!inventory) return [];

    let filtered = [...inventory];

    if (searchQuery) {
      filtered = filtered.filter((p: any) => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterCategory !== "all") {
      filtered = filtered.filter((p: any) => p.category === filterCategory);
    }

    if (filterStockStatus === "inStock") {
      filtered = filtered.filter((p: any) => p.inStock === true && (p.stockQuantity || 0) > 0);
    } else if (filterStockStatus === "lowStock") {
      filtered = filtered.filter((p: any) => (p.stockQuantity || 0) < 10 && (p.stockQuantity || 0) > 0 && p.inStock);
    } else if (filterStockStatus === "outOfStock") {
      filtered = filtered.filter((p: any) => !p.inStock || (p.stockQuantity || 0) === 0);
    }

    filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        case "stock":
          return (a.stockQuantity || 0) - (b.stockQuantity || 0);
        case "stockDesc":
          return (b.stockQuantity || 0) - (a.stockQuantity || 0);
        case "price":
          return (a.price || 0) - (b.price || 0);
        case "category":
          return (a.category || "").localeCompare(b.category || "");
        default:
          return 0;
      }
    });

    return filtered;
  }, [inventory, searchQuery, filterCategory, filterStockStatus, sortBy]);

  const categories = useMemo(() => {
    if (!inventory) return [];
    const cats = new Set(inventory.map((p: any) => p.category).filter(Boolean));
    return Array.from(cats);
  }, [inventory]);

  const totalProducts = inventory?.length || 0;
  const lowStockProducts = inventory?.filter((p: any) => (p.stockQuantity || 0) < 10 && (p.stockQuantity || 0) > 0 && p.inStock) || [];
  const outOfStockProducts = inventory?.filter((p: any) => !p.inStock || (p.stockQuantity || 0) === 0) || [];

  if (!adminToken) {
    setLocation("/login");
    return null;
  }

  return (
    <AdminLayout>
      <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold" data-testid="text-page-title">
          Inventory Management
        </h1>
        <p className="text-muted-foreground">
          Track and manage product stock levels
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground" data-testid="text-total-products-label">
              Total Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-products">
              {totalProducts}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground" data-testid="text-low-stock-label">
              Low Stock (&lt; 10)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600" data-testid="text-low-stock">
              {lowStockProducts.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground" data-testid="text-out-of-stock-label">
              Out of Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600" data-testid="text-out-of-stock">
              {outOfStockProducts.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle data-testid="text-search-filter-title">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="search" data-testid="label-search">Search Products</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  className="pl-9"
                  placeholder="Search by name or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="sort" data-testid="label-sort">Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sort" data-testid="select-sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stock" data-testid="option-sort-stock-asc">Stock (Low to High)</SelectItem>
                  <SelectItem value="stockDesc" data-testid="option-sort-stock-desc">Stock (High to Low)</SelectItem>
                  <SelectItem value="name" data-testid="option-sort-name">Name (A-Z)</SelectItem>
                  <SelectItem value="price" data-testid="option-sort-price">Price</SelectItem>
                  <SelectItem value="category" data-testid="option-sort-category">Category</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="filterCategory" data-testid="label-filter-category">Category</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger id="filterCategory" data-testid="select-filter-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" data-testid="option-category-all">All Categories</SelectItem>
                  {categories.map((cat: string) => (
                    <SelectItem key={cat} value={cat} data-testid={`option-category-${cat.toLowerCase().replace(/\s+/g, '-')}`}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex gap-4 flex-wrap">
            <Label data-testid="label-stock-filter">Stock Status:</Label>
            <div className="flex gap-4 flex-wrap">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="stockFilter"
                  value="all"
                  checked={filterStockStatus === "all"}
                  onChange={(e) => setFilterStockStatus(e.target.value)}
                  data-testid="radio-stock-all"
                />
                <span>All</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="stockFilter"
                  value="inStock"
                  checked={filterStockStatus === "inStock"}
                  onChange={(e) => setFilterStockStatus(e.target.value)}
                  data-testid="radio-stock-in-stock"
                />
                <span>In Stock</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="stockFilter"
                  value="lowStock"
                  checked={filterStockStatus === "lowStock"}
                  onChange={(e) => setFilterStockStatus(e.target.value)}
                  data-testid="radio-stock-low-stock"
                />
                <span>Low Stock (&lt; 10)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="stockFilter"
                  value="outOfStock"
                  checked={filterStockStatus === "outOfStock"}
                  onChange={(e) => setFilterStockStatus(e.target.value)}
                  data-testid="radio-stock-out-of-stock"
                />
                <span>Out of Stock</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle data-testid="text-inventory-title">
            Inventory ({filteredInventory.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8" data-testid="text-loading">Loading inventory...</div>
          ) : filteredInventory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground" data-testid="text-no-inventory">
              No inventory items found. {searchQuery || filterCategory !== "all" || filterStockStatus !== "all" ? "Try adjusting your filters." : ""}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead data-testid="header-product-name">Product Name</TableHead>
                    <TableHead data-testid="header-category">Category</TableHead>
                    <TableHead data-testid="header-price">Price</TableHead>
                    <TableHead data-testid="header-current-stock">Current Stock</TableHead>
                    <TableHead data-testid="header-status">Status</TableHead>
                    <TableHead data-testid="header-actions">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.map((product: any) => {
                    const stockQuantity = product.stockQuantity || 0;
                    const isLowStock = stockQuantity < 10 && stockQuantity > 0;
                    const isOutOfStock = !product.inStock || stockQuantity === 0;

                    return (
                      <TableRow key={product._id} data-testid={`row-inventory-${product._id}`}>
                        <TableCell className="font-medium" data-testid={`cell-name-${product._id}`}>
                          {product.name}
                        </TableCell>
                        <TableCell data-testid={`cell-category-${product._id}`}>
                          {product.category}
                        </TableCell>
                        <TableCell data-testid={`cell-price-${product._id}`}>
                          ₹{product.price}
                        </TableCell>
                        <TableCell data-testid={`cell-stock-${product._id}`}>
                          <span className={
                            isOutOfStock ? 'text-red-600 font-bold' : 
                            isLowStock ? 'text-orange-600 font-semibold' : 
                            'text-green-600'
                          }>
                            {stockQuantity}
                          </span>
                        </TableCell>
                        <TableCell data-testid={`cell-status-${product._id}`}>
                          <span className={`px-2 py-1 rounded-md text-xs ${
                            isOutOfStock ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
                            isLowStock ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' : 
                            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}>
                            {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                          </span>
                        </TableCell>
                        <TableCell data-testid={`cell-actions-${product._id}`}>
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(product)}
                              data-testid={`button-edit-${product._id}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeleteProductId(product._id)}
                              data-testid={`button-delete-${product._id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={(open) => !open && handleCloseEditDialog()}>
        <DialogContent className="max-w-3xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="text-edit-dialog-title">Edit Product</DialogTitle>
          </DialogHeader>
          {isLoadingProduct ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading product details...</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label data-testid="label-edit-product-images">Product Images (Max 5)</Label>
              <div className="flex gap-2 flex-wrap">
                {uploadedImages.map((url, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={url} 
                      alt={`Product ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-md"
                      data-testid={`img-edit-uploaded-${index}`}
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={() => removeImage(index)}
                      data-testid={`button-edit-remove-image-${index}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              {uploadedImages.length < 5 && (
                <Tabs defaultValue="device" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="device" data-testid="tab-edit-upload-device">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload from Device
                    </TabsTrigger>
                    <TabsTrigger value="url" data-testid="tab-edit-upload-url">
                      <LinkIcon className="mr-2 h-4 w-4" />
                      Upload via Link
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="device" className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                      data-testid="input-edit-file-upload-hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      data-testid="button-edit-upload-images"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {isUploading ? "Uploading..." : "Upload Images"}
                    </Button>
                  </TabsContent>
                  <TabsContent value="url" className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter image URL"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddImageUrl();
                          }
                        }}
                        data-testid="input-edit-image-url"
                      />
                      <Button
                        type="button"
                        onClick={handleAddImageUrl}
                        data-testid="button-edit-add-url"
                      >
                        Add
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" data-testid="label-edit-product-name">Product Name *</Label>
                <Input
                  id="edit-name"
                  value={productForm.name}
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  required
                  data-testid="input-edit-product-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-category" data-testid="label-edit-category">Category *</Label>
                <Select value={productForm.category} onValueChange={(value) => setProductForm({...productForm, category: value})}>
                  <SelectTrigger data-testid="select-edit-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Jamdani Paithani">Jamdani Paithani</SelectItem>
                    <SelectItem value="Khun Irkal">Khun / Irkal (Ilkal)</SelectItem>
                    <SelectItem value="Ajrakh Modal">Ajrakh Modal</SelectItem>
                    <SelectItem value="Mul Mul Cotton">Mul Mul Cotton</SelectItem>
                    <SelectItem value="Khadi Cotton">Khadi Cotton</SelectItem>
                    <SelectItem value="Patch Work">Patch Work</SelectItem>
                    <SelectItem value="Pure Linen">Pure Linen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description" data-testid="label-edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={productForm.description}
                onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                rows={3}
                data-testid="input-edit-description"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price" data-testid="label-edit-price">Price *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                  required
                  data-testid="input-edit-price"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-originalPrice" data-testid="label-edit-original-price">Original Price</Label>
                <Input
                  id="edit-originalPrice"
                  type="number"
                  step="0.01"
                  value={productForm.originalPrice}
                  onChange={(e) => setProductForm({...productForm, originalPrice: e.target.value})}
                  data-testid="input-edit-original-price"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-stockQuantity" data-testid="label-edit-stock-quantity">Stock Quantity</Label>
                <Input
                  id="edit-stockQuantity"
                  type="number"
                  value={productForm.stockQuantity}
                  onChange={(e) => setProductForm({...productForm, stockQuantity: e.target.value})}
                  data-testid="input-edit-stock-quantity"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-fabric">Fabric</Label>
                <Input
                  id="edit-fabric"
                  value={productForm.fabric}
                  onChange={(e) => setProductForm({...productForm, fabric: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-color">Color</Label>
                <Input
                  id="edit-color"
                  value={productForm.color}
                  onChange={(e) => setProductForm({...productForm, color: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-occasion">Occasion</Label>
                <Input
                  id="edit-occasion"
                  value={productForm.occasion}
                  onChange={(e) => setProductForm({...productForm, occasion: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-pattern">Pattern</Label>
                <Input
                  id="edit-pattern"
                  value={productForm.pattern}
                  onChange={(e) => setProductForm({...productForm, pattern: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-workType">Work Type</Label>
                <Input
                  id="edit-workType"
                  value={productForm.workType}
                  onChange={(e) => setProductForm({...productForm, workType: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-sareeLength">Saree Length</Label>
                <Input
                  id="edit-sareeLength"
                  value={productForm.sareeLength}
                  onChange={(e) => setProductForm({...productForm, sareeLength: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="edit-blousePiece"
                  checked={productForm.blousePiece}
                  onCheckedChange={(checked) => setProductForm({...productForm, blousePiece: checked as boolean})}
                />
                <Label htmlFor="edit-blousePiece">Blouse Piece</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="edit-inStock"
                  checked={productForm.inStock}
                  onCheckedChange={(checked) => setProductForm({...productForm, inStock: checked as boolean})}
                />
                <Label htmlFor="edit-inStock">In Stock</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="edit-isNew"
                  checked={productForm.isNew}
                  onCheckedChange={(checked) => setProductForm({...productForm, isNew: checked as boolean})}
                />
                <Label htmlFor="edit-isNew">New Arrival</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="edit-isTrending"
                  checked={productForm.isTrending}
                  onCheckedChange={(checked) => setProductForm({...productForm, isTrending: checked as boolean})}
                />
                <Label htmlFor="edit-isTrending">Trending</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="edit-isBestseller"
                  checked={productForm.isBestseller}
                  onCheckedChange={(checked) => setProductForm({...productForm, isBestseller: checked as boolean})}
                />
                <Label htmlFor="edit-isBestseller">Bestseller</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="edit-onSale"
                  checked={productForm.onSale}
                  onCheckedChange={(checked) => setProductForm({...productForm, onSale: checked as boolean})}
                  data-testid="checkbox-edit-on-sale"
                />
                <Label htmlFor="edit-onSale" data-testid="label-edit-on-sale">On Sale</Label>
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-sm">Product Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-fabricComposition">Fabric Composition</Label>
                  <Input
                    id="edit-fabricComposition"
                    value={productForm.fabricComposition}
                    onChange={(e) => setProductForm({...productForm, fabricComposition: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-dimensions">Dimensions</Label>
                  <Input
                    id="edit-dimensions"
                    value={productForm.dimensions}
                    onChange={(e) => setProductForm({...productForm, dimensions: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-weight">Weight</Label>
                  <Input
                    id="edit-weight"
                    value={productForm.weight}
                    onChange={(e) => setProductForm({...productForm, weight: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-countryOfOrigin">Country of Origin</Label>
                  <Input
                    id="edit-countryOfOrigin"
                    value={productForm.countryOfOrigin}
                    onChange={(e) => setProductForm({...productForm, countryOfOrigin: e.target.value})}
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="edit-careInstructions">Care Instructions</Label>
                  <Textarea
                    id="edit-careInstructions"
                    value={productForm.careInstructions}
                    onChange={(e) => setProductForm({...productForm, careInstructions: e.target.value})}
                    rows={2}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseEditDialog}
                data-testid="button-edit-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateProductMutation.isPending}
                data-testid="button-edit-submit"
              >
                {updateProductMutation.isPending ? "Updating..." : "Update Product"}
              </Button>
            </div>
          </form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this product. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-delete-cancel">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProductId && deleteProductMutation.mutate(deleteProductId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-delete-confirm"
            >
              {deleteProductMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </AdminLayout>
  );
}
