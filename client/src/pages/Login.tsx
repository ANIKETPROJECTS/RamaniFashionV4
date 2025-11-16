import { useState, useRef, useEffect } from "react";
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
import { colorPreferences } from "@/lib/colorPreferences";

export default function Login() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isRegister, setIsRegister] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    otp: "",
  });
  
  const [phoneDigits, setPhoneDigits] = useState(Array(10).fill(""));
  const [otpDigits, setOtpDigits] = useState(Array(6).fill(""));
  const phoneInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const loginMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/auth/login", "POST", data),
    onSuccess: async (data: any) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      await migrateGuestDataToServer();
      colorPreferences.migrateGuestPreferences();
      toast({ 
        title: "Welcome back!", 
        description: `Good to see you again, ${data.user.name || 'there'}!`
      });
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
      colorPreferences.migrateGuestPreferences();
      toast({ 
        title: "Your account has been created!", 
        description: `Welcome to our store, ${data.user.name}!`
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Registration failed", variant: "destructive" });
    },
  });

  const sendOtpMutation = useMutation({
    mutationFn: (phone: string) => apiRequest("/api/auth/send-otp", "POST", { phone }),
    onSuccess: (data: any) => {
      setOtpSent(true);
      toast({ 
        title: "OTP Sent!", 
        description: `OTP: ${data.otp} (For testing only)` 
      });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to send OTP", variant: "destructive" });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: (data: { phone: string; otp: string }) => apiRequest("/api/auth/verify-otp", "POST", data),
    onSuccess: () => {
      setOtpVerified(true);
      toast({ title: "OTP Verified!", description: "You can now proceed with login/registration" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Invalid OTP", variant: "destructive" });
    },
  });

  const handleSendOtp = () => {
    if (!formData.phone) {
      toast({ title: "Error", description: "Please enter your mobile number", variant: "destructive" });
      return;
    }
    sendOtpMutation.mutate(formData.phone);
  };

  const handleVerifyOtp = () => {
    if (!formData.otp) {
      toast({ title: "Error", description: "Please enter the OTP", variant: "destructive" });
      return;
    }
    verifyOtpMutation.mutate({ phone: formData.phone, otp: formData.otp });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isAdminLogin) {
      adminLoginMutation.mutate({ username: formData.email, password: formData.password });
      return;
    }

    if (!otpVerified && !isAdminLogin) {
      toast({ title: "Error", description: "Please verify your mobile number first", variant: "destructive" });
      return;
    }

    if (isRegister) {
      registerMutation.mutate(formData);
    } else {
      loginMutation.mutate({ email: formData.email, password: formData.password });
    }
  };

  const resetOtpState = () => {
    setOtpSent(false);
    setOtpVerified(false);
    setFormData({ ...formData, otp: "" });
    setOtpDigits(Array(6).fill(""));
  };

  const handlePhoneDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newDigits = [...phoneDigits];
    newDigits[index] = value.slice(-1);
    setPhoneDigits(newDigits);
    
    const phone = newDigits.join("");
    setFormData({ ...formData, phone });
    
    if (value && index < 9) {
      phoneInputRefs.current[index + 1]?.focus();
    }
    
    if (!value && phone.length < 10) {
      setOtpSent(false);
      setOtpVerified(false);
    }
  };

  const handlePhoneKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !phoneDigits[index] && index > 0) {
      phoneInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    
    const otp = newDigits.join("");
    setFormData({ ...formData, otp });
    
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  useEffect(() => {
    const phone = phoneDigits.join("");
    setFormData(prev => ({ ...prev, phone }));
  }, [phoneDigits]);

  useEffect(() => {
    const otp = otpDigits.join("");
    setFormData(prev => ({ ...prev, otp }));
  }, [otpDigits]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
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

              {!isAdminLogin && (
                <div>
                  <Label className="text-sm mb-2 block">Mobile Number</Label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 flex-nowrap">
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-lg">🇮🇳</span>
                        <span className="font-semibold text-sm">+91</span>
                      </div>
                      <div className="flex gap-1.5 flex-nowrap">
                        {phoneDigits.map((digit, index) => (
                          <input
                            key={index}
                            ref={(el) => (phoneInputRefs.current[index] = el)}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handlePhoneDigitChange(index, e.target.value)}
                            onKeyDown={(e) => handlePhoneKeyDown(index, e)}
                            disabled={otpVerified}
                            className="w-10 h-11 text-center text-base font-semibold border-2 border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                            data-testid={`input-phone-${index}`}
                          />
                        ))}
                      </div>
                    </div>
                    {!otpVerified && (
                      <Button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={sendOtpMutation.isPending || formData.phone.length !== 10}
                        className="w-auto px-8 rounded-full h-10 text-sm font-medium mx-auto block"
                        data-testid="button-send-otp"
                      >
                        {otpSent ? "Resend OTP" : "Send OTP"}
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {!isAdminLogin && otpSent && !otpVerified && (
                <div>
                  <Label className="text-sm mb-2 block">Enter OTP</Label>
                  <div className="space-y-3">
                    <div className="flex justify-center gap-2">
                      {otpDigits.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => (otpInputRefs.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-12 h-14 text-center text-xl font-bold border-2 border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary"
                          data-testid={`input-otp-${index}`}
                        />
                      ))}
                    </div>
                    <Button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={verifyOtpMutation.isPending || formData.otp.length !== 6}
                      className="w-auto px-8 rounded-full h-10 text-sm font-medium mx-auto block"
                      data-testid="button-verify-otp"
                    >
                      Verify OTP
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Test OTP: 123456
                    </p>
                  </div>
                </div>
              )}

              {!isAdminLogin && otpVerified && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                  <p className="text-sm text-green-700 dark:text-green-400 flex items-center justify-center gap-2 font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Mobile number verified successfully
                  </p>
                </div>
              )}

              {isAdminLogin && (
                <>
                  <div>
                    <Label htmlFor="email">Admin Username</Label>
                    <Input
                      id="email"
                      type="text"
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
                </>
              )}

              {!isAdminLogin && otpVerified && (
                <Button
                  type="submit"
                  className="w-full rounded-full h-11 text-base font-semibold"
                  disabled={loginMutation.isPending || registerMutation.isPending}
                  data-testid="button-submit"
                >
                  {isRegister ? "Sign Up" : "Sign In"}
                </Button>
              )}

              {isAdminLogin && (
                <Button
                  type="submit"
                  className="w-full rounded-full h-11 text-base font-semibold"
                  disabled={adminLoginMutation.isPending}
                  data-testid="button-submit"
                >
                  Admin Sign In
                </Button>
              )}

              {!isAdminLogin && (
                <div className="text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    className="rounded-full"
                    onClick={() => {
                      setIsRegister(!isRegister);
                      resetOtpState();
                      setPhoneDigits(Array(10).fill(""));
                      setOtpDigits(Array(6).fill(""));
                    }}
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
                    setFormData({ name: "", email: "", password: "", phone: "", otp: "" });
                    resetOtpState();
                    setPhoneDigits(Array(10).fill(""));
                    setOtpDigits(Array(6).fill(""));
                  }}
                  data-testid="button-admin-toggle"
                  className="w-full rounded-full"
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
