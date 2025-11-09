import { useState, useMemo, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
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
  Plus,
  Pencil,
  Trash2,
  Upload,
  Download,
  FileUp,
  Search,
  X
} from "lucide-react";

export default function ProductManagement() {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const adminToken = localStorage.getItem("adminToken");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelImportRef = useRef<HTMLInputElement>(null);

  // Search, sort, and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStock, setFilterStock] = useState("all");

  // Image upload states
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

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
    fabricComposition: "",
    dimensions: "",
    weight: "",
    careInstructions: "",
    countryOfOrigin: ""
  });

  const { data, isLoading } = useQuery<{products: any[], pagination: any}>({
    queryKey: ["/api/products"],
    enabled: !!adminToken
  });
  
  const products = data?.products || [];

  // Handle image file upload
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

  // Excel import mutation
  const importExcelMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/admin/products/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Import failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ 
        title: "Import successful!", 
        description: data.message 
      });
      if (excelImportRef.current) {
        excelImportRef.current.value = '';
      }
    },
    onError: (error: any) => {
      toast({ 
        title: "Import failed", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importExcelMutation.mutate(file);
    }
  };

  const handleExcelExport = async () => {
    try {
      const response = await fetch('/api/admin/products/export', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products_export_${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({ title: "Products exported successfully!" });
    } catch (error: any) {
      toast({ 
        title: "Export failed", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const addProductMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/admin/products", "POST", data),
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
    mutationFn: ({ id, data }: any) => apiRequest(`/api/admin/products/${id}`, "PATCH", data),
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
    mutationFn: (id: string) => apiRequest(`/api/admin/products/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product deleted successfully!" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

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
      fabricComposition: "",
      dimensions: "",
      weight: "",
      careInstructions: "",
      countryOfOrigin: ""
    });
    setUploadedImages([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formattedData = {
      name: productForm.name,
      description: productForm.description,
      price: parseFloat(productForm.price),
      originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : undefined,
      category: productForm.category,
      subcategory: productForm.subcategory || undefined,
      fabric: productForm.fabric || undefined,
      color: productForm.color || undefined,
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
      images: uploadedImages,
      specifications: {
        fabricComposition: productForm.fabricComposition || undefined,
        dimensions: productForm.dimensions || undefined,
        weight: productForm.weight || undefined,
        careInstructions: productForm.careInstructions || undefined,
        countryOfOrigin: productForm.countryOfOrigin || undefined,
      }
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct._id, data: formattedData });
    } else {
      addProductMutation.mutate(formattedData);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    const images = product.images || [];
    setUploadedImages(images);
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
      fabricComposition: product.specifications?.fabricComposition || "",
      dimensions: product.specifications?.dimensions || "",
      weight: product.specifications?.weight || "",
      careInstructions: product.specifications?.careInstructions || "",
      countryOfOrigin: product.specifications?.countryOfOrigin || ""
    });
  };

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let filtered = [...products];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (filterCategory !== "all") {
      filtered = filtered.filter(p => p.category === filterCategory);
    }

    // Apply stock filter
    if (filterStock === "inStock") {
      filtered = filtered.filter(p => p.inStock === true);
    } else if (filterStock === "outOfStock") {
      filtered = filtered.filter(p => p.inStock === false);
    } else if (filterStock === "lowStock") {
      filtered = filtered.filter(p => (p.stockQuantity || 0) < 10 && p.inStock);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        case "priceAsc":
          return (a.price || 0) - (b.price || 0);
        case "priceDesc":
          return (b.price || 0) - (a.price || 0);
        case "stock":
          return (a.stockQuantity || 0) - (b.stockQuantity || 0);
        case "newest":
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchQuery, filterCategory, filterStock, sortBy]);

  // Get unique categories
  const categories = useMemo(() => {
    if (!products) return [];
    const cats = new Set(products.map((p: any) => p.category).filter(Boolean));
    return Array.from(cats);
  }, [products]);

  if (!adminToken) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Product Management</h1>
        <div className="flex gap-2 flex-wrap">
          <input
            ref={excelImportRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleExcelImport}
            data-testid="input-excel-import-hidden"
          />
          <Button
            variant="outline"
            onClick={() => excelImportRef.current?.click()}
            disabled={importExcelMutation.isPending}
            data-testid="button-import-excel"
          >
            <FileUp className="mr-2 h-4 w-4" />
            {importExcelMutation.isPending ? "Importing..." : "Import Excel"}
          </Button>
          <Button
            variant="outline"
            onClick={handleExcelExport}
            data-testid="button-export-excel"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-product">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-screen overflow-y-auto">
              <DialogHeader>
                <DialogTitle data-testid="text-dialog-title">Add New Product</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Product Images Upload */}
                <div className="space-y-2">
                  <Label data-testid="label-product-images">Product Images (Max 5)</Label>
                  <div className="flex gap-2 flex-wrap">
                    {uploadedImages.map((url, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={url} 
                          alt={`Product ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-md"
                          data-testid={`img-uploaded-${index}`}
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={() => removeImage(index)}
                          data-testid={`button-remove-image-${index}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  {uploadedImages.length < 5 && (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                        data-testid="input-file-upload-hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        data-testid="button-upload-images"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {isUploading ? "Uploading..." : "Upload Images"}
                      </Button>
                    </>
                  )}
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" data-testid="label-product-name">Product Name *</Label>
                    <Input
                      id="name"
                      value={productForm.name}
                      onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                      required
                      data-testid="input-product-name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" data-testid="label-category">Category *</Label>
                    <Select value={productForm.category} onValueChange={(value) => setProductForm({...productForm, category: value})}>
                      <SelectTrigger data-testid="select-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Silk Sarees" data-testid="option-silk-sarees">Silk Sarees</SelectItem>
                        <SelectItem value="Cotton Sarees" data-testid="option-cotton-sarees">Cotton Sarees</SelectItem>
                        <SelectItem value="Designer Sarees" data-testid="option-designer-sarees">Designer Sarees</SelectItem>
                        <SelectItem value="Banarasi Sarees" data-testid="option-banarasi-sarees">Banarasi Sarees</SelectItem>
                        <SelectItem value="Kanjivaram Sarees" data-testid="option-kanjivaram-sarees">Kanjivaram Sarees</SelectItem>
                        <SelectItem value="Georgette Sarees" data-testid="option-georgette-sarees">Georgette Sarees</SelectItem>
                        <SelectItem value="Chiffon Sarees" data-testid="option-chiffon-sarees">Chiffon Sarees</SelectItem>
                        <SelectItem value="Printed Sarees" data-testid="option-printed-sarees">Printed Sarees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" data-testid="label-description">Description</Label>
                  <Textarea
                    id="description"
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                    rows={3}
                    data-testid="input-description"
                  />
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price" data-testid="label-price">Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                      required
                      data-testid="input-price"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="originalPrice" data-testid="label-original-price">Original Price</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      step="0.01"
                      value={productForm.originalPrice}
                      onChange={(e) => setProductForm({...productForm, originalPrice: e.target.value})}
                      data-testid="input-original-price"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stockQuantity" data-testid="label-stock-quantity">Stock Quantity</Label>
                    <Input
                      id="stockQuantity"
                      type="number"
                      value={productForm.stockQuantity}
                      onChange={(e) => setProductForm({...productForm, stockQuantity: e.target.value})}
                      data-testid="input-stock-quantity"
                    />
                  </div>
                </div>

                {/* Attributes */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fabric" data-testid="label-fabric">Fabric</Label>
                    <Input
                      id="fabric"
                      value={productForm.fabric}
                      onChange={(e) => setProductForm({...productForm, fabric: e.target.value})}
                      data-testid="input-fabric"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color" data-testid="label-color">Color</Label>
                    <Input
                      id="color"
                      value={productForm.color}
                      onChange={(e) => setProductForm({...productForm, color: e.target.value})}
                      data-testid="input-color"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="occasion" data-testid="label-occasion">Occasion</Label>
                    <Input
                      id="occasion"
                      value={productForm.occasion}
                      onChange={(e) => setProductForm({...productForm, occasion: e.target.value})}
                      data-testid="input-occasion"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pattern" data-testid="label-pattern">Pattern</Label>
                    <Input
                      id="pattern"
                      value={productForm.pattern}
                      onChange={(e) => setProductForm({...productForm, pattern: e.target.value})}
                      data-testid="input-pattern"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workType" data-testid="label-work-type">Work Type</Label>
                    <Input
                      id="workType"
                      value={productForm.workType}
                      onChange={(e) => setProductForm({...productForm, workType: e.target.value})}
                      data-testid="input-work-type"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sareeLength" data-testid="label-saree-length">Saree Length</Label>
                    <Input
                      id="sareeLength"
                      value={productForm.sareeLength}
                      onChange={(e) => setProductForm({...productForm, sareeLength: e.target.value})}
                      data-testid="input-saree-length"
                    />
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="flex gap-6 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="blousePiece"
                      checked={productForm.blousePiece}
                      onCheckedChange={(checked) => setProductForm({...productForm, blousePiece: checked as boolean})}
                      data-testid="checkbox-blouse-piece"
                    />
                    <Label htmlFor="blousePiece" data-testid="label-blouse-piece">Blouse Piece</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="inStock"
                      checked={productForm.inStock}
                      onCheckedChange={(checked) => setProductForm({...productForm, inStock: checked as boolean})}
                      data-testid="checkbox-in-stock"
                    />
                    <Label htmlFor="inStock" data-testid="label-in-stock">In Stock</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="isNew"
                      checked={productForm.isNew}
                      onCheckedChange={(checked) => setProductForm({...productForm, isNew: checked as boolean})}
                      data-testid="checkbox-is-new"
                    />
                    <Label htmlFor="isNew" data-testid="label-is-new">New Arrival</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="isTrending"
                      checked={productForm.isTrending}
                      onCheckedChange={(checked) => setProductForm({...productForm, isTrending: checked as boolean})}
                      data-testid="checkbox-is-trending"
                    />
                    <Label htmlFor="isTrending" data-testid="label-is-trending">Trending</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="isBestseller"
                      checked={productForm.isBestseller}
                      onCheckedChange={(checked) => setProductForm({...productForm, isBestseller: checked as boolean})}
                      data-testid="checkbox-is-bestseller"
                    />
                    <Label htmlFor="isBestseller" data-testid="label-is-bestseller">Bestseller</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} data-testid="button-cancel">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addProductMutation.isPending} data-testid="button-submit">
                    {addProductMutation.isPending ? "Adding..." : "Add Product"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search, Sort, and Filter Controls */}
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
                  <SelectItem value="name" data-testid="option-sort-name">Name (A-Z)</SelectItem>
                  <SelectItem value="priceAsc" data-testid="option-sort-price-asc">Price (Low to High)</SelectItem>
                  <SelectItem value="priceDesc" data-testid="option-sort-price-desc">Price (High to Low)</SelectItem>
                  <SelectItem value="stock" data-testid="option-sort-stock">Stock (Low to High)</SelectItem>
                  <SelectItem value="newest" data-testid="option-sort-newest">Newest First</SelectItem>
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
                  {categories.map(cat => (
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
                  checked={filterStock === "all"}
                  onChange={(e) => setFilterStock(e.target.value)}
                  data-testid="radio-stock-all"
                />
                <span>All</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="stockFilter"
                  value="inStock"
                  checked={filterStock === "inStock"}
                  onChange={(e) => setFilterStock(e.target.value)}
                  data-testid="radio-stock-in-stock"
                />
                <span>In Stock</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="stockFilter"
                  value="lowStock"
                  checked={filterStock === "lowStock"}
                  onChange={(e) => setFilterStock(e.target.value)}
                  data-testid="radio-stock-low-stock"
                />
                <span>Low Stock (&lt; 10)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="stockFilter"
                  value="outOfStock"
                  checked={filterStock === "outOfStock"}
                  onChange={(e) => setFilterStock(e.target.value)}
                  data-testid="radio-stock-out-of-stock"
                />
                <span>Out of Stock</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle data-testid="text-products-title">
            Products ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8" data-testid="text-loading">Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground" data-testid="text-no-products">
              No products found. {searchQuery || filterCategory !== "all" || filterStock !== "all" ? "Try adjusting your filters." : "Add your first product to get started."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead data-testid="header-image">Image</TableHead>
                    <TableHead data-testid="header-name">Name</TableHead>
                    <TableHead data-testid="header-category">Category</TableHead>
                    <TableHead data-testid="header-price">Price</TableHead>
                    <TableHead data-testid="header-stock">Stock</TableHead>
                    <TableHead data-testid="header-status">Status</TableHead>
                    <TableHead data-testid="header-actions">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product: any) => (
                    <TableRow key={product._id} data-testid={`row-product-${product._id}`}>
                      <TableCell data-testid={`cell-image-${product._id}`}>
                        {product.images && product.images[0] && (
                          <img src={product.images[0]} alt={product.name} className="w-12 h-12 object-cover rounded-md" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium" data-testid={`cell-name-${product._id}`}>{product.name}</TableCell>
                      <TableCell data-testid={`cell-category-${product._id}`}>{product.category}</TableCell>
                      <TableCell data-testid={`cell-price-${product._id}`}>₹{product.price}</TableCell>
                      <TableCell data-testid={`cell-stock-${product._id}`}>
                        <span className={product.stockQuantity < 10 ? 'text-orange-600' : ''}>
                          {product.stockQuantity || 0}
                        </span>
                      </TableCell>
                      <TableCell data-testid={`cell-status-${product._id}`}>
                        <span className={`px-2 py-1 rounded-md text-xs ${product.inStock ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </TableCell>
                      <TableCell data-testid={`cell-actions-${product._id}`}>
                        <div className="flex gap-2 flex-wrap">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(product)}
                                data-testid={`button-edit-${product._id}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-screen overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle data-testid="text-edit-dialog-title">Edit Product</DialogTitle>
                              </DialogHeader>
                              <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Same form as Add Product */}
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
                                    <>
                                      <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={handleImageUpload}
                                        data-testid="input-edit-file-upload-hidden"
                                      />
                                      <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        data-testid="button-edit-upload-images"
                                      >
                                        <Upload className="mr-2 h-4 w-4" />
                                        {isUploading ? "Uploading..." : "Upload Images"}
                                      </Button>
                                    </>
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
                                        <SelectItem value="Silk Sarees">Silk Sarees</SelectItem>
                                        <SelectItem value="Cotton Sarees">Cotton Sarees</SelectItem>
                                        <SelectItem value="Designer Sarees">Designer Sarees</SelectItem>
                                        <SelectItem value="Banarasi Sarees">Banarasi Sarees</SelectItem>
                                        <SelectItem value="Kanjivaram Sarees">Kanjivaram Sarees</SelectItem>
                                        <SelectItem value="Georgette Sarees">Georgette Sarees</SelectItem>
                                        <SelectItem value="Chiffon Sarees">Chiffon Sarees</SelectItem>
                                        <SelectItem value="Printed Sarees">Printed Sarees</SelectItem>
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
                                    <Label htmlFor="edit-fabric" data-testid="label-edit-fabric">Fabric</Label>
                                    <Input
                                      id="edit-fabric"
                                      value={productForm.fabric}
                                      onChange={(e) => setProductForm({...productForm, fabric: e.target.value})}
                                      data-testid="input-edit-fabric"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="edit-color" data-testid="label-edit-color">Color</Label>
                                    <Input
                                      id="edit-color"
                                      value={productForm.color}
                                      onChange={(e) => setProductForm({...productForm, color: e.target.value})}
                                      data-testid="input-edit-color"
                                    />
                                  </div>
                                </div>

                                <div className="flex gap-6 flex-wrap">
                                  <div className="flex items-center gap-2">
                                    <Checkbox
                                      id="edit-blousePiece"
                                      checked={productForm.blousePiece}
                                      onCheckedChange={(checked) => setProductForm({...productForm, blousePiece: checked as boolean})}
                                      data-testid="checkbox-edit-blouse-piece"
                                    />
                                    <Label htmlFor="edit-blousePiece" data-testid="label-edit-blouse-piece">Blouse Piece</Label>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Checkbox
                                      id="edit-inStock"
                                      checked={productForm.inStock}
                                      onCheckedChange={(checked) => setProductForm({...productForm, inStock: checked as boolean})}
                                      data-testid="checkbox-edit-in-stock"
                                    />
                                    <Label htmlFor="edit-inStock" data-testid="label-edit-in-stock">In Stock</Label>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Checkbox
                                      id="edit-isNew"
                                      checked={productForm.isNew}
                                      onCheckedChange={(checked) => setProductForm({...productForm, isNew: checked as boolean})}
                                      data-testid="checkbox-edit-is-new"
                                    />
                                    <Label htmlFor="edit-isNew" data-testid="label-edit-is-new">New Arrival</Label>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Checkbox
                                      id="edit-isTrending"
                                      checked={productForm.isTrending}
                                      onCheckedChange={(checked) => setProductForm({...productForm, isTrending: checked as boolean})}
                                      data-testid="checkbox-edit-is-trending"
                                    />
                                    <Label htmlFor="edit-isTrending" data-testid="label-edit-is-trending">Trending</Label>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Checkbox
                                      id="edit-isBestseller"
                                      checked={productForm.isBestseller}
                                      onCheckedChange={(checked) => setProductForm({...productForm, isBestseller: checked as boolean})}
                                      data-testid="checkbox-edit-is-bestseller"
                                    />
                                    <Label htmlFor="edit-isBestseller" data-testid="label-edit-is-bestseller">Bestseller</Label>
                                  </div>
                                </div>

                                <div className="flex justify-end gap-2">
                                  <Button type="button" variant="outline" onClick={() => setEditingProduct(null)} data-testid="button-edit-cancel">
                                    Cancel
                                  </Button>
                                  <Button type="submit" disabled={updateProductMutation.isPending} data-testid="button-edit-submit">
                                    {updateProductMutation.isPending ? "Updating..." : "Update Product"}
                                  </Button>
                                </div>
                              </form>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this product?")) {
                                deleteProductMutation.mutate(product._id);
                              }
                            }}
                            data-testid={`button-delete-${product._id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
