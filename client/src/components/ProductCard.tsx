import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { localStorageService } from "@/lib/localStorage";
import { useAuthUI } from "@/contexts/AuthUIContext";

const prefetchProduct = async (productId: string) => {
  await queryClient.prefetchQuery({
    queryKey: ["/api/products", productId],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) throw new Error("Failed to fetch product");
      return response.json();
    },
  });
};

interface ProductCardProps {
  id: string;
  name: string;
  image: string;
  secondaryImage?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating?: number;
  reviewCount?: number;
  isNew?: boolean;
  isBestseller?: boolean;
  context?: 'new-arrivals' | 'trending' | 'sale' | 'products';
  onAddToCart?: () => void;
  onAddToWishlist?: () => void;
  onBuyNow?: () => void;
  onClick?: () => void;
}

export default function ProductCard({
  id,
  name,
  image,
  secondaryImage,
  price,
  originalPrice,
  discount,
  rating = 0,
  reviewCount = 0,
  isNew,
  isBestseller,
  context,
  onAddToCart,
  onAddToWishlist,
  onBuyNow,
  onClick,
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentImage, setCurrentImage] = useState(image);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { openLogin } = useAuthUI();

  const addToCartMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/cart", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({ title: "Added to cart successfully!" });
    },
    onError: () => {
      const token = localStorage.getItem("token");
      if (!token) {
        localStorageService.addToCart(id, 1);
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
        localStorageService.addToWishlist(id);
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

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    if (onAddToWishlist) {
      onAddToWishlist();
    } else {
      addToWishlistMutation.mutate(id);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart();
    } else {
      addToCartMutation.mutate({ productId: id, quantity: 1 });
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBuyNow) {
      onBuyNow();
    } else {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({ title: "Please login to proceed with Buy Now", variant: "destructive" });
        openLogin();
        return;
      }
      buyNowMutation.mutate({ productId: id, quantity: 1 });
    }
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover-elevate active-elevate-2 group"
      onClick={() => onClick ? onClick() : setLocation(`/product/${id}`)}
      onMouseEnter={() => prefetchProduct(id)}
      data-testid={`card-product-${id}`}
    >
      <div className="relative aspect-[3/5] overflow-hidden">
        <img
          src={currentImage}
          alt={name}
          className="w-full h-full object-cover"
          onMouseEnter={() => secondaryImage && setCurrentImage(secondaryImage)}
          onMouseLeave={() => setCurrentImage(image)}
        />
        
        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-2 right-2 bg-white/80 hover:bg-white ${isWishlisted ? 'text-destructive' : ''}`}
          onClick={handleWishlist}
          data-testid={`button-wishlist-${id}`}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </Button>

        {isBestseller && (
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            <Badge className="bg-accent text-accent-foreground" data-testid={`badge-bestseller-${id}`}>
              Bestseller
            </Badge>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
          <Button 
            className="w-full bg-primary hover:bg-primary text-primary-foreground"
            onClick={handleAddToCart}
            data-testid={`button-add-to-cart-${id}`}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
          <Button 
            className="w-full"
            variant="secondary"
            onClick={handleBuyNow}
            data-testid={`button-buy-now-${id}`}
          >
            Buy Now
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        {rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground" data-testid={`text-review-count-${id}`}>
              ({reviewCount})
            </span>
          </div>
        )}

        <h3 className="font-medium text-sm mb-2 line-clamp-2" data-testid={`text-product-name-${id}`}>
          {name}
        </h3>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-lg font-bold text-black" data-testid={`text-price-${id}`}>
            ₹{price.toLocaleString()}
          </span>
          {originalPrice && (
            <>
              <span className="text-sm text-black line-through" data-testid={`text-original-price-${id}`}>
                ₹{originalPrice.toLocaleString()}
              </span>
              {discount !== undefined && discount > 0 && (
                <span className="text-xs text-black font-medium" data-testid={`text-discount-${id}`}>
                  {discount}% off
                </span>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
