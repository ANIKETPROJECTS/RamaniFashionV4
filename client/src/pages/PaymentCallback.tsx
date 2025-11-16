import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function PaymentCallback() {
  const [, setLocation] = useLocation();
  const [merchantOrderId, setMerchantOrderId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("merchantOrderId") || params.get("orderId");
    if (orderId) {
      setMerchantOrderId(orderId);
    }
  }, []);

  const { data: paymentStatus, isLoading } = useQuery({
    queryKey: [`/api/payment/phonepe/status/${merchantOrderId}`, merchantOrderId],
    enabled: !!merchantOrderId,
    refetchInterval: (query) => {
      const data = query.state.data as any;
      if (data?.state === "COMPLETED" || data?.state === "FAILED") {
        return false;
      }
      return 3000;
    },
  });

  const isSuccess = (paymentStatus as any)?.state === "COMPLETED";
  const isFailed = (paymentStatus as any)?.state === "FAILED";
  const isPending = !isSuccess && !isFailed;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Payment Status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 py-8">
            {isLoading || isPending ? (
              <>
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-2">Processing Payment</h2>
                  <p className="text-muted-foreground">
                    Please wait while we verify your payment...
                  </p>
                </div>
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle className="w-16 h-16 text-green-500" />
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-2 text-green-600">Payment Successful!</h2>
                  <p className="text-muted-foreground mb-4">
                    Your order has been placed successfully.
                  </p>
                  <div className="space-y-2 text-sm">
                    <p><strong>Order ID:</strong> {merchantOrderId}</p>
                    <p><strong>Amount:</strong> ₹{((paymentStatus as any)?.amount || 0) / 100}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button onClick={() => setLocation("/orders")} data-testid="button-view-orders">
                    View My Orders
                  </Button>
                  <Button variant="outline" onClick={() => setLocation("/")} data-testid="button-continue-shopping">
                    Continue Shopping
                  </Button>
                </div>
              </>
            ) : isFailed ? (
              <>
                <XCircle className="w-16 h-16 text-red-500" />
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-2 text-red-600">Payment Failed</h2>
                  <p className="text-muted-foreground mb-4">
                    Unfortunately, your payment could not be processed.
                  </p>
                  {(paymentStatus as any)?.paymentDetails?.errorMessage && (
                    <p className="text-sm text-muted-foreground mb-4">
                      {(paymentStatus as any).paymentDetails.errorMessage}
                    </p>
                  )}
                </div>
                <div className="flex gap-4">
                  <Button onClick={() => setLocation("/checkout")} data-testid="button-retry-payment">
                    Try Again
                  </Button>
                  <Button variant="outline" onClick={() => setLocation("/")} data-testid="button-go-home">
                    Go to Home
                  </Button>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
