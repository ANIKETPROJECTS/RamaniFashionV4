import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Award, Heart, Shield, Truck } from "lucide-react";

export default function AboutUs() {
  const features = [
    {
      icon: Award,
      title: "Premium Quality",
      description: "We source only the finest fabrics and ensure exceptional craftsmanship in every saree."
    },
    {
      icon: Heart,
      title: "Customer First",
      description: "Your satisfaction is our priority. We're here to help you find the perfect saree."
    },
    {
      icon: Shield,
      title: "Authentic Products",
      description: "100% genuine products with authenticity certificates for traditional sarees."
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Quick and secure delivery across India with easy returns and exchanges."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <section className="bg-primary/5 py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-6">About Ramani Fashion</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Welcome to Ramani Fashion, your premier destination for exquisite sarees that celebrate 
              Indian tradition and contemporary style. For years, we've been dedicated to bringing you 
              the finest collection of sarees from across India.
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-3xl font-bold mb-4">Our Story</h2>
              <p className="text-muted-foreground mb-4">
                Ramani Fashion was born from a passion for preserving and promoting the rich heritage 
                of Indian textiles. We believe that every saree tells a story, and we're honored to be 
                part of your special moments.
              </p>
              <p className="text-muted-foreground">
                From traditional silk sarees to contemporary designer pieces, our curated collection 
                represents the diversity and beauty of Indian craftsmanship. Each piece is carefully 
                selected to ensure it meets our high standards of quality and style.
              </p>
            </div>
            <div className="aspect-square rounded-lg overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <p className="text-6xl font-script text-primary">Ramani Fashion</p>
              </div>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.title} className="p-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
