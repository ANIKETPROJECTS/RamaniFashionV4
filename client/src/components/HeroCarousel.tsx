import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import bannerImage from "@assets/BANNER (1).png";

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroImage, setHeroImage] = useState(bannerImage);

  useEffect(() => {
    // Try to load the uploaded hero banner, fallback to static import
    const img = new Image();
    img.onload = () => setHeroImage("/media/hero-banner.png");
    img.onerror = () => setHeroImage(bannerImage);
    img.src = "/media/hero-banner.png";
  }, []);

  const slides = [
    {
      image: heroImage,
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: "calc(100vh - 140px)", backgroundColor: "#fff" }}
    >
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="relative h-full w-full">
            <img
              src={slide.image}
              alt="Ramani Fashion Banner"
              className="w-full h-full object-cover object-center"
              data-testid={`img-hero-banner-${index}`}
              style={{ display: "block" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
