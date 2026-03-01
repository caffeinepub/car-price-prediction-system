import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { Toaster } from '@/components/ui/sonner';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { ProfileSetup } from './components/ProfileSetup';
import { PredictionForm } from './components/PredictionForm';
import { PredictionHistory } from './components/PredictionHistory';
import { MouseWaveEffect } from './components/MouseWaveEffect';
import { Hub } from './components/Hub';
import { ChessGame } from './components/ChessGame';
import { MyPhoto } from './components/MyPhoto';
import { PianoPage } from './components/PianoPage';
import { DepressionRelief } from './components/DepressionRelief';
import AttendanceMonitor from './components/AttendanceMonitor';
import { ThemeProvider } from 'next-themes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

export type AppView = 'home' | 'hub' | 'chess' | 'my-photo' | 'piano' | 'depression-relief' | 'attendance';

function AppContent() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const [showPredictionForm, setShowPredictionForm] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();

  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const navigateTo = (view: AppView) => {
    if (view === currentView) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentView(view);
      setIsTransitioning(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 200);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
            <div
              className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent"
              style={{ animation: 'spin-smooth 0.8s linear infinite' }}
            />
          </div>
          <p className="text-muted-foreground animate-pulse font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <MouseWaveEffect />
        <Header onNavigate={navigateTo} currentView={currentView} />
        <main>
          <Hero onPredictionClick={() => {}} />
          <About />
        </main>
        <Footer />
      </div>
    );
  }

  if (showProfileSetup) {
    return (
      <div className="min-h-screen bg-background">
        <MouseWaveEffect />
        <Header onNavigate={navigateTo} currentView={currentView} />
        <ProfileSetup />
        <Footer />
      </div>
    );
  }

  const renderView = () => {
    if (currentView === 'hub') {
      return <Hub onNavigate={navigateTo} />;
    }
    if (currentView === 'chess') {
      return <ChessGame onBack={() => navigateTo('hub')} />;
    }
    if (currentView === 'my-photo') {
      return <MyPhoto onBack={() => navigateTo('hub')} />;
    }
    if (currentView === 'piano') {
      return <PianoPage onBack={() => navigateTo('hub')} />;
    }
    if (currentView === 'depression-relief') {
      return <DepressionRelief onBack={() => navigateTo('hub')} />;
    }
    if (currentView === 'attendance') {
      return <AttendanceMonitor />;
    }
    if (showPredictionForm) {
      return <PredictionForm onClose={() => setShowPredictionForm(false)} />;
    }
    return (
      <>
        <Hero onPredictionClick={() => setShowPredictionForm(true)} />
        <PredictionHistory />
        <About />
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MouseWaveEffect />
      <Header onNavigate={navigateTo} currentView={currentView} />
      <main
        className="flex-1"
        style={{
          opacity: isTransitioning ? 0 : 1,
          transform: isTransitioning ? 'translateY(12px)' : 'translateY(0)',
          transition: 'opacity 0.2s ease, transform 0.2s ease',
        }}
      >
        <div className="animate-page-enter" key={currentView}>
          {renderView()}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AppContent />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
