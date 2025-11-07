import Header from "@/components/Header";
import HeroCarousel from "@/components/HeroCarousel";
import CategoryCard from "@/components/CategoryCard";
import NewArrivalCard from "@/components/NewArrivalCard";
import TestimonialCard from "@/components/TestimonialCard";
import Footer from "@/components/Footer";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";

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

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  mobile: z.string().min(10, "Please enter a valid mobile number"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  category: z.string().min(1, "Please select a category"),
  message: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function Home() {
  const [, setLocation] = useLocation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { data: newArrivalsData } = useQuery({
    queryKey: ["/api/products?isNew=true&limit=6"],
  });

  const { data: trendingData } = useQuery({
    queryKey: ["/api/products?isTrending=true&limit=6"],
  });

  const newArrivals = (newArrivalsData as any)?.products || [];
  const trendingProducts = (trendingData as any)?.products || [];

  const contactForm = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      mobile: "",
      email: "",
      subject: "",
      category: "",
      message: "",
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormValues) => {
      return await apiRequest("/api/contact", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Message Sent Successfully!",
        description: "Thank you for contacting us. We'll get back to you soon.",
      });
      contactForm.reset();
      setIsSubmitting(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const onContactSubmit = (data: ContactFormValues) => {
    setIsSubmitting(true);
    contactMutation.mutate(data);
  };

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

  const customerPhotos = [
    bridalImage,
    designerImage,
    festiveImage,
    partyImage,
    cottonImage,
    casualImage,
    banarasiImage,
    paithaniImage,
    khunIrkalImage,
  ];

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
              <div className="lg:col-span-1 space-y-6">
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

                <div className="bg-background rounded-xl p-6 shadow-sm border border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Customer Photos ({customerPhotos.length})
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {customerPhotos.map((photo, index) => (
                      <div 
                        key={index}
                        onClick={() => setSelectedImage(photo)}
                        className="aspect-square overflow-hidden rounded-lg cursor-pointer hover:opacity-80 transition-opacity border border-border"
                      >
                        <img 
                          src={photo} 
                          alt={`Customer photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
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

        <section id="contact" className="py-12 bg-gradient-to-b from-pink-50 to-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Get In Touch</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We'd love to hear from you! Whether you have a question about our products, need assistance, or just want to share your feedback.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-pink-200" data-testid="card-contact-form">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    Send Us a Message
                  </h3>
                  <Form {...contactForm}>
                    <form onSubmit={contactForm.handleSubmit(onContactSubmit)} className="space-y-4">
                      <FormField
                        control={contactForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Your full name" 
                                {...field} 
                                className="border-pink-200 focus:border-pink-500"
                                data-testid="input-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={contactForm.control}
                        name="mobile"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mobile Number *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Your mobile number" 
                                {...field}
                                className="border-pink-200 focus:border-pink-500"
                                data-testid="input-mobile"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={contactForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address *</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="your.email@example.com" 
                                {...field}
                                className="border-pink-200 focus:border-pink-500"
                                data-testid="input-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={contactForm.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="What is this regarding?" 
                                {...field}
                                className="border-pink-200 focus:border-pink-500"
                                data-testid="input-subject"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={contactForm.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category of Interest *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger 
                                  className="border-pink-200 focus:border-pink-500"
                                  data-testid="select-category"
                                >
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="sarees" data-testid="option-sarees">Sarees</SelectItem>
                                <SelectItem value="lehengas" data-testid="option-lehengas">Lehengas</SelectItem>
                                <SelectItem value="kurtis" data-testid="option-kurtis">Kurtis</SelectItem>
                                <SelectItem value="dress-materials" data-testid="option-dress-materials">Dress Materials</SelectItem>
                                <SelectItem value="custom-order" data-testid="option-custom-order">Custom Order</SelectItem>
                                <SelectItem value="bulk-order" data-testid="option-bulk-order">Bulk Order</SelectItem>
                                <SelectItem value="general-inquiry" data-testid="option-general-inquiry">General Inquiry</SelectItem>
                                <SelectItem value="complaint" data-testid="option-complaint">Complaint</SelectItem>
                                <SelectItem value="feedback" data-testid="option-feedback">Feedback</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={contactForm.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Tell us more about your inquiry..."
                                className="min-h-[100px] border-pink-200 focus:border-pink-500"
                                {...field}
                                data-testid="textarea-message"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-6 text-lg"
                        data-testid="button-submit"
                      >
                        {isSubmitting ? (
                          "Sending..."
                        ) : (
                          <>
                            <Send className="w-5 h-5 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="border-pink-200" data-testid="card-map">
                  <CardContent className="p-0">
                    <div className="relative w-full h-[280px] rounded-lg overflow-hidden">
                      <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3749.6774857769634!2d73.7875!3d19.9975!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDU5JzUxLjAiTiA3M8KwNDcnMTUuMCJF!5e0!3m2!1sen!2sin!4v1234567890"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Ramani Fashion Location"
                        data-testid="iframe-map"
                      ></iframe>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-pink-200 hover:shadow-xl transition-shadow" data-testid="card-contact-address">
                    <CardContent className="p-4 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-200 rounded-full mb-2">
                        <MapPin className="w-6 h-6 text-pink-600" />
                      </div>
                      <h3 className="text-sm font-semibold mb-1">Address</h3>
                      <p className="text-xs text-muted-foreground" data-testid="text-address">
                        Shop No. 15, Ground Floor,<br />Kalpataru Complex,<br />Near City Mall, Nashik,<br />Maharashtra 422001
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-pink-200 hover:shadow-xl transition-shadow" data-testid="card-contact-phone">
                    <CardContent className="p-4 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full mb-2">
                        <Phone className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="text-sm font-semibold mb-1">Phone</h3>
                      <a 
                        href="tel:+915555555555" 
                        className="text-purple-600 hover:underline text-xs block mb-1"
                        data-testid="link-phone"
                      >
                        +91 5555555555
                      </a>
                      <div className="flex justify-center gap-2">
                        <a 
                          href="https://instagram.com/ramanifashion" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-pink-600 hover:scale-110 transition-transform"
                          data-testid="link-instagram"
                          aria-label="Instagram"
                        >
                          <FaInstagram className="w-4 h-4" />
                        </a>
                        <a 
                          href="https://wa.me/915555555555" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-green-600 hover:scale-110 transition-transform"
                          data-testid="link-whatsapp"
                          aria-label="WhatsApp"
                        >
                          <FaWhatsapp className="w-4 h-4" />
                        </a>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-pink-200 hover:shadow-xl transition-shadow" data-testid="card-contact-email">
                    <CardContent className="p-4 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-pink-100 to-purple-200 rounded-full mb-2">
                        <Mail className="w-6 h-6 text-pink-600" />
                      </div>
                      <h3 className="text-sm font-semibold mb-1">Email</h3>
                      <a 
                        href="mailto:info@ramanifashion.in" 
                        className="text-pink-600 hover:underline text-xs"
                        data-testid="link-email"
                      >
                        info@ramanifashion.in
                      </a>
                    </CardContent>
                  </Card>

                  <Card className="border-pink-200 hover:shadow-xl transition-shadow" data-testid="card-store-hours">
                    <CardContent className="p-4 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-200 rounded-full mb-2">
                        <Clock className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="text-sm font-semibold mb-1">Store Hours</h3>
                      <div className="text-xs text-muted-foreground">
                        <p data-testid="text-hours-weekday">Mon-Sat: 10 AM - 9 PM</p>
                        <p data-testid="text-hours-sunday">Sun: 11 AM - 8 PM</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl w-full p-0 bg-black/95 border-none">
          <div className="relative w-full h-[80vh] flex items-center justify-center">
            {selectedImage && (
              <img 
                src={selectedImage} 
                alt="Customer photo full view"
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
