import { useRef, useState, useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Music, LogOut, LogIn, LayoutGrid, Home, Menu, X } from 'lucide-react';
import { useIconDance } from '../hooks/useIconDance';
import { JumpingProfilePhoto } from './JumpingProfilePhoto';
import type { AppView } from '../App';

interface HeaderProps {
  onNavigate?: (view: AppView) => void;
  currentView?: AppView;
}

export function Header({ onNavigate, currentView }: HeaderProps) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const handleDance = useIconDance();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoAnimated, setLogoAnimated] = useState(false);

  const logoIconRef = useRef<SVGSVGElement>(null);
  const authIconRef = useRef<SVGSVGElement>(null);

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';

  useEffect(() => {
    const timer = setTimeout(() => setLogoAnimated(true), 400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const isMiniAppView =
    currentView === 'hub' ||
    currentView === 'chess' ||
    currentView === 'my-photo' ||
    currentView === 'piano' ||
    currentView === 'depression-relief';

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-background/90 backdrop-blur-xl shadow-lg border-b border-border/50'
          : 'bg-background/70 backdrop-blur-md border-b border-border/30'
      }`}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Logo */}
        <div
          className={`flex items-center gap-3 cursor-pointer select-none group ${
            logoAnimated ? 'animate-pulse-glow' : ''
          } rounded-xl px-2 py-1`}
          style={{ animationDuration: '3s' }}
          onClick={(e) => {
            handleDance(e);
            onNavigate?.('home');
          }}
          onTouchStart={(e) => handleDance(e as unknown as React.TouchEvent)}
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
            <h1 className="text-lg font-bold gradient-text">Gesture Piano</h1>
            <span className="block text-xs text-muted-foreground -mt-1 font-medium">AI Powered</span>
          </div>
        </div>

        {/* Jumping profile photo — centered */}
        <div className="flex-1 flex justify-center">
          <JumpingProfilePhoto />
        </div>

        {/* Right side: nav + auth */}
        <div className="flex items-center gap-2">
          {/* Desktop nav links */}
          {isAuthenticated && onNavigate && (
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => onNavigate('home')}
                className={`nav-underline flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 relative group ${
                  currentView === 'home'
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                <Home className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                Home
                {currentView === 'home' && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-primary to-primary/50 rounded-full animate-slide-up-fade" />
                )}
              </button>
              <button
                onClick={() => onNavigate('hub')}
                className={`nav-underline flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 relative group ${
                  isMiniAppView
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                <LayoutGrid className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                Mini Apps
                {isMiniAppView && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-primary to-primary/50 rounded-full animate-slide-up-fade" />
                )}
              </button>
            </nav>
          )}

          {/* Mobile menu toggle */}
          {isAuthenticated && onNavigate && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-muted/60 transition-all duration-200"
            >
              <div className={`transition-transform duration-300 ${menuOpen ? 'rotate-90' : 'rotate-0'}`}>
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </div>
            </button>
          )}

          <Button
            onClick={(e) => {
              handleDance(e);
              handleAuth();
            }}
            onTouchStart={(e) => handleDance(e as unknown as React.TouchEvent)}
            disabled={disabled}
            variant={isAuthenticated ? 'outline' : 'default'}
            className={`transition-all duration-300 ${
              isAuthenticated
                ? 'hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30'
                : 'bg-gradient-to-r from-primary to-primary/80 hover:opacity-90'
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

      {/* Mobile dropdown menu */}
      {isAuthenticated && onNavigate && (
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            menuOpen ? 'max-h-40 opacity-100 pb-3' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="flex flex-col gap-1 px-4 pt-2 border-t border-border/50">
            <button
              onClick={() => { onNavigate('home'); setMenuOpen(false); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 animate-slide-up-fade stagger-1 ${
                currentView === 'home'
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <Home className="w-4 h-4" />
              Home
            </button>
            <button
              onClick={() => { onNavigate('hub'); setMenuOpen(false); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 animate-slide-up-fade stagger-2 ${
                isMiniAppView
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Mini Apps
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
