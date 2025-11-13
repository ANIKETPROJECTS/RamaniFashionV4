import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { localStorageService } from "@/lib/localStorage";
import { useState, useEffect } from "react";
import { useAuthUI } from "@/contexts/AuthUIContext";

export default function Cart() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { openLogin } = useAuthUI();
  const token = localStorage.getItem("token");
  const [guestCart, setGuestCart] = useState<any>(null);

  const { data: cart, isLoading } = useQuery({
    queryKey: ["/api/cart"],
    enabled: !!token,
  });

  useEffect(() => {
    if (!token) {
      const localCart = localStorageService.getCart();
      const fetchProducts = async () => {
        const productPromises = localCart.items.map(async (item) => {
          const response = await fetch(`/api/products/${item.productId}`);
          const product = await response.json();
          return { productId: product, quantity: item.quantity };
        });
        const items = await Promise.all(productPromises);
        setGuestCart({ items });
      };
      if (localCart.items.length > 0) {
        fetchProducts();
      } else {
        setGuestCart({ items: [] });
      }
    }
  }, [token]);

  const updateQuantityMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) => {
      if (!token) {
        localStorageService.updateCartQuantity(productId, quantity);
        return Promise.resolve();
      }
      return apiRequest(`/api/cart/${productId}`, "PUT", { quantity });
    },
    onSuccess: () => {
      if (token) {
        queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      } else {
        const localCart = localStorageService.getCart();
        const fetchProducts = async () => {
          const productPromises = localCart.items.map(async (item) => {
            const response = await fetch(`/api/products/${item.productId}`);
            const product = await response.json();
            return { productId: product, quantity: item.quantity };
          });
          const items = await Promise.all(productPromises);
          setGuestCart({ items });
        };
        fetchProducts();
      }
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: (productId: string) => {
      if (!token) {
        localStorageService.removeFromCart(productId);
        return Promise.resolve();
      }
      return apiRequest(`/api/cart/${productId}`, "DELETE");
    },
    onSuccess: () => {
      if (token) {
        queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      } else {
        const localCart = localStorageService.getCart();
        const fetchProducts = async () => {
          const productPromises = localCart.items.map(async (item) => {
            const response = await fetch(`/api/products/${item.productId}`);
            const product = await response.json();
            return { productId: product, quantity: item.quantity };
          });
          const items = await Promise.all(productPromises);
          setGuestCart({ items });
        };
        fetchProducts();
      }
      toast({ title: "Item removed from cart" });
    },
  });

  if (token && isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          Loading cart...
        </div>
        <Footer />
      </div>
    );
  }

  if (!token && !guestCart) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          Loading cart...
        </div>
        <Footer />
      </div>
    );
  }

  const items = token ? ((cart as any)?.items || []) : (guestCart?.items || []);
  const subtotal = items.reduce((sum: number, item: any) => {
    return sum + (item.productId?.price || 0) * item.quantity;
  }, 0);

  const shippingCharges = subtotal >= 999 ? 0 : 99;
  const total = subtotal + shippingCharges;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center py-12">
            <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Add some beautiful sarees to your cart</p>
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
        <h1 className="text-3xl font-bold mb-8" data-testid="text-page-title">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item: any) => (
              <Card key={item.productId?._id || item._id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <img
                      src={item.productId?.images?.[0] || "/api/placeholder/120/150"}
                      alt={item.productId?.name}
                      className="w-24 h-32 object-cover rounded-md"
                      data-testid={`img-product-${item.productId?._id}`}
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2" data-testid={`text-product-name-${item.productId?._id}`}>
                        {item.productId?.name}
                      </h3>
                      
                      <div className="text-sm text-muted-foreground mb-2">
                        {item.productId?.fabric && <span>{item.productId.fabric} • </span>}
                        {item.productId?.color}
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold text-primary" data-testid={`text-price-${item.productId?._id}`}>
                          ₹{item.productId?.price}
                        </span>
                        {item.productId?.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            ₹{item.productId.originalPrice}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center border rounded-md">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantityMutation.mutate({
                              productId: item.productId._id,
                              quantity: Math.max(1, item.quantity - 1)
                            })}
                            disabled={updateQuantityMutation.isPending}
                            data-testid={`button-decrease-${item.productId?._id}`}
                          >
                            -
                          </Button>
                          <span className="px-4 font-medium" data-testid={`text-quantity-${item.productId?._id}`}>
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantityMutation.mutate({
                              productId: item.productId._id,
                              quantity: item.quantity + 1
                            })}
                            disabled={updateQuantityMutation.isPending}
                            data-testid={`button-increase-${item.productId?._id}`}
                          >
                            +
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItemMutation.mutate(item.productId._id)}
                          disabled={removeItemMutation.isPending}
                          data-testid={`button-remove-${item.productId?._id}`}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div>
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Order Summary</h3>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal ({items.length} items)</span>
                    <span data-testid="text-subtotal">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping Charges</span>
                    <span data-testid="text-shipping">
                      {shippingCharges === 0 ? 'FREE' : `₹${shippingCharges}`}
                    </span>
                  </div>
                  {subtotal < 999 && (
                    <p className="text-xs text-muted-foreground">
                      Add ₹{999 - subtotal} more for FREE delivery
                    </p>
                  )}
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between text-lg font-bold mb-6">
                  <span>Total</span>
                  <span className="text-primary" data-testid="text-total">₹{total}</span>
                </div>

                <Button 
                  className="w-full" 
                  onClick={() => {
                    if (!token) {
                      toast({ title: "Please login to proceed with checkout", variant: "destructive" });
                      openLogin();
                    } else {
                      setLocation("/checkout");
                    }
                  }} 
                  data-testid="button-checkout"
                >
                  Proceed to Checkout
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  Secure checkout • Safe payments
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
