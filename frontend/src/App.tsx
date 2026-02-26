import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { Toaster } from '@/components/ui/sonner';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ProfileSetup } from './components/ProfileSetup';
import { GesturePiano } from './components/GesturePiano';
import { ThemeProvider } from 'next-themes';

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

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();

  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-music-warm via-music-glow to-music-vibrant">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-music-warm via-music-glow to-music-vibrant">
        <Header />
        <main className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="text-center max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fade-in-up">
              Hand Gesture Piano
            </h1>
            <p className="text-xl text-white/90 mb-8 animate-fade-in-up delay-200">
              Play music with your hands! No keyboard needed - just move your hands in front of the camera.
            </p>
            <p className="text-lg text-white/80 mb-8 animate-fade-in-up delay-300">
              Please log in to start playing the gesture piano.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (showProfileSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-music-warm via-music-glow to-music-vibrant">
        <Header />
        <ProfileSetup />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-music-warm via-music-glow to-music-vibrant">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <GesturePiano />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
