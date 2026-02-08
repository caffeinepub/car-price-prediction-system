import { useState, useEffect } from 'react';
import { Menu, X, LogOut, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserProfile } from '../hooks/useQueries';

interface HeaderProps {
  onPredictionClick: () => void;
}

export function Header({ onPredictionClick }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { identity, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/95 backdrop-blur-md shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img
              src="/assets/generated/ml-car-prediction.dim_800x400.jpg"
              alt="Car Price Prediction Logo"
              className="h-12 w-24 object-contain"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Car Price Predictor
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {isAuthenticated && (
              <>
                <button
                  onClick={() => scrollToSection('home')}
                  className="text-foreground hover:text-primary transition-colors font-medium"
                >
                  Home
                </button>
                <button
                  onClick={() => scrollToSection('about')}
                  className="text-foreground hover:text-primary transition-colors font-medium"
                >
                  About
                </button>
                <Button
                  onClick={onPredictionClick}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Calculator className="w-4 h-4" />
                  Predict Price
                </Button>
                <div className="flex items-center gap-3 pl-4 border-l border-border">
                  <span className="text-sm text-muted-foreground">
                    {userProfile?.name || 'User'}
                  </span>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    disabled={loginStatus === 'logging-in'}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </div>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && isAuthenticated && (
          <nav className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              <button
                onClick={() => scrollToSection('home')}
                className="text-foreground hover:text-primary transition-colors font-medium text-left"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="text-foreground hover:text-primary transition-colors font-medium text-left"
              >
                About
              </button>
              <button
                onClick={() => {
                  onPredictionClick();
                  setIsMobileMenuOpen(false);
                }}
                className="text-foreground hover:text-primary transition-colors font-medium text-left flex items-center gap-2"
              >
                <Calculator className="w-4 h-4" />
                Predict Price
              </button>
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">
                  {userProfile?.name || 'User'}
                </p>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  disabled={loginStatus === 'logging-in'}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
