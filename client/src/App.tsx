import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Login from "@/pages/Login";
import Admin from "@/pages/Admin";
import Occasions from "@/pages/Occasions";
import Collections from "@/pages/Collections";
import AboutUs from "@/pages/AboutUs";
import Sale from "@/pages/Sale";
import NewArrivals from "@/pages/NewArrivals";
import Profile from "@/pages/Profile";
import Orders from "@/pages/Orders";
import Wishlist from "@/pages/Wishlist";
import NotFound from "@/pages/not-found";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import ProductManagement from "@/pages/admin/ProductManagement";
import InventoryManagement from "@/pages/admin/InventoryManagement";
import Analytics from "@/pages/admin/Analytics";
import Settings from "@/pages/admin/Settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/login" component={Login} />
      <Route path="/categories" component={Products} />
      <Route path="/new-arrivals" component={NewArrivals} />
      <Route path="/occasions" component={Occasions} />
      <Route path="/collections" component={Collections} />
      <Route path="/about" component={AboutUs} />
      <Route path="/sale" component={Sale} />
      <Route path="/profile" component={Profile} />
      <Route path="/orders" component={Orders} />
      <Route path="/wishlist" component={Wishlist} />
      <Route path="/admin" component={Admin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/products" component={ProductManagement} />
      <Route path="/admin/inventory" component={InventoryManagement} />
      <Route path="/admin/analytics" component={Analytics} />
      <Route path="/admin/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
