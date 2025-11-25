import { Send } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import logoImage from "@assets/PNG__B_ LOGO_1762442171742.png";
import instagramIcon from "@assets/instagram_1762445939344.png";
import facebookIcon from "@assets/communication_1762445935759.png";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [location, setLocation] = useLocation();

  const handleSubscribe = () => {
    console.log('Subscribe:', email);
    setEmail("");
  };

  const handleHomeClick = () => {
    if (location === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setLocation("/");
    }
  };

  const handleContactClick = () => {
    setLocation("/");
    setTimeout(() => {
      const contactSection = document.getElementById("contact");
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <footer className="bg-gradient-to-b from-pink-50 to-white border-t mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-8">
          <div className="lg:col-span-2">
            <img 
              src={logoImage}
              alt="Ramani Fashion" 
              className="h-24 md:h-28 w-auto object-contain mb-4"
              data-testid="img-footer-logo"
            />
            <p className="text-sm text-muted-foreground mb-4">
              Your destination for authentic handloom sarees and traditional Indian ethnic wear.
            </p>
            <div className="flex items-start gap-6">
              <a 
                href="https://www.instagram.com/ramanifashionindia/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity min-w-0"
                data-testid="link-instagram-footer"
              >
                <img src={instagramIcon} alt="Instagram" className="h-6 w-6 flex-shrink-0" />
                <span className="text-xs font-medium text-black text-center leading-tight">@ramanifashionindia</span>
              </a>
              <a 
                href="https://www.facebook.com/186191114586811" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity min-w-0"
                data-testid="link-facebook-footer"
              >
                <img src={facebookIcon} alt="Facebook" className="h-6 w-6 flex-shrink-0" />
                <span className="text-xs font-medium text-black text-center leading-tight">Ramani<br />Fashion</span>
              </a>
              <a 
                href="https://chat.whatsapp.com/GqIsU9ZF2SJ9buuSKxGFWB" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity min-w-0"
                data-testid="link-whatsapp-footer"
              >
                <SiWhatsapp className="h-6 w-6 text-green-600 flex-shrink-0" />
                <span className="text-xs font-medium text-black text-center leading-tight">WhatsApp<br />Group</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4 text-primary">Categories</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products?category=Jamdani Paithani" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-jamdani">Jamdani Paithani</Link></li>
              <li><Link href="/products?category=Khun Irkal" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-khun">Khun / Irkal (Ilkal)</Link></li>
              <li><Link href="/products?category=Ajrakh Modal" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-ajrakh">Ajrakh Modal</Link></li>
              <li><Link href="/products?category=Mul Mul Cotton" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-mul">Mul Mul Cotton</Link></li>
              <li><Link href="/products?category=Khadi Cotton" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-khadi">Khadi Cotton</Link></li>
              <li><Link href="/products?category=Patch Work" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-patch">Patch Work</Link></li>
              <li><Link href="/products?category=Pure Linen" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-linen">Pure Linen</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4 text-primary">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={handleHomeClick} className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-home-footer">Home</button></li>
              <li><Link href="/new-arrivals" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-new-arrivals-footer">New Arrivals</Link></li>
              <li><Link href="/trending-collection" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-trending-footer">Trending Collection</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-about-footer">About Us</Link></li>
              <li><Link href="/sale" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-sale-footer">Sale</Link></li>
              <li><button onClick={handleContactClick} className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-contact-footer">Contact</button></li>
              <li><Link href="/admin/login" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-admin-footer">Admin Panel</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4 text-primary">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/shipping" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-shipping">Shipping Info</Link></li>
              <li><Link href="/returns" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-returns">Returns & Exchange</Link></li>
              <li><Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-faq">FAQs</Link></li>
              <li><Link href="/size-guide" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-size-guide">Size Guide</Link></li>
              <li><Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-policy">Policy Page</Link></li>
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
              <Link href="/privacy" className="hover:text-primary transition-colors" data-testid="link-privacy">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-primary transition-colors" data-testid="link-terms">Terms & Conditions</Link>
              <Link href="/shipping" className="hover:text-primary transition-colors" data-testid="link-shipping-footer">Shipping Policy</Link>
              <Link href="/returns" className="hover:text-primary transition-colors" data-testid="link-returns-footer">Return & Refund Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
