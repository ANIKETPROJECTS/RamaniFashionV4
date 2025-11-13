export function handleBuyNow(productId: string, quantity: number = 1, navigate: (path: string) => void, toast: any, openLogin?: () => void) {
  const token = localStorage.getItem("token");
  if (!token) {
    toast({ title: "Please login to proceed with Buy Now", variant: "destructive" });
    if (openLogin) {
      openLogin();
    }
    return;
  }
  navigate(`/product/${productId}`);
}
