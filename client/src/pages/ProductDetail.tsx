import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, Heart, ShoppingCart, Truck, Shield, RotateCcw, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { localStorageService } from "@/lib/localStorage";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading } = useQuery({
    queryKey: ["/api/products", id],
    queryFn: async () => {
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) throw new Error("Failed to fetch product");
      return response.json();
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/cart", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({ title: "Added to cart successfully!" });
    },
    onError: () => {
      const token = localStorage.getItem("token");
      if (!token) {
        localStorageService.addToCart(product._id, quantity);
        queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
        toast({ title: "Added to cart successfully!" });
      } else {
        toast({ title: "Failed to add to cart", variant: "destructive" });
      }
    },
  });

  const addToWishlistMutation = useMutation({
    mutationFn: (productId: string) => apiRequest(`/api/wishlist/${productId}`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({ title: "Added to wishlist!" });
    },
    onError: () => {
      const token = localStorage.getItem("token");
      if (!token) {
        localStorageService.addToWishlist(product._id);
        queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
        toast({ title: "Added to wishlist!" });
      } else {
        toast({ title: "Failed to add to wishlist", variant: "destructive" });
      }
    },
  });

  const buyNowMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/cart", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      setLocation("/checkout");
    },
    onError: () => {
      toast({ title: "Failed to proceed with Buy Now", variant: "destructive" });
    },
  });

  const handleBuyNow = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast({ title: "Please login to proceed with Buy Now", variant: "destructive" });
      setLocation("/login");
      return;
    }
    buyNowMutation.mutate({ productId: product._id, quantity });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          Loading product details...
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          Product not found
        </div>
        <Footer />
      </div>
    );
  }

  const images = product.images && product.images.length > 0 
    ? product.images 
    : ["/api/placeholder/600/800"];

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <nav className="text-sm text-muted-foreground mb-6" data-testid="breadcrumb">
          <a href="/" className="hover:text-foreground">Home</a>
          <span className="mx-2">/</span>
          <a href="/products" className="hover:text-foreground">Products</a>
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div>
            <div className="mb-4 bg-card rounded-md overflow-hidden">
              <img 
                src={images[selectedImage]} 
                alt={product.name}
                className="w-full h-auto aspect-[3/4] object-cover"
                data-testid="img-product-main"
              />
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {images.slice(0, 4).map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`border-2 rounded-md overflow-hidden hover-elevate ${
                    selectedImage === idx ? 'border-primary' : 'border-border'
                  }`}
                  data-testid={`button-thumbnail-${idx}`}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full aspect-square object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex gap-2 mb-2">
              {product.isNew && <Badge variant="secondary" data-testid="badge-new">New</Badge>}
              {product.isBestseller && <Badge variant="secondary" data-testid="badge-bestseller">Bestseller</Badge>}
            </div>

            <h1 className="text-3xl font-bold mb-4" data-testid="text-product-name">{product.name}</h1>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating || 0)
                        ? 'fill-primary text-primary'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground" data-testid="text-rating">
                {product.rating?.toFixed(1)} ({product.reviewCount} reviews)
              </span>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-4xl font-bold text-primary" data-testid="text-price">
                ₹{product.price}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-muted-foreground line-through" data-testid="text-original-price">
                    ₹{product.originalPrice}
                  </span>
                  <span className="text-lg text-primary font-semibold" data-testid="text-discount">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            <p className="text-muted-foreground mb-6" data-testid="text-description">
              {product.description}
            </p>

            <Separator className="my-6" />

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              {product.category && (
                <div>
                  <span className="text-muted-foreground">Category:</span>
                  <span className="ml-2 font-medium">{product.category}</span>
                </div>
              )}
              {product.fabric && (
                <div>
                  <span className="text-muted-foreground">Fabric:</span>
                  <span className="ml-2 font-medium">{product.fabric}</span>
                </div>
              )}
              {product.color && (
                <div>
                  <span className="text-muted-foreground">Color:</span>
                  <span className="ml-2 font-medium">{product.color}</span>
                </div>
              )}
              {product.occasion && (
                <div>
                  <span className="text-muted-foreground">Occasion:</span>
                  <span className="ml-2 font-medium">{product.occasion}</span>
                </div>
              )}
              {product.sareeLength && (
                <div>
                  <span className="text-muted-foreground">Length:</span>
                  <span className="ml-2 font-medium">{product.sareeLength}</span>
                </div>
              )}
              {product.blousePiece !== undefined && (
                <div>
                  <span className="text-muted-foreground">Blouse Piece:</span>
                  <span className="ml-2 font-medium">{product.blousePiece ? 'Yes' : 'No'}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  data-testid="button-quantity-decrease"
                >
                  -
                </Button>
                <span className="px-4 font-medium" data-testid="text-quantity">{quantity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(q => q + 1)}
                  data-testid="button-quantity-increase"
                >
                  +
                </Button>
              </div>

              {product.inStock ? (
                <Badge variant="secondary" className="text-green-600" data-testid="badge-stock">
                  In Stock
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-red-600" data-testid="badge-out-of-stock">
                  Out of Stock
                </Badge>
              )}
            </div>

            <div className="flex gap-3 mb-8">
              <Button
                disabled={!product.inStock || addToCartMutation.isPending}
                onClick={() => addToCartMutation.mutate({ productId: product._id, quantity })}
                data-testid="button-add-to-cart"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
              <Button
                variant="default"
                disabled={!product.inStock || buyNowMutation.isPending}
                onClick={handleBuyNow}
                data-testid="button-buy-now"
              >
                <Zap className="h-4 w-4 mr-2" />
                Buy Now
              </Button>
              <Button
                variant="outline"
                onClick={() => addToWishlistMutation.mutate(product._id)}
                disabled={addToWishlistMutation.isPending}
                data-testid="button-add-to-wishlist"
              >
                <Heart className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <Truck className="h-6 w-6 text-primary mb-2" />
                  <span className="text-sm font-medium">Free Delivery</span>
                  <span className="text-xs text-muted-foreground">On orders above ₹999</span>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <RotateCcw className="h-6 w-6 text-primary mb-2" />
                  <span className="text-sm font-medium">Easy Returns</span>
                  <span className="text-xs text-muted-foreground">7 days return policy</span>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <Shield className="h-6 w-6 text-primary mb-2" />
                  <span className="text-sm font-medium">Secure Payment</span>
                  <span className="text-xs text-muted-foreground">100% secure</span>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {product.specifications && (
          <Card className="mb-8">
            <CardHeader>
              <h2 className="text-2xl font-bold">Specifications</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.specifications.fabricComposition && (
                  <div>
                    <span className="font-medium">Fabric Composition:</span>
                    <span className="ml-2 text-muted-foreground">{product.specifications.fabricComposition}</span>
                  </div>
                )}
                {product.specifications.dimensions && (
                  <div>
                    <span className="font-medium">Dimensions:</span>
                    <span className="ml-2 text-muted-foreground">{product.specifications.dimensions}</span>
                  </div>
                )}
                {product.specifications.weight && (
                  <div>
                    <span className="font-medium">Weight:</span>
                    <span className="ml-2 text-muted-foreground">{product.specifications.weight}</span>
                  </div>
                )}
                {product.specifications.careInstructions && (
                  <div>
                    <span className="font-medium">Care Instructions:</span>
                    <span className="ml-2 text-muted-foreground">{product.specifications.careInstructions}</span>
                  </div>
                )}
                {product.specifications.countryOfOrigin && (
                  <div>
                    <span className="font-medium">Country of Origin:</span>
                    <span className="ml-2 text-muted-foreground">{product.specifications.countryOfOrigin}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
}
