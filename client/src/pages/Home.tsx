import Header from "@/components/Header";
import HeroCarousel from "@/components/HeroCarousel";
import CategoryCard from "@/components/CategoryCard";
import NewArrivalCard from "@/components/NewArrivalCard";
import TestimonialCard from "@/components/TestimonialCard";
import Footer from "@/components/Footer";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

import bridalImage from "@assets/generated_images/Bridal_saree_product_shot_3a9642d4.png";
import cottonImage from "@assets/generated_images/Cotton_saree_product_3295c949.png";
import designerImage from "@assets/generated_images/Designer_saree_modern_91330177.png";
import partyImage from "@assets/generated_images/Party_wear_saree_86e79eab.png";
import casualImage from "@assets/generated_images/Casual_linen_saree_030a208d.png";
import banarasiImage from "@assets/generated_images/Banarasi_saree_detail_604e6fdd.png";
import festiveImage from "@assets/generated_images/Festive_collection_banner_7a822710.png";
import customerImage from "@assets/generated_images/Customer_testimonial_portrait_6ffe6534.png";
import ramaniBanner from "@/assets/ramani-banner.png";

export default function Home() {
  const [, setLocation] = useLocation();

  const { data: newArrivalsData } = useQuery({
    queryKey: ["/api/products?isNew=true&limit=6"],
  });

  const { data: trendingData } = useQuery({
    queryKey: ["/api/products?isTrending=true&limit=6"],
  });

  const newArrivals = (newArrivalsData as any)?.products || [];
  const trendingProducts = (trendingData as any)?.products || [];

  const categories = [
    { name: "Silk Sarees", image: bridalImage, itemCount: 156, category: "Silk Sarees" },
    { name: "Cotton Sarees", image: cottonImage, itemCount: 234, category: "Cotton Sarees" },
    { name: "Designer Sarees", image: designerImage, itemCount: 89, category: "Designer Sarees" },
    { name: "Bridal Sarees", image: bridalImage, itemCount: 67, subcategory: "Bridal" },
    { name: "Party Wear", image: partyImage, itemCount: 145, occasion: "Party" },
    { name: "Casual Wear", image: casualImage, itemCount: 198, occasion: "Casual" },
    { name: "Banarasi", image: banarasiImage, itemCount: 78, fabric: "Banarasi" },
    { name: "Kanjeevaram", image: bridalImage, itemCount: 92, fabric: "Kanjeevaram" },
  ];

  const collections = [
    {
      title: "Haldi & Mehendi Hues",
      image: festiveImage,
      link: "/products?occasion=Wedding&color=Yellow,Orange"
    },
    {
      title: "Sangeet & Style",
      image: partyImage,
      link: "/products?occasion=Party"
    },
    {
      title: "Reception Royalty",
      image: designerImage,
      link: "/products?category=Designer Sarees"
    },
    {
      title: "Bride Squad Goals",
      image: bridalImage,
      link: "/products?subcategory=Bridal"
    }
  ];

  const handleCategoryClick = (cat: any) => {
    const params = new URLSearchParams();
    if (cat.category) params.set("category", cat.category);
    if (cat.subcategory) params.set("subcategory", cat.subcategory);
    if (cat.occasion) params.set("occasion", cat.occasion);
    if (cat.fabric) params.set("fabric", cat.fabric);
    setLocation(`/products?${params.toString()}`);
  };

  const testimonials = [
    {
      name: "Priya Sharma",
      image: customerImage,
      rating: 5,
      review: "Absolutely stunning saree! The quality is exceptional and the colors are even more beautiful in person.",
      verified: true,
    },
    {
      name: "Anjali Reddy",
      rating: 5,
      review: "Perfect for my sister's wedding. Got so many compliments! The fabric quality is amazing.",
      verified: true,
    },
    {
      name: "Meera Patel",
      image: customerImage,
      rating: 4,
      review: "Beautiful collection and fast delivery. Will definitely shop again from Ramani Fashion.",
      verified: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <HeroCarousel />

        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold" data-testid="text-section-new-arrivals-home">
              New Arrival
            </h2>
            <button
              onClick={() => setLocation("/new-arrivals")}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              data-testid="button-view-all-new-arrivals"
            >
              View All
            </button>
          </div>
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
            <div className="flex gap-4 pb-4">
              {newArrivals.slice(0, 6).map((product: any) => (
                <NewArrivalCard
                  key={product._id}
                  id={product._id}
                  name={product.name}
                  image={product.images?.[0] || "/placeholder.jpg"}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  discount={product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0}
                  rating={product.rating}
                  reviewCount={product.reviewCount}
                  onClick={() => setLocation(`/product/${product._id}`)}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="w-full overflow-hidden rounded-lg">
            <img 
              src={ramaniBanner} 
              alt="Ramani Fashion - Shop the authentic Silk Sarees, crafted with perfection by local artisans" 
              className="w-full h-auto object-cover"
            />
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold" data-testid="text-section-trending-collection">
              Trending Collection
            </h2>
            <button
              onClick={() => setLocation("/products?isTrending=true")}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              data-testid="button-view-all-trending"
            >
              View All
            </button>
          </div>
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
            <div className="flex gap-4 pb-4">
              {trendingProducts.slice(0, 6).map((product: any) => (
                <NewArrivalCard
                  key={product._id}
                  id={product._id}
                  name={product.name}
                  image={product.images?.[0] || "/placeholder.jpg"}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  discount={product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0}
                  rating={product.rating}
                  reviewCount={product.reviewCount}
                  onClick={() => setLocation(`/product/${product._id}`)}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold text-center mb-8" data-testid="text-section-categories">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <CategoryCard
                key={category.name}
                name={category.name}
                image={category.image}
                itemCount={category.itemCount}
                onClick={() => handleCategoryClick(category)}
              />
            ))}
          </div>
        </section>

        <section className="bg-card py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8" data-testid="text-section-testimonials">
              What Our Customers Say
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial) => (
                <TestimonialCard key={testimonial.name} {...testimonial} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
