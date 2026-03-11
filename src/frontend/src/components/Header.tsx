import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { LogIn, LogOut, Music } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useIconDance } from "../hooks/useIconDance";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { JumpingProfilePhoto } from "./JumpingProfilePhoto";

export function Header() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const handleDance = useIconDance();
  const [scrolled, setScrolled] = useState(false);
  const [logoAnimated, setLogoAnimated] = useState(false);

  const logoIconRef = useRef<SVGSVGElement>(null);
  const authIconRef = useRef<SVGSVGElement>(null);

  const isAuthenticated = !!identity;
  const disabled = loginStatus === "logging-in";

  useEffect(() => {
    const timer = setTimeout(() => setLogoAnimated(true), 400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error("Login error:", error);
        if (error.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/90 backdrop-blur-xl shadow-lg border-b border-border/50"
          : "bg-background/70 backdrop-blur-md border-b border-border/30"
      }`}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Logo */}
        <button
          type="button"
          className={`flex items-center gap-3 cursor-pointer select-none group ${
            logoAnimated ? "animate-pulse-glow" : ""
          } rounded-xl px-2 py-1 bg-transparent border-0`}
          style={{ animationDuration: "3s" }}
          onClick={(e) => handleDance(e)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleDance(e as any);
          }}
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Music
                ref={logoIconRef}
                className="w-5 h-5 text-primary-foreground"
              />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 animate-heartbeat" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold gradient-text">Car Price AI</h1>
            <span className="block text-xs text-muted-foreground -mt-1 font-medium">
              ML Powered
            </span>
          </div>
        </button>

        {/* Jumping profile photo — centered */}
        <div className="flex-1 flex justify-center">
          <JumpingProfilePhoto />
        </div>

        {/* Auth button */}
        <div className="flex items-center gap-2">
          <Button
            data-ocid="header.button"
            onClick={(e) => {
              handleDance(e);
              handleAuth();
            }}
            onTouchStart={(e) => handleDance(e as unknown as React.TouchEvent)}
            disabled={disabled}
            variant={isAuthenticated ? "outline" : "default"}
            className={`transition-all duration-300 ${
              isAuthenticated
                ? "hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                : "bg-gradient-to-r from-primary to-primary/80 hover:opacity-90"
            }`}
          >
            {disabled ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                Loading...
              </span>
            ) : isAuthenticated ? (
              <>
                <LogOut ref={authIconRef} className="w-4 h-4 mr-2" />
                Logout
              </>
            ) : (
              <>
                <LogIn ref={authIconRef} className="w-4 h-4 mr-2" />
                Login
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
