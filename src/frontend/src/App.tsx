import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { About } from "./components/About";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { MouseWaveEffect } from "./components/MouseWaveEffect";
import { PredictionForm } from "./components/PredictionForm";
import { PredictionHistory } from "./components/PredictionHistory";
import { ProfileSetup } from "./components/ProfileSetup";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "./hooks/useQueries";

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
  const isAuthenticated = !!identity;
  const [showPredictionForm, setShowPredictionForm] = useState(false);

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();

  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
            <div
              className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent"
              style={{ animation: "spin-smooth 0.8s linear infinite" }}
            />
          </div>
          <p className="text-muted-foreground animate-pulse font-medium">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <MouseWaveEffect />
        <Header />
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
        <Header />
        <ProfileSetup />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MouseWaveEffect />
      <Header />
      <main className="flex-1">
        {showPredictionForm ? (
          <PredictionForm onClose={() => setShowPredictionForm(false)} />
        ) : (
          <>
            <Hero onPredictionClick={() => setShowPredictionForm(true)} />
            <PredictionHistory />
            <About />
          </>
        )}
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
