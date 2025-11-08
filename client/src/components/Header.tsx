import { ShoppingBag, Heart, User, Search, Menu, LogOut, ChevronDown } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import instagramIcon from "@assets/instagram_1762445939344.png";
import facebookIcon from "@assets/communication_1762445935759.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, type MouseEvent } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import logoImage from "@assets/PNG__B_ LOGO_1762442171742.png";

interface HeaderProps {
  cartCount?: number;
  wishlistCount?: number;
  onMenuClick?: () => void;
}

export default function Header({ cartCount = 0, wishlistCount = 0, onMenuClick }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [storageUpdateTrigger, setStorageUpdateTrigger] = useState(0);

  const { data: cart } = useQuery({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  const { data: wishlist } = useQuery({
    queryKey: ["/api/wishlist"],
    enabled: !!user,
  });

  // Calculate cart count with fallback to local storage for guest users
  const getCartCount = () => {
    if (user && cart) {
      return (cart as any)?.items?.length || 0;
    }
    // Fallback to local storage for guest users
    const guestCart = localStorage.getItem("guest_cart");
    if (guestCart) {
      try {
        const parsedCart = JSON.parse(guestCart);
        return parsedCart.items?.length || 0;
      } catch {
        return 0;
      }
    }
    return cartCount;
  };

  // Calculate wishlist count with fallback to local storage for guest users
  const getWishlistCount = () => {
    if (user && wishlist) {
      return (wishlist as any)?.products?.length || 0;
    }
    // Fallback to local storage for guest users
    const guestWishlist = localStorage.getItem("guest_wishlist");
    if (guestWishlist) {
      try {
        const parsedWishlist = JSON.parse(guestWishlist);
        return parsedWishlist.products?.length || 0;
      } catch {
        return 0;
      }
    }
    return wishlistCount;
  };

  const actualCartCount = getCartCount();
  const actualWishlistCount = getWishlistCount();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Listen for cart/wishlist updates in localStorage
    const handleStorageChange = () => {
      setStorageUpdateTrigger(prev => prev + 1);
    };

    // Listen for custom events (when localStorage is updated programmatically in the same window)
    window.addEventListener('cartUpdated', handleStorageChange);
    window.addEventListener('wishlistUpdated', handleStorageChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('cartUpdated', handleStorageChange);
      window.removeEventListener('wishlistUpdated', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    // Clear cart and other user-specific query caches
    queryClient.removeQueries({ queryKey: ["/api/cart"] });
    queryClient.removeQueries({ queryKey: ["/api/wishlist"] });
    queryClient.removeQueries({ queryKey: ["/api/addresses"] });
    queryClient.removeQueries({ queryKey: ["/api/orders"] });
    setLocation("/");
  };

  const handleContactClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLocation("/");
    setTimeout(() => {
      const contactSection = document.getElementById("contact");
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const handleHomeClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (location === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setLocation("/");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="grid grid-cols-3 items-center gap-6">
          <div className="flex items-start gap-3">
            <Button
              size="icon"
              variant="ghost"
              className="md:hidden"
              onClick={onMenuClick}
              data-testid="button-menu"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="hidden md:flex items-start gap-8">
              <a 
                href="https://instagram.com/ramanifashion" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity group"
                data-testid="link-instagram"
              >
                <img src={instagramIcon} alt="Instagram" className="h-6 w-6" />
                <span className="text-xs font-medium text-black">@ramanifashion</span>
              </a>
              <a 
                href="https://facebook.com/ramanifashion" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity group"
                data-testid="link-facebook"
              >
                <img src={facebookIcon} alt="Facebook" className="h-6 w-6" />
                <span className="text-xs font-medium text-black">@ramanifashion</span>
              </a>
              <a 
                href="https://wa.me/915555555555" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity group"
                data-testid="link-whatsapp"
              >
                <SiWhatsapp className="h-6 w-6 text-green-600" />
                <span className="text-xs font-medium text-black">+91 5555555555</span>
              </a>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <Link href="/" className="flex items-center justify-center">
              <img 
                src={logoImage}
                alt="Ramani Fashion" 
                className="h-16 md:h-18 lg:h-20 w-auto object-contain"
                data-testid="img-logo"
              />
            </Link>
          </div>

          <div className="flex items-center justify-end gap-6">
            <div className="hidden md:flex items-center relative">
              <Search className="absolute left-4 h-6 w-6 text-gray-400" />
              <Input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-6 py-3 w-80 text-base bg-gray-50 border-gray-200 rounded-full focus:bg-white transition-colors"
                data-testid="input-search"
              />
            </div>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-12 w-12 hover:bg-gray-100" data-testid="button-account">
                    <User className="h-8 w-8" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5 text-sm font-semibold">
                    {user.name}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation("/profile")} data-testid="menu-profile">
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/orders")} data-testid="menu-orders">
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/wishlist")} data-testid="menu-wishlist">
                    My Wishlist
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} data-testid="menu-logout">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="icon" className="h-12 w-12 hover:bg-gray-100" onClick={() => setLocation("/login")} data-testid="button-login">
                <User className="h-8 w-8" />
              </Button>
            )}
            
            <Button variant="ghost" size="icon" className="relative h-12 w-12 hover:bg-gray-100" onClick={() => setLocation("/wishlist")} data-testid="button-wishlist">
              <Heart className="h-8 w-8" />
              {actualWishlistCount > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  data-testid="badge-wishlist-count"
                >
                  {actualWishlistCount}
                </Badge>
              )}
            </Button>
            
            <Button variant="ghost" size="icon" className="relative h-12 w-12 hover:bg-gray-100" onClick={() => setLocation("/cart")} data-testid="button-bag">
              <ShoppingBag className="h-8 w-8" />
              {actualCartCount > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  data-testid="badge-cart-count"
                >
                  {actualCartCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      <nav className="hidden md:block bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <NavigationMenu className="mx-auto">
            <NavigationMenuList className="flex items-center justify-center gap-8 py-2">
              <NavigationMenuItem>
                <a href="/" onClick={handleHomeClick} className="nav-link px-4 py-2 tracking-wide text-base font-medium" data-testid="link-home">HOME</a>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/new-arrivals" className="nav-link px-4 py-2 tracking-wide text-base font-medium" data-testid="link-new-arrivals">NEW ARRIVALS</Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/products?isTrending=true" className="nav-link px-4 py-2 tracking-wide text-base font-medium" data-testid="link-trending-collection">TRENDING COLLECTION</Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="px-4 py-2 tracking-wide text-base font-medium bg-transparent hover:bg-transparent data-[state=open]:bg-transparent" data-testid="link-categories">
                  CATEGORIES
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-white">
                  <div className="w-[250px] p-3">
                    <ul className="grid gap-2">
                      <li>
                        <Link
                          href="/products?category=Jamdani Paithani"
                          className="block select-none border border-black p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100"
                          data-testid="category-jamdani-paithani"
                        >
                          <div className="text-sm font-medium leading-none text-black">Jamdani Paithani</div>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/products?category=Khun Irkal"
                          className="block select-none border border-black p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100"
                          data-testid="category-khun-irkal"
                        >
                          <div className="text-sm font-medium leading-none text-black">Khun / Irkal (Ilkal)</div>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/products?category=Ajrakh Modal"
                          className="block select-none border border-black p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100"
                          data-testid="category-ajrakh-modal"
                        >
                          <div className="text-sm font-medium leading-none text-black">Ajrakh Modal</div>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/products?category=Mul Mul Cotton"
                          className="block select-none border border-black p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100"
                          data-testid="category-mul-mul-cotton"
                        >
                          <div className="text-sm font-medium leading-none text-black">Mul Mul Cotton</div>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/products?category=Khadi Cotton"
                          className="block select-none border border-black p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100"
                          data-testid="category-khadi-cotton"
                        >
                          <div className="text-sm font-medium leading-none text-black">Khadi Cotton</div>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/products?category=Patch Work"
                          className="block select-none border border-black p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100"
                          data-testid="category-patch-work"
                        >
                          <div className="text-sm font-medium leading-none text-black">Patch Work</div>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/products?category=Pure Linen"
                          className="block select-none border border-black p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100"
                          data-testid="category-pure-linen"
                        >
                          <div className="text-sm font-medium leading-none text-black">Pure Linen</div>
                        </Link>
                      </li>
                    </ul>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/sale" className="nav-link text-destructive px-4 py-2 tracking-wide text-base font-medium" data-testid="link-sale">SALE</Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/about" className="nav-link px-4 py-2 tracking-wide text-base font-medium" data-testid="link-about">ABOUT US</Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <button onClick={handleContactClick} className="nav-link px-4 py-2 tracking-wide text-base font-medium bg-transparent border-0 cursor-pointer" data-testid="link-contact">CONTACT</button>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </nav>
    </header>
  );
}
