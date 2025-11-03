import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OccasionCard from "@/components/OccasionCard";
import { useLocation } from "wouter";

import bridalImage from "@assets/generated_images/Bridal_saree_product_shot_3a9642d4.png";
import partyImage from "@assets/generated_images/Party_wear_saree_86e79eab.png";
import festiveImage from "@assets/generated_images/Festive_collection_banner_7a822710.png";
import casualImage from "@assets/generated_images/Casual_linen_saree_030a208d.png";

export default function Occasions() {
  const [, setLocation] = useLocation();

  const occasions = [
    {
      title: "Wedding",
      image: bridalImage,
      description: "Exquisite sarees for your special day",
      occasion: "Wedding"
    },
    {
      title: "Party",
      image: partyImage,
      description: "Stand out at every celebration",
      occasion: "Party"
    },
    {
      title: "Festival",
      image: festiveImage,
      description: "Celebrate in traditional elegance",
      occasion: "Festival"
    },
    {
      title: "Casual",
      image: casualImage,
      description: "Comfortable and stylish for everyday wear",
      occasion: "Casual"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Shop by Occasion</h1>
          <p className="text-muted-foreground text-lg">
            Find the perfect saree for every special moment
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {occasions.map((occasion) => (
            <OccasionCard
              key={occasion.title}
              title={occasion.title}
              image={occasion.image}
              description={occasion.description}
              onClick={() => setLocation(`/products?occasion=${occasion.occasion}`)}
            />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
