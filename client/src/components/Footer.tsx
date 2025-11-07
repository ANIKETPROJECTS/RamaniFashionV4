import { Send } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import logoImage from "@assets/PNG__B_ LOGO_1762442171742.png";
import instagramIcon from "@assets/instagram_1762445939344.png";
import facebookIcon from "@assets/communication_1762445935759.png";

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = () => {
    console.log('Subscribe:', email);
    setEmail("");
  };

  return (
    <footer className="bg-gradient-to-b from-pink-50 to-white border-t mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          <div className="lg:col-span-1">
            <img 
              src={logoImage}
              alt="Ramani Fashion" 
              className="h-24 md:h-28 w-auto object-contain mb-4"
              data-testid="img-footer-logo"
            />
            <p className="text-sm text-muted-foreground mb-4">
              Your destination for authentic handloom sarees and traditional Indian ethnic wear.
            </p>
            <div className="flex items-start gap-8">
              <a 
                href="https://instagram.com/ramanifashion" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity"
                data-testid="link-instagram-footer"
              >
                <img src={instagramIcon} alt="Instagram" className="h-6 w-6" />
                <span className="text-xs font-medium text-black">@ramanifashion</span>
              </a>
              <a 
                href="https://facebook.com/ramanifashion" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity"
                data-testid="link-facebook-footer"
              >
                <img src={facebookIcon} alt="Facebook" className="h-6 w-6" />
                <span className="text-xs font-medium text-black">@ramanifashion</span>
              </a>
              <a 
                href="https://wa.me/915555555555" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity"
                data-testid="link-whatsapp-footer"
              >
                <SiWhatsapp className="h-6 w-6 text-green-600" />
                <span className="text-xs font-medium text-black">+91 5555555555</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4 text-primary">Categories</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/products?category=Jamdani Paithani" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-jamdani">Jamdani Paithani</a></li>
              <li><a href="/products?category=Khun Irkal" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-khun">Khun / Irkal (Ilkal)</a></li>
              <li><a href="/products?category=Ajrakh Modal" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-ajrakh">Ajrakh Modal</a></li>
              <li><a href="/products?category=Mul Mul Cotton" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-mul">Mul Mul Cotton</a></li>
              <li><a href="/products?category=Khadi Cotton" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-khadi">Khadi Cotton</a></li>
              <li><a href="/products?category=Patch Work" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-patch">Patch Work</a></li>
              <li><a href="/products?category=Pure Linen" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-linen">Pure Linen</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4 text-primary">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-home-footer">Home</a></li>
              <li><a href="/new-arrivals" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-new-arrivals-footer">New Arrivals</a></li>
              <li><a href="/products?isTrending=true" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-trending-footer">Trending Collection</a></li>
              <li><a href="/about" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-about-footer">About Us</a></li>
              <li><a href="/sale" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-sale-footer">Sale</a></li>
              <li><a href="/#contact" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-contact-footer">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4 text-primary">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/#contact" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-contact-service">Contact Us</a></li>
              <li><a href="/shipping" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-shipping">Shipping Info</a></li>
              <li><a href="/returns" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-returns">Returns & Exchange</a></li>
              <li><a href="/faq" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-faq">FAQs</a></li>
              <li><a href="/size-guide" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-size-guide">Size Guide</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4 text-primary">Newsletter</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe to get special offers and updates
            </p>
            <div className="flex flex-col gap-2">
              <Input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-pink-200 focus:border-pink-500"
                data-testid="input-newsletter"
              />
              <Button 
                onClick={handleSubscribe} 
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                data-testid="button-subscribe"
              >
                <Send className="h-4 w-4 mr-2" />
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-pink-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2025 Ramani Fashion India. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="/privacy" className="hover:text-primary transition-colors" data-testid="link-privacy">Privacy Policy</a>
              <a href="/terms" className="hover:text-primary transition-colors" data-testid="link-terms">Terms of Service</a>
              <a href="/cookie-policy" className="hover:text-primary transition-colors" data-testid="link-cookies">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
