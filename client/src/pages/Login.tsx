import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { migrateGuestDataToServer } from "@/lib/migrateGuestData";

export default function Login() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isRegister, setIsRegister] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const loginMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/auth/login", "POST", data),
    onSuccess: async (data: any) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      await migrateGuestDataToServer();
      toast({ title: "Login successful!" });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Invalid credentials", variant: "destructive" });
    },
  });

  const adminLoginMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/admin/login", "POST", data),
    onSuccess: (data: any) => {
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("admin", JSON.stringify(data.admin));
      toast({ title: "Admin login successful!" });
      setLocation("/admin/dashboard");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Invalid admin credentials", variant: "destructive" });
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/auth/register", "POST", data),
    onSuccess: async (data: any) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      await migrateGuestDataToServer();
      toast({ title: "Registration successful!" });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Registration failed", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdminLogin) {
      adminLoginMutation.mutate({ username: formData.email, password: formData.password });
    } else if (isRegister) {
      registerMutation.mutate(formData);
    } else {
      loginMutation.mutate({ email: formData.email, password: formData.password });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-md mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>
              {isAdminLogin ? "Admin Login" : (isRegister ? "Create Account" : "Welcome Back")}
            </CardTitle>
            <CardDescription>
              {isAdminLogin 
                ? "Sign in to access the admin panel" 
                : (isRegister ? "Sign up to start shopping" : "Sign in to your account")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isAdminLogin && isRegister && (
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    data-testid="input-name"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="email">{isAdminLogin ? "Admin Username" : "Email"}</Label>
                <Input
                  id="email"
                  type={isAdminLogin ? "text" : "email"}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  data-testid="input-email"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  data-testid="input-password"
                />
              </div>

              {!isAdminLogin && isRegister && (
                <div>
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    data-testid="input-phone"
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending || registerMutation.isPending || adminLoginMutation.isPending}
                data-testid="button-submit"
              >
                {isAdminLogin ? "Admin Sign In" : (isRegister ? "Sign Up" : "Sign In")}
              </Button>

              {!isAdminLogin && (
                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setIsRegister(!isRegister)}
                    data-testid="button-toggle-mode"
                  >
                    {isRegister ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                  </Button>
                </div>
              )}

              <div className="text-center pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAdminLogin(!isAdminLogin);
                    setIsRegister(false);
                    setFormData({ name: "", email: "", password: "", phone: "" });
                  }}
                  data-testid="button-admin-toggle"
                  className="w-full"
                >
                  {isAdminLogin ? "Back to User Login" : "Login as Admin"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
