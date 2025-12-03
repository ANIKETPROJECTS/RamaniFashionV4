import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ShoppingCart, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { localStorageService } from "@/lib/localStorage";
import { useState, useEffect } from "react";

export default function Wishlist() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const token = localStorage.getItem("token");
  const [guestWishlist, setGuestWishlist] = useState<any>(null);

  const { data: wishlist, isLoading, isError, error } = useQuery({
    queryKey: ["/api/wishlist"],
    enabled: !!token,
  });

  useEffect(() => {
    if (!token) {
      const localWishlist = localStorageService.getWishlist();
      const fetchProducts = async () => {
        const productPromises = localWishlist.products.map(async (productId) => {
          const response = await fetch(`/api/products/${productId}`);
          return response.json();
        });
        const products = await Promise.all(productPromises);
        setGuestWishlist({ products });
      };
      if (localWishlist.products.length > 0) {
        fetchProducts();
      } else {
        setGuestWishlist({ products: [] });
      }
    }
  }, [token]);

  const isUnauthorized = isError && error && String(error).includes("401:");

  const removeFromWishlistMutation = useMutation({
    mutationFn: (productId: string) => {
      if (!token) {
        localStorageService.removeFromWishlist(productId);
        return Promise.resolve();
      }
      return apiRequest(`/api/wishlist/${productId}`, "DELETE");
    },
    onSuccess: () => {
      if (token) {
        queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      } else {
        const localWishlist = localStorageService.getWishlist();
        const fetchProducts = async () => {
          const productPromises = localWishlist.products.map(async (productId) => {
            const response = await fetch(`/api/products/${productId}`);
            return response.json();
          });
          const products = await Promise.all(productPromises);
          setGuestWishlist({ products });
        };
        fetchProducts();
      }
      toast({ title: "Removed from wishlist" });
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: (productId: string) => {
      if (!token) {
        localStorageService.addToCart(productId, 1);
        return Promise.resolve();
      }
      return apiRequest("/api/cart", "POST", { productId, quantity: 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({ title: "Added to cart successfully" });
    },
  });

  const handleAddToCart = (productId: string) => {
    addToCartMutation.mutate(productId);
  };

  if (token && isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          Loading wishlist...
        </div>
        <Footer />
      </div>
    );
  }

  if (!token && !guestWishlist) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          Loading wishlist...
        </div>
        <Footer />
      </div>
    );
  }

  const products = token ? ((wishlist as any)?.products || []) : (guestWishlist?.products || []);

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center py-12">
            <Heart className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">Save items you love to buy them later</p>
            <Button onClick={() => setLocation("/products")} data-testid="button-shop-now">
              Shop Now
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8" data-testid="text-page-title">
          My Wishlist ({products.length} items)
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <Card key={product._id} className="overflow-hidden hover-elevate" data-testid={`wishlist-item-${product._id}`}>
              <div className="relative">
                <img
                  src={product.displayImages?.[0] || product.images?.[0] || "/default-saree.jpg"}
                  alt={product.name}
                  className="w-full h-80 object-cover cursor-pointer"
                  onClick={() => setLocation(`/product/${product._id}`)}
                  data-testid={`img-product-${product._id}`}
                  onError={(e) => { e.currentTarget.src = '/default-saree.jpg'; }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                  onClick={() => removeFromWishlistMutation.mutate(product._id)}
                  data-testid={`button-remove-${product._id}`}
                >
                  <X className="h-5 w-5" />
                </Button>
                {!product.inStock && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 text-sm font-semibold rounded">
                    Out of Stock
                  </div>
                )}
                {product.isNew && product.inStock && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 text-sm font-semibold rounded">
                    New
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 
                  className="font-semibold mb-2 line-clamp-2 cursor-pointer hover:text-primary"
                  onClick={() => setLocation(`/product/${product._id}`)}
                  data-testid={`text-product-name-${product._id}`}
                >
                  {product.name}
                </h3>
                
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg font-bold text-primary" data-testid={`text-price-${product._id}`}>
                    ₹{product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="text-sm text-muted-foreground mb-3">
                  {product.fabric && <span>{product.fabric}</span>}
                  {product.color && <span> • {product.color}</span>}
                </div>

                <Button
                  className="w-full"
                  onClick={() => handleAddToCart(product._id)}
                  disabled={!product.inStock || addToCartMutation.isPending}
                  data-testid={`button-add-to-cart-${product._id}`}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {product.inStock ? "Add to Cart" : "Out of Stock"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
