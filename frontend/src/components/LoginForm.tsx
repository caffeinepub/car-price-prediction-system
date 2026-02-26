import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { LogIn, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function LoginForm() {
  const { login, loginStatus } = useInternetIdentity();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await login();
      toast.success('Successfully logged in!');
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message === 'User is already authenticated') {
        toast.error('Already authenticated. Please refresh the page.');
      } else {
        toast.error('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const disabled = loginStatus === 'logging-in' || isLoading;

  return (
    <section className="min-h-screen flex items-center justify-center px-4 pt-20">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      
      <Card className="w-full max-w-md relative z-10 shadow-2xl border-primary/20">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto mb-4">
            <img
              src="/assets/generated/ml-car-prediction.dim_800x400.jpg"
              alt="Car Price Prediction Logo"
              className="w-48 h-24 mx-auto object-contain"
            />
          </div>
          <CardTitle className="text-3xl font-bold">Car Price Predictor</CardTitle>
          <CardDescription className="text-base">
            Sign in with Internet Identity to access the prediction system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Button
              onClick={handleLogin}
              disabled={disabled}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg py-6 gap-2"
              size="lg"
            >
              {disabled ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In with Internet Identity
                </>
              )}
            </Button>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Don't have an Internet Identity?
            </p>
            <a
              href="https://identity.ic0.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:text-accent transition-colors font-medium"
            >
              Create one here
            </a>
          </div>

          <div className="pt-6 border-t border-border">
            <p className="text-xs text-center text-muted-foreground">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
