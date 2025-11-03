import Header from "@/components/Header";
import HeroCarousel from "@/components/HeroCarousel";
import CategoryCard from "@/components/CategoryCard";
import ProductCard from "@/components/ProductCard";
import OccasionCard from "@/components/OccasionCard";
import TrustBadges from "@/components/TrustBadges";
import TestimonialCard from "@/components/TestimonialCard";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
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
import pinkHeroImage from "@assets/generated_images/Pink_silk_saree_hero_a644da4b.png";

export default function Home() {
  const [, setLocation] = useLocation();

  const { data: productsData } = useQuery({
    queryKey: ["/api/products?limit=4"],
  });

  const products = (productsData as any)?.products || [];

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

  const priceRanges = [
    { title: "Sarees Under ₹3999", image: casualImage, maxPrice: 3999 },
    { title: "Salwar Suits Under ₹2999", image: partyImage, maxPrice: 2999 },
    { title: "Dress Materials Under ₹2999", image: cottonImage, maxPrice: 2999 },
    { title: "Lehengas Under ₹14999", image: bridalImage, maxPrice: 14999 }
  ];

  const handleCategoryClick = (cat: any) => {
    const params = new URLSearchParams();
    if (cat.category) params.set("category", cat.category);
    if (cat.subcategory) params.set("subcategory", cat.subcategory);
    if (cat.occasion) params.set("occasion", cat.occasion);
    if (cat.fabric) params.set("fabric", cat.fabric);
    setLocation(`/products?${params.toString()}`);
  };

  const occasions = [
    {
      title: "Weddings",
      image: bridalImage,
      description: "Exquisite sarees for your special day",
    },
    {
      title: "Festivals",
      image: festiveImage,
      description: "Celebrate in traditional elegance",
    },
    {
      title: "Party",
      image: partyImage,
      description: "Stand out at every celebration",
    },
  ];

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
          <h2 className="text-3xl font-bold text-center mb-4">Your Shaadi Wardrobe</h2>
          <p className="text-center text-muted-foreground mb-8">Curated collections for every celebration</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {collections.map((collection) => (
              <Card
                key={collection.title}
                className="overflow-hidden cursor-pointer hover-elevate active-elevate-2 group"
                onClick={() => setLocation(collection.link)}
              >
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={collection.image}
                    alt={collection.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white text-center">
                    <h3 className="text-lg font-semibold">{collection.title}</h3>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-r from-primary/10 to-pink-100 py-12 my-12">
          <div className="max-w-7xl mx-auto px-4">
            <Card className="bg-gradient-to-r from-primary to-pink-600 text-white p-8 md:p-12 text-center overflow-hidden relative">
              <div className="absolute inset-0 opacity-10">
                <img src={pinkHeroImage} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">App Exclusive Offer</h2>
                <p className="text-xl mb-6">Flat 15% Off</p>
                <p className="text-lg mb-6">Use Code: APPFIRST</p>
                <button className="bg-white text-primary px-8 py-3 rounded-md font-semibold hover-elevate active-elevate-2">
                  Shop Now
                </button>
              </div>
            </Card>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold text-center mb-8">Curated for You</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {priceRanges.map((range) => (
              <Card
                key={range.title}
                className="overflow-hidden cursor-pointer hover-elevate active-elevate-2 group"
                onClick={() => setLocation(`/products?maxPrice=${range.maxPrice}`)}
              >
                <div className="aspect-[3/4] relative overflow-hidden">
                  <img
                    src={range.image}
                    alt={range.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white text-center">
                    <h3 className="font-semibold">{range.title}</h3>
                  </div>
                </div>
              </Card>
            ))}
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

        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold" data-testid="text-section-new-arrivals">
              New Arrivals
            </h2>
            <a href="/new-arrivals" className="text-primary hover:underline" data-testid="link-view-all-new">
              View All →
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 4).map((product: any) => (
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
        </section>

        <section className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold text-center mb-8" data-testid="text-section-occasions">
            Shop by Occasion
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {occasions.map((occasion) => (
              <OccasionCard
                key={occasion.title}
                title={occasion.title}
                image={occasion.image}
                description={occasion.description}
                onClick={() => setLocation(`/products?occasion=${occasion.title}`)}
              />
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-12">
          <TrustBadges />
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
