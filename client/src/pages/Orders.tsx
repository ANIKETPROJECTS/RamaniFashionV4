import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Package, ShoppingBag } from "lucide-react";
import { format } from "date-fns";
import { useAuthUI } from "@/contexts/AuthUIContext";

export default function Orders() {
  const [, setLocation] = useLocation();
  const { openLogin } = useAuthUI();

  const { data: orders, isLoading, isError, error } = useQuery({
    queryKey: ["/api/orders"],
  });

  const isUnauthorized = isError && error && String(error).includes("401:");

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          Loading orders...
        </div>
        <Footer />
      </div>
    );
  }

  if (isError || !orders) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="mb-4">
            {isUnauthorized 
              ? "Please login to view your orders" 
              : isError 
                ? "Failed to load orders. Please try again." 
                : "Loading..."}
          </p>
          <div className="flex gap-2 justify-center">
            {isUnauthorized ? (
              <Button onClick={openLogin} data-testid="button-login">
                Login
              </Button>
            ) : isError ? (
              <Button 
                onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/orders"] })}
                data-testid="button-retry"
              >
                Retry
              </Button>
            ) : null}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const ordersList = orders as any[];

  if (ordersList.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center py-12">
            <Package className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
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
        <h1 className="text-3xl font-bold mb-8" data-testid="text-page-title">My Orders</h1>

        <div className="space-y-6">
          {ordersList.map((order: any) => (
            <Card key={order._id} data-testid={`order-${order._id}`}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg" data-testid={`text-order-number-${order._id}`}>
                      Order #{order.orderNumber}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Placed on {format(new Date(order.createdAt), "PPP")}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getStatusColor(order.orderStatus)} data-testid={`badge-order-status-${order._id}`}>
                      {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                    </Badge>
                    <Badge className={getPaymentStatusColor(order.paymentStatus)} data-testid={`badge-payment-status-${order._id}`}>
                      {order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus === 'pending' ? 'Payment Pending' : 'Payment Failed'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3">Order Items</h4>
                    <div className="space-y-3">
                      {order.items.map((item: any, index: number) => (
                        <div key={index} className="flex gap-4" data-testid={`order-item-${order._id}-${index}`}>
                          <img
                            src={item.image || "/api/placeholder/80/100"}
                            alt={item.name}
                            className="w-16 h-20 object-cover rounded-md"
                            data-testid={`img-item-${index}`}
                          />
                          <div className="flex-1">
                            <h5 className="font-medium" data-testid={`text-item-name-${index}`}>{item.name}</h5>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-sm text-muted-foreground">Qty: {item.quantity}</span>
                              <span className="font-semibold text-primary" data-testid={`text-item-price-${index}`}>
                                ₹{item.price.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Shipping Address</h4>
                      <div className="text-sm space-y-1">
                        <p className="font-medium">{order.shippingAddress.fullName}</p>
                        <p className="text-muted-foreground">{order.shippingAddress.phone}</p>
                        <p className="text-muted-foreground">
                          {order.shippingAddress.address}, {order.shippingAddress.locality}
                        </p>
                        <p className="text-muted-foreground">
                          {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                        </p>
                        {order.shippingAddress.landmark && (
                          <p className="text-muted-foreground">Landmark: {order.shippingAddress.landmark}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Order Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span data-testid={`text-subtotal-${order._id}`}>₹{order.subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Shipping</span>
                          <span data-testid={`text-shipping-${order._id}`}>
                            {order.shippingCharges === 0 ? "Free" : `₹${order.shippingCharges}`}
                          </span>
                        </div>
                        {order.discount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount</span>
                            <span>-₹{order.discount.toLocaleString()}</span>
                          </div>
                        )}
                        <Separator />
                        <div className="flex justify-between font-bold text-base">
                          <span>Total</span>
                          <span className="text-primary" data-testid={`text-total-${order._id}`}>
                            ₹{order.total.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Payment Method</span>
                          <span className="uppercase">{order.paymentMethod}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
