import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Award, Heart, Shield, Truck } from "lucide-react";
import { motion } from "framer-motion";

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

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const fadeInLeft = {
    hidden: { opacity: 0, x: -80 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.9,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: 80 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.9,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <motion.section 
          className="bg-primary/5 py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-4xl mx-auto px-4 text-center">
            <motion.h1 
              className="text-4xl font-bold mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              About Ramani Fashion
            </motion.h1>
            <motion.p 
              className="text-lg text-muted-foreground leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Welcome to Ramani Fashion, your premier destination for exquisite sarees that celebrate 
              Indian tradition and contemporary style. For years, we've been dedicated to bringing you 
              the finest collection of sarees from across India.
            </motion.p>
          </div>
        </motion.section>

        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <motion.div
              variants={fadeInLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
            >
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
            </motion.div>
            <motion.div 
              className="aspect-square rounded-lg overflow-hidden"
              variants={fadeInRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
            >
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <p className="text-6xl font-script text-primary">Ramani Fashion</p>
              </div>
            </motion.div>
          </div>

          <div className="mb-16">
            <motion.h2 
              className="text-3xl font-bold text-center mb-12"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
            >
              Why Choose Us
            </motion.h2>
            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div key={feature.title} variants={scaleIn}>
                    <Card className="p-6 text-center h-full hover-elevate">
                      <motion.div 
                        className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Icon className="h-8 w-8 text-primary" />
                      </motion.div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
