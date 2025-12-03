import { ShoppingBag, Heart, User, Search, Menu, LogOut, ChevronDown, ChevronRight, Loader2, X } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import instagramIcon from "@assets/instagram_1762445939344.png";
import facebookIcon from "@assets/communication_1762445935759.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef, useCallback, type MouseEvent } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { LoginDialog } from "@/components/LoginDialog";
import { auth } from "@/lib/auth";
import { useAuthUI } from "@/contexts/AuthUIContext";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import logoImage from "@assets/PNG__B_ LOGO_1762442171742.png";
import paithaniImage from "@/assets/paithani.png";
import khunIrkalImage from "@/assets/khun-irkal.png";
import ajrakhModalImage from "@/assets/ajrakh-modal.png";
import mulCottonImage from "@/assets/mul-cotton.png";
import khadiCottonImage from "@/assets/khadi-cotton.png";
import patchWorkImage from "@/assets/patch-work.png";
import pureLinenImage from "@/assets/pure-linen.png";

interface HeaderProps {
  cartCount?: number;
  wishlistCount?: number;
  onMenuClick?: () => void;
}

interface SearchProduct {
  _id: string;
  baseProductId: string;
  name: string;
  variantName?: string;
  price: number;
  originalPrice?: number;
  category: string;
  onSale?: boolean;
  displayColor?: string;
  displayImage: string;
}

export default function Header({ cartCount = 0, wishlistCount = 0, onMenuClick }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [storageUpdateTrigger, setStorageUpdateTrigger] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const { isLoginOpen, openLogin, closeLogin } = useAuthUI();
  
  // Search dropdown state
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search function
  const performSearch = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=8`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.products || []);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle search input change with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowDropdown(true);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  // Handle search input focus
  const handleSearchFocus = () => {
    setShowDropdown(true);
    if (searchQuery.trim().length >= 2 && searchResults.length === 0) {
      performSearch(searchQuery);
    }
  };

  // Handle product click from search results
  const handleProductClick = (productId: string) => {
    setShowDropdown(false);
    setSearchQuery("");
    setSearchResults([]);
    setLocation(`/product/${productId}`);
  };

  // Handle search submit (Enter key or search all)
  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
      setLocation(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Parse URL to determine active navigation state
  const getActiveNavState = () => {
    try {
      const url = new URL(window.location.href);
      const pathname = url.pathname;
      const searchParams = url.searchParams;
      const hash = url.hash;
      
      const hasCategory = pathname === "/products" && searchParams.has("category");
      const isOnContactSection = pathname === "/" && hash === "#contact";
      
      return {
        isHome: pathname === "/" && hash !== "#contact",
        isNewArrivals: pathname === "/new-arrivals",
        isTrending: pathname === "/trending-collection",
        isCategories: pathname === "/products" && (hasCategory || pathname === "/products"),
        isSale: pathname === "/sale",
        isAbout: pathname === "/about",
        isContact: isOnContactSection
      };
    } catch {
      // Fallback for environments without window
      return {
        isHome: location === "/" && !location.includes("#contact"),
        isNewArrivals: location === "/new-arrivals",
        isTrending: location === "/trending-collection",
        isCategories: location.includes("/products"),
        isSale: location === "/sale",
        isAbout: location === "/about",
        isContact: location.includes("#contact")
      };
    }
  };

  const navState = getActiveNavState();

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
    // Check for both old "user" format and new "customer" format
    const loadUser = () => {
      const storedUser = localStorage.getItem("user");
      const customer = auth.getCustomer();
      
      if (customer) {
        setUser(customer);
      } else if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    };

    loadUser();

    // Listen for cart/wishlist updates in localStorage
    const handleStorageChange = () => {
      setStorageUpdateTrigger(prev => prev + 1);
    };

    // Listen for auth changes
    const unsubscribe = auth.onAuthChange(loadUser);

    // Listen for custom events (when localStorage is updated programmatically in the same window)
    window.addEventListener('cartUpdated', handleStorageChange);
    window.addEventListener('wishlistUpdated', handleStorageChange);
    
    // Cleanup
    return () => {
      unsubscribe();
      window.removeEventListener('cartUpdated', handleStorageChange);
      window.removeEventListener('wishlistUpdated', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    // Use auth utility to clear all auth data
    auth.logout();
    localStorage.removeItem("user");
    setUser(null);
    // Clear cart and other user-specific query caches
    queryClient.removeQueries({ queryKey: ["/api/cart"] });
    queryClient.removeQueries({ queryKey: ["/api/wishlist"] });
    queryClient.removeQueries({ queryKey: ["/api/addresses"] });
    queryClient.removeQueries({ queryKey: ["/api/orders"] });
    setLocation("/");
  };

  const handleContactClick = (e?: MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
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
              onClick={() => setMobileMenuOpen(true)}
              data-testid="button-menu"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="hidden md:flex items-start gap-8">
              <a 
                href="https://www.instagram.com/ramanifashionindia/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity group"
                data-testid="link-instagram"
              >
                <img src={instagramIcon} alt="Instagram" className="h-6 w-6" />
                <span className="text-xs font-medium text-black">@ramanifashionindia</span>
              </a>
              <a 
                href="https://www.facebook.com/186191114586811" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity group"
                data-testid="link-facebook"
              >
                <img src={facebookIcon} alt="Facebook" className="h-6 w-6" />
                <span className="text-xs font-medium text-black">Ramani Fashion</span>
              </a>
              <a 
                href="https://chat.whatsapp.com/GqIsU9ZF2SJ9buuSKxGFWB" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity group"
                data-testid="link-whatsapp"
              >
                <SiWhatsapp className="h-6 w-6 text-green-600" />
                <span className="text-xs font-medium text-black">WhatsApp Group</span>
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
            <div ref={searchRef} className="hidden md:flex items-center relative">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={handleSearchFocus}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                  className="pl-11 pr-10 py-2.5 w-80 text-base bg-gray-50 border-gray-200 rounded-full focus:bg-white transition-colors"
                  data-testid="input-search"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSearchResults([]);
                      setShowDropdown(false);
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    data-testid="button-clear-search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </form>

              {/* Search Dropdown */}
              {showDropdown && (searchQuery.trim().length >= 2 || isSearching) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
                  {isSearching ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <>
                      <ScrollArea className="max-h-[400px]">
                        <div className="py-2">
                          {searchResults.map((product) => (
                            <button
                              key={product._id}
                              onClick={() => handleProductClick(product._id)}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                              data-testid={`search-result-${product._id}`}
                            >
                              <div className="w-14 h-14 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                                <img
                                  src={product.displayImage || "/default-saree.jpg"}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.currentTarget.src = '/default-saree.jpg'; }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 line-clamp-2">
                                  {product.name}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {product.category}
                                  {product.displayColor && ` - ${product.displayColor}`}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-sm font-semibold text-primary">
                                    Rs. {product.price.toLocaleString('en-IN')}
                                  </span>
                                  {product.originalPrice && product.originalPrice > product.price && (
                                    <span className="text-xs text-muted-foreground line-through">
                                      Rs. {product.originalPrice.toLocaleString('en-IN')}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </ScrollArea>
                    </>
                  ) : searchQuery.trim().length >= 2 ? (
                    <div className="py-8 px-4 text-center">
                      <Search className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No products found for "{searchQuery}"
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Try a different search term
                      </p>
                    </div>
                  ) : null}
                </div>
              )}
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
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-12 w-12 hover:bg-gray-100" 
                onClick={openLogin} 
                data-testid="button-login"
              >
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

      <nav className="hidden md:block bg-white relative">
        <div className="w-full">
          <NavigationMenu className="max-w-7xl mx-auto">
            <NavigationMenuList className="flex items-center justify-center gap-8 py-2 w-full">
              <NavigationMenuItem>
                <a 
                  href="/" 
                  onClick={handleHomeClick} 
                  className={`nav-link px-4 py-2 tracking-wide text-base font-medium ${navState.isHome ? "active text-primary" : ""}`} 
                  data-testid="link-home"
                >
                  HOME
                </a>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link 
                  href="/new-arrivals" 
                  className={`nav-link px-4 py-2 tracking-wide text-base font-medium ${navState.isNewArrivals ? "active text-primary" : ""}`} 
                  data-testid="link-new-arrivals"
                >
                  NEW ARRIVALS
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link 
                  href="/trending-collection" 
                  className={`nav-link px-4 py-2 tracking-wide text-base font-medium ${navState.isTrending ? "active text-primary" : ""}`} 
                  data-testid="link-trending-collection"
                >
                  TRENDING COLLECTION
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger 
                  className={`px-4 py-2 tracking-wide text-base font-medium bg-transparent hover:bg-transparent data-[state=open]:bg-transparent ${navState.isCategories ? "nav-link active text-primary" : ""}`} 
                  data-testid="link-categories"
                >
                  CATEGORIES
                </NavigationMenuTrigger>
                <NavigationMenuContent className="left-1/2 right-auto -translate-x-1/2 w-full max-w-7xl bg-transparent shadow-none border-0">
                  <div className="w-full px-6 md:px-12 py-6">
                    <div className="flex flex-nowrap gap-3 md:gap-4 lg:gap-5 justify-center items-start mx-auto">
                      <Link
                        href="/products?category=Jamdani Paithani"
                        className="group flex flex-col items-center flex-shrink-0 w-24 sm:w-28 md:w-32 lg:w-36 xl:w-40"
                        data-testid="category-jamdani-paithani"
                      >
                        <div className="relative w-full aspect-[2/3] overflow-hidden rounded-lg border-2 border-transparent group-hover:border-pink-500 transition-all duration-300 shadow-md group-hover:shadow-xl">
                          <img
                            src={paithaniImage}
                            alt="Jamdani Paithani"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div className="mt-2 md:mt-3 text-center">
                          <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-white bg-pink-500 px-2 sm:px-3 md:px-4 py-1 md:py-1.5 rounded-full inline-block whitespace-nowrap">
                            Jamdani Paithani
                          </span>
                        </div>
                      </Link>

                      <Link
                        href="/products?category=Khun Irkal"
                        className="group flex flex-col items-center flex-shrink-0 w-24 sm:w-28 md:w-32 lg:w-36 xl:w-40"
                        data-testid="category-khun-irkal"
                      >
                        <div className="relative w-full aspect-[2/3] overflow-hidden rounded-lg border-2 border-transparent group-hover:border-pink-500 transition-all duration-300 shadow-md group-hover:shadow-xl">
                          <img
                            src={khunIrkalImage}
                            alt="Khun / Irkal (Ilkal)"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div className="mt-2 md:mt-3 text-center">
                          <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-white bg-pink-500 px-2 sm:px-3 md:px-4 py-1 md:py-1.5 rounded-full inline-block whitespace-nowrap">
                            Khun / Irkal (Ilkal)
                          </span>
                        </div>
                      </Link>

                      <Link
                        href="/products?category=Ajrakh Modal"
                        className="group flex flex-col items-center flex-shrink-0 w-24 sm:w-28 md:w-32 lg:w-36 xl:w-40"
                        data-testid="category-ajrakh-modal"
                      >
                        <div className="relative w-full aspect-[2/3] overflow-hidden rounded-lg border-2 border-transparent group-hover:border-pink-500 transition-all duration-300 shadow-md group-hover:shadow-xl">
                          <img
                            src={ajrakhModalImage}
                            alt="Ajrakh Modal"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div className="mt-2 md:mt-3 text-center">
                          <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-white bg-pink-500 px-2 sm:px-3 md:px-4 py-1 md:py-1.5 rounded-full inline-block whitespace-nowrap">
                            Ajrakh Modal
                          </span>
                        </div>
                      </Link>

                      <Link
                        href="/products?category=Mul Mul Cotton"
                        className="group flex flex-col items-center flex-shrink-0 w-24 sm:w-28 md:w-32 lg:w-36 xl:w-40"
                        data-testid="category-mul-mul-cotton"
                      >
                        <div className="relative w-full aspect-[2/3] overflow-hidden rounded-lg border-2 border-transparent group-hover:border-pink-500 transition-all duration-300 shadow-md group-hover:shadow-xl">
                          <img
                            src={mulCottonImage}
                            alt="Mul Mul Cotton"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div className="mt-2 md:mt-3 text-center">
                          <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-white bg-pink-500 px-2 sm:px-3 md:px-4 py-1 md:py-1.5 rounded-full inline-block whitespace-nowrap">
                            Mul Mul Cotton
                          </span>
                        </div>
                      </Link>

                      <Link
                        href="/products?category=Khadi Cotton"
                        className="group flex flex-col items-center flex-shrink-0 w-24 sm:w-28 md:w-32 lg:w-36 xl:w-40"
                        data-testid="category-khadi-cotton"
                      >
                        <div className="relative w-full aspect-[2/3] overflow-hidden rounded-lg border-2 border-transparent group-hover:border-pink-500 transition-all duration-300 shadow-md group-hover:shadow-xl">
                          <img
                            src={khadiCottonImage}
                            alt="Khadi Cotton"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div className="mt-2 md:mt-3 text-center">
                          <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-white bg-pink-500 px-2 sm:px-3 md:px-4 py-1 md:py-1.5 rounded-full inline-block whitespace-nowrap">
                            Khadi Cotton
                          </span>
                        </div>
                      </Link>

                      <Link
                        href="/products?category=Patch Work"
                        className="group flex flex-col items-center flex-shrink-0 w-24 sm:w-28 md:w-32 lg:w-36 xl:w-40"
                        data-testid="category-patch-work"
                      >
                        <div className="relative w-full aspect-[2/3] overflow-hidden rounded-lg border-2 border-transparent group-hover:border-pink-500 transition-all duration-300 shadow-md group-hover:shadow-xl">
                          <img
                            src={patchWorkImage}
                            alt="Patch Work"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div className="mt-2 md:mt-3 text-center">
                          <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-white bg-pink-500 px-2 sm:px-3 md:px-4 py-1 md:py-1.5 rounded-full inline-block whitespace-nowrap">
                            Patch Work
                          </span>
                        </div>
                      </Link>

                      <Link
                        href="/products?category=Pure Linen"
                        className="group flex flex-col items-center flex-shrink-0 w-24 sm:w-28 md:w-32 lg:w-36 xl:w-40"
                        data-testid="category-pure-linen"
                      >
                        <div className="relative w-full aspect-[2/3] overflow-hidden rounded-lg border-2 border-transparent group-hover:border-pink-500 transition-all duration-300 shadow-md group-hover:shadow-xl">
                          <img
                            src={pureLinenImage}
                            alt="Pure Linen"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div className="mt-2 md:mt-3 text-center">
                          <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-white bg-pink-500 px-2 sm:px-3 md:px-4 py-1 md:py-1.5 rounded-full inline-block whitespace-nowrap">
                            Pure Linen
                          </span>
                        </div>
                      </Link>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link 
                  href="/sale" 
                  className={`nav-link px-4 py-2 tracking-wide text-base font-medium ${navState.isSale ? "active text-primary" : ""}`} 
                  data-testid="link-sale"
                >
                  SALE
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link 
                  href="/about" 
                  className={`nav-link px-4 py-2 tracking-wide text-base font-medium ${navState.isAbout ? "active text-primary" : ""}`} 
                  data-testid="link-about"
                >
                  ABOUT US
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <button 
                  onClick={handleContactClick} 
                  className={`nav-link px-4 py-2 tracking-wide text-base font-medium bg-transparent border-0 cursor-pointer ${navState.isContact ? "active text-primary" : ""}`}
                  data-testid="link-contact"
                >
                  CONTACT
                </button>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle className="text-xl font-bold">Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col h-[calc(100vh-80px)] overflow-y-auto">
            <div className="flex flex-col gap-1 p-3">
              <Link
                href="/"
                className={`text-base font-medium py-3 px-4 rounded-md hover-elevate transition-colors ${navState.isHome ? "bg-primary/10 text-primary" : "text-foreground"}`}
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-link-home"
              >
                HOME
              </Link>
              <Link
                href="/new-arrivals"
                className={`text-base font-medium py-3 px-4 rounded-md hover-elevate transition-colors ${navState.isNewArrivals ? "bg-primary/10 text-primary" : "text-foreground"}`}
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-link-new-arrivals"
              >
                NEW ARRIVALS
              </Link>
              <Link
                href="/trending-collection"
                className={`text-base font-medium py-3 px-4 rounded-md hover-elevate transition-colors ${navState.isTrending ? "bg-primary/10 text-primary" : "text-foreground"}`}
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-link-trending"
              >
                TRENDING COLLECTION
              </Link>
            </div>
            
            <div className="border-t">
              <Collapsible open={categoriesOpen} onOpenChange={setCategoriesOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full py-3 px-4 text-base font-medium hover-elevate transition-colors group">
                  <span className="text-foreground">CATEGORIES</span>
                  <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform ${categoriesOpen ? "rotate-90" : ""}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pb-2">
                  <div className="flex flex-col gap-1 pl-4 pr-3">
                    <Link
                      href="/products?category=Jamdani Paithani"
                      className="text-sm py-2.5 px-4 block rounded-md hover-elevate transition-colors text-muted-foreground hover:text-foreground"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="mobile-category-jamdani"
                    >
                      Jamdani Paithani
                    </Link>
                    <Link
                      href="/products?category=Khun Irkal"
                      className="text-sm py-2.5 px-4 block rounded-md hover-elevate transition-colors text-muted-foreground hover:text-foreground"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="mobile-category-khun"
                    >
                      Khun / Irkal (Ilkal)
                    </Link>
                    <Link
                      href="/products?category=Ajrakh Modal"
                      className="text-sm py-2.5 px-4 block rounded-md hover-elevate transition-colors text-muted-foreground hover:text-foreground"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="mobile-category-ajrakh"
                    >
                      Ajrakh Modal
                    </Link>
                    <Link
                      href="/products?category=Mul Mul Cotton"
                      className="text-sm py-2.5 px-4 block rounded-md hover-elevate transition-colors text-muted-foreground hover:text-foreground"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="mobile-category-mul"
                    >
                      Mul Mul Cotton
                    </Link>
                    <Link
                      href="/products?category=Khadi Cotton"
                      className="text-sm py-2.5 px-4 block rounded-md hover-elevate transition-colors text-muted-foreground hover:text-foreground"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="mobile-category-khadi"
                    >
                      Khadi Cotton
                    </Link>
                    <Link
                      href="/products?category=Patch Work"
                      className="text-sm py-2.5 px-4 block rounded-md hover-elevate transition-colors text-muted-foreground hover:text-foreground"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="mobile-category-patch"
                    >
                      Patch Work
                    </Link>
                    <Link
                      href="/products?category=Pure Linen"
                      className="text-sm py-2.5 px-4 block rounded-md hover-elevate transition-colors text-muted-foreground hover:text-foreground"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="mobile-category-linen"
                    >
                      Pure Linen
                    </Link>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            <div className="border-t flex flex-col gap-1 p-3">
              <Link
                href="/sale"
                className={`text-base font-medium py-3 px-4 block rounded-md hover-elevate transition-colors ${navState.isSale ? "bg-primary/10 text-primary" : "text-foreground"}`}
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-link-sale"
              >
                SALE
              </Link>
              <Link
                href="/about"
                className={`text-base font-medium py-3 px-4 block rounded-md hover-elevate transition-colors ${navState.isAbout ? "bg-primary/10 text-primary" : "text-foreground"}`}
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-link-about"
              >
                ABOUT US
              </Link>
              <button
                onClick={() => {
                  handleContactClick();
                  setMobileMenuOpen(false);
                }}
                className={`text-base font-medium py-3 px-4 block rounded-md hover-elevate text-left w-full transition-colors ${navState.isContact ? "bg-primary/10 text-primary" : "text-foreground"}`}
                data-testid="mobile-link-contact"
              >
                CONTACT
              </button>
            </div>
          </nav>
        </SheetContent>
      </Sheet>

      <LoginDialog open={isLoginOpen} onOpenChange={closeLogin} />
    </header>
  );
}
