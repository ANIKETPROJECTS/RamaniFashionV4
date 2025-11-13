import { createContext, useContext, useState, ReactNode } from "react";

interface AuthUIContextType {
  isLoginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
}

const AuthUIContext = createContext<AuthUIContextType | undefined>(undefined);

export function AuthUIProvider({ children }: { children: ReactNode }) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const openLogin = () => setIsLoginOpen(true);
  const closeLogin = () => setIsLoginOpen(false);

  return (
    <AuthUIContext.Provider value={{ isLoginOpen, openLogin, closeLogin }}>
      {children}
    </AuthUIContext.Provider>
  );
}

export function useAuthUI() {
  const context = useContext(AuthUIContext);
  if (context === undefined) {
    throw new Error("useAuthUI must be used within an AuthUIProvider");
  }
  return context;
}
