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
import paithaniImage from "@/assets/paithani.png";
import khunIrkalImage from "@/assets/khun-irkal.png";
import ajrakhModalImage from "@/assets/ajrakh-modal.png";
import mulCottonImage from "@/assets/mul-cotton.png";
import khadiCottonImage from "@/assets/khadi-cotton.png";
import patchWorkImage from "@/assets/patch-work.png";
import pureLinenImage from "@/assets/pure-linen.png";
import saleImage from "@/assets/sale.png";

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

  const newCategories = [
    { name: "Jamdani Paithani", image: paithaniImage },
    { name: "Khun / Irkal (Ilkal)", image: khunIrkalImage },
    { name: "Ajrakh Modal", image: ajrakhModalImage },
    { name: "Mul Mul Cotton", image: mulCottonImage },
    { name: "Khadi Cotton", image: khadiCottonImage },
    { name: "Patch Work", image: patchWorkImage },
    { name: "Pure Linen", image: pureLinenImage },
    { name: "Sale", image: saleImage },
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


  const ratingStats = {
    overall: 4.5,
    totalReviews: 2847,
    totalRatings: 3156,
    breakdown: [
      { stars: 5, count: 1890, percentage: 60 },
      { stars: 4, count: 823, percentage: 26 },
      { stars: 3, count: 284, percentage: 9 },
      { stars: 2, count: 95, percentage: 3 },
      { stars: 1, count: 64, percentage: 2 },
    ]
  };

  const customerReviews = [
    {
      name: "Priya Sharma",
      image: customerImage,
      rating: 5,
      review: "Absolutely stunning saree! The quality is exceptional and the colors are even more beautiful in person. The fabric feels luxurious and drapes perfectly.",
      date: "15 Oct 2025",
      helpful: 24,
      photos: [bridalImage, designerImage, festiveImage],
    },
    {
      name: "Anjali Reddy",
      rating: 5,
      review: "Perfect for my sister's wedding. Got so many compliments! The fabric quality is amazing and the color is exactly as shown in pictures.",
      date: "8 Oct 2025",
      helpful: 18,
      photos: [partyImage, cottonImage],
    },
    {
      name: "Meera Patel",
      image: customerImage,
      rating: 5,
      review: "Beautiful collection and fast delivery. The saree exceeded my expectations. Will definitely shop again from Ramani Fashion!",
      date: "2 Oct 2025",
      helpful: 31,
      photos: [casualImage],
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
          <h2 className="text-3xl font-bold text-center mb-12" data-testid="text-section-categories">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {newCategories.map((category) => (
              <div key={category.name} className="flex flex-col items-center group cursor-pointer">
                <div className="w-full aspect-[2/3] overflow-hidden rounded-lg mb-4 shadow-md hover:shadow-xl transition-shadow duration-300">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-center text-base md:text-lg font-semibold text-foreground">
                  {category.name}
                </h3>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-card py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12" data-testid="text-section-testimonials">
              What Our Customers Say
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
              <div className="lg:col-span-1">
                <div className="bg-background rounded-xl p-8 shadow-sm border border-border">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-6xl font-bold text-foreground">{ratingStats.overall}</span>
                    <span className="text-4xl text-yellow-500">★</span>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    {ratingStats.totalRatings.toLocaleString()} Ratings, {ratingStats.totalReviews.toLocaleString()} Reviews
                  </p>
                  
                  <div className="space-y-3">
                    {ratingStats.breakdown.map((item) => (
                      <div key={item.stars} className="flex items-center gap-3">
                        <span className="text-sm font-medium w-8">{item.stars}★</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full transition-all duration-300"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                {customerReviews.map((review, index) => (
                  <div key={index} className="bg-background rounded-xl p-6 shadow-sm border border-border">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                        {review.image ? (
                          <img src={review.image} alt={review.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-xl font-semibold text-primary">
                            {review.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{review.name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-0.5 rounded text-sm font-medium">
                            {review.rating}★
                          </div>
                          <span className="text-sm text-muted-foreground">Posted on {review.date}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-foreground leading-relaxed mb-4">{review.review}</p>

                    {review.photos && review.photos.length > 0 && (
                      <div className="flex gap-2 mb-4">
                        {review.photos.slice(0, 3).map((photo, photoIndex) => (
                          <div key={photoIndex} className="w-20 h-20 rounded-lg overflow-hidden border border-border">
                            <img src={photo} alt={`Customer photo ${photoIndex + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <button className="flex items-center gap-1 text-sm hover:text-foreground transition-colors">
                        <span>👍</span>
                        <span>Helpful ({review.helpful})</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
