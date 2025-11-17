import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import placeholderImage from "@assets/stock_images/elegant_saree_produc_6a8286b5.jpg";

interface NewArrivalCardProps {
  id: string;
  name: string;
  image: string;
  secondaryImage?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating?: number;
  reviewCount?: number;
  onClick?: () => void;
}

export default function NewArrivalCard({
  id,
  name,
  image,
  secondaryImage,
  price,
  originalPrice,
  discount,
  rating = 0,
  reviewCount = 0,
  onClick,
}: NewArrivalCardProps) {
  const [, setLocation] = useLocation();
  const [currentImage, setCurrentImage] = useState(image);

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover-elevate active-elevate-2 group min-w-[200px] md:min-w-[250px]"
      onClick={() => onClick ? onClick() : setLocation(`/product/${id}`)}
      data-testid={`card-new-arrival-${id}`}
    >
      <div className="relative aspect-[3/5] overflow-hidden bg-gray-100">
        <img
          src={currentImage || placeholderImage}
          alt={name}
          className="w-full h-full object-cover"
          onMouseEnter={() => secondaryImage && setCurrentImage(secondaryImage)}
          onMouseLeave={() => setCurrentImage(image)}
        />
        
        <Badge 
          className="absolute top-2 right-2 rounded-full bg-amber-800 text-white px-3 py-1 text-xs font-medium"
          data-testid={`badge-new-${id}`}
        >
          NEW
        </Badge>

        {rating > 0 && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/90 px-2 py-1 rounded">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-gray-700" data-testid={`text-review-count-${id}`}>
              ({reviewCount})
            </span>
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-medium text-sm mb-2 line-clamp-2 min-h-[40px]" data-testid={`text-product-name-${id}`}>
          {name}
        </h3>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-lg font-bold text-black" data-testid={`text-price-${id}`}>
            ₹{price.toLocaleString()}
          </span>
          {originalPrice && (
            <>
              <span className="text-sm text-black line-through" data-testid={`text-original-price-${id}`}>
                ₹{originalPrice.toLocaleString()}
              </span>
              {discount !== undefined && discount > 0 && (
                <span className="text-xs text-black font-medium" data-testid={`text-discount-${id}`}>
                  {discount}% off
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
