import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";

import bridalImage from "@assets/generated_images/Bridal_saree_product_shot_3a9642d4.png";
import partyImage from "@assets/generated_images/Party_wear_saree_86e79eab.png";
import festiveImage from "@assets/generated_images/Festive_collection_banner_7a822710.png";
import designerImage from "@assets/generated_images/Designer_saree_modern_91330177.png";

export default function Collections() {
  const [, setLocation] = useLocation();

  const collections = [
    {
      title: "Haldi & Mehendi Hues",
      description: "Vibrant colors for pre-wedding celebrations",
      image: festiveImage,
      link: "/products?occasion=Wedding&color=Yellow,Orange"
    },
    {
      title: "Sangeet & Style",
      description: "Glamorous pieces for musical nights",
      image: partyImage,
      link: "/products?occasion=Party"
    },
    {
      title: "Reception Royalty",
      description: "Elegant sarees for grand receptions",
      image: designerImage,
      link: "/products?category=Designer Sarees"
    },
    {
      title: "Bride Squad Goals",
      description: "Perfect for bridesmaids and bridal party",
      image: bridalImage,
      link: "/products?category=Bridal Sarees"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Our Collections</h1>
          <p className="text-muted-foreground text-lg">
            Curated collections for every celebration
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {collections.map((collection) => (
            <Card
              key={collection.title}
              className="overflow-hidden cursor-pointer hover-elevate active-elevate-2 group"
              onClick={() => setLocation(collection.link)}
            >
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src={collection.image}
                  alt={collection.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h2 className="text-2xl font-bold mb-2">{collection.title}</h2>
                  <p className="text-white/90">{collection.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
