import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Footer } from './components/Footer';
import { PredictionForm } from './components/PredictionForm';
import { LoginForm } from './components/LoginForm';
import { ProfileSetup } from './components/ProfileSetup';
import { SEOHead } from './components/SEOHead';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { Toaster } from '@/components/ui/sonner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { identity, isInitializing } = useInternetIdentity();
  const [showPrediction, setShowPrediction] = useState(false);
  const isAuthenticated = !!identity;

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();

  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <SEOHead />
        <Header onPredictionClick={() => setShowPrediction(true)} />
        <LoginForm />
        <Footer />
      </div>
    );
  }

  if (showProfileSetup) {
    return (
      <div className="min-h-screen">
        <SEOHead />
        <Header onPredictionClick={() => setShowPrediction(true)} />
        <ProfileSetup />
        <Footer />
      </div>
    );
  }

  if (showPrediction) {
    return (
      <div className="min-h-screen">
        <SEOHead />
        <Header onPredictionClick={() => setShowPrediction(true)} />
        <PredictionForm onClose={() => setShowPrediction(false)} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SEOHead />
      <Header onPredictionClick={() => setShowPrediction(true)} />
      <main>
        <Hero onPredictionClick={() => setShowPrediction(true)} />
        <About />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
