import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Music, LogOut, LogIn } from 'lucide-react';

export function Header() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';

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

  return (
    <header className="border-b border-white/20 bg-white/5 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Music className="w-8 h-8 text-white" />
          <h1 className="text-2xl font-bold text-white">Gesture Piano</h1>
        </div>

        <Button
          onClick={handleAuth}
          disabled={disabled}
          variant={isAuthenticated ? 'outline' : 'default'}
          className={
            isAuthenticated
              ? 'bg-white/10 hover:bg-white/20 text-white border-white/30'
              : 'bg-white text-music-vibrant hover:bg-white/90'
          }
        >
          {disabled ? (
            'Loading...'
          ) : isAuthenticated ? (
            <>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4 mr-2" />
              Login
            </>
          )}
        </Button>
      </div>
    </header>
  );
}
