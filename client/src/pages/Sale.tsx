import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

export default function Sale() {
  const [, setLocation] = useLocation();

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["/api/products?sort=price&order=asc"],
  });

  const saleProducts = (productsData as any)?.products?.slice(0, 12) || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <section className="bg-destructive text-destructive-foreground py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-4">SALE</h1>
            <p className="text-xl">Up to 50% off on selected sarees</p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-12">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {saleProducts.map((product: any) => (
                <ProductCard
                  key={product._id}
                  id={product._id}
                  name={product.name}
                  image={product.images?.[0] || "/placeholder.jpg"}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  discount={product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0}
                  rating={product.rating}
                  reviewCount={product.reviewCount}
                  isNew={product.isNew}
                  isBestseller={product.isBestseller}
                  onClick={() => setLocation(`/product/${product._id}`)}
                  onAddToCart={() => {}}
                  onAddToWishlist={() => {}}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
