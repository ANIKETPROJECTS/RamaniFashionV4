import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function PaymentCallback() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [merchantOrderId, setMerchantOrderId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("merchantOrderId") || params.get("orderId");
    if (orderId) {
      setMerchantOrderId(orderId);
    }
  }, []);

  const { data: paymentStatus, isLoading } = useQuery({
    queryKey: ['/api/payment/phonepe/status', merchantOrderId],
    enabled: !!merchantOrderId,
    refetchInterval: (query) => {
      const data = query.state.data as any;
      if (data?.state === "COMPLETED" || data?.state === "FAILED") {
        return false;
      }
      return 3000;
    },
  });

  const simulatePaymentMutation = useMutation({
    mutationFn: (status: 'success' | 'failed') =>
      apiRequest("/api/payment/phonepe/test-simulate", "POST", {
        merchantOrderId,
        status,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/payment/phonepe/status', merchantOrderId] 
      });
      toast({ title: "Payment status updated" });
    },
    onError: (error: any) => {
      toast({
        title: "Simulation failed",
        description: error.message || "Failed to simulate payment",
        variant: "destructive",
      });
    },
  });

  const isSuccess = (paymentStatus as any)?.state === "COMPLETED";
  const isFailed = (paymentStatus as any)?.state === "FAILED";
  const isPending = !isSuccess && !isFailed;
  const isDevelopment = import.meta.env.DEV;

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
                {isDevelopment && merchantOrderId && (
                  <div className="mt-4 p-4 border border-orange-500 rounded-md bg-orange-50 dark:bg-orange-950/20">
                    <div className="flex items-start gap-2 mb-3">
                      <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-1">
                          Test Mode - Sandbox Payment
                        </p>
                        <p className="text-xs text-orange-700 dark:text-orange-300 mb-3">
                          PhonePe sandbox payments don't auto-complete. Close the PhonePe tab and use these buttons to simulate the payment outcome:
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => simulatePaymentMutation.mutate('success')}
                        disabled={simulatePaymentMutation.isPending}
                        data-testid="button-simulate-success"
                      >
                        Simulate Success
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => simulatePaymentMutation.mutate('failed')}
                        disabled={simulatePaymentMutation.isPending}
                        data-testid="button-simulate-failure"
                      >
                        Simulate Failure
                      </Button>
                    </div>
                  </div>
                )}
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
