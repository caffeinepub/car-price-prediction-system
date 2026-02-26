import { ArrowRight, TrendingUp, BarChart3, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroProps {
  onPredictionClick: () => void;
}

export function Hero({ onPredictionClick }: HeroProps) {
  const scrollToAbout = () => {
    const element = document.getElementById('about');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Machine Learning Powered
            </span>
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up">
            Car Price{' '}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Prediction System
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto animate-fade-in-up delay-200">
            Advanced ML algorithms to predict current and future car prices based on vehicle specifications and market trends.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
            <Button
              onClick={onPredictionClick}
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-8 py-6 gap-2"
            >
              Start Prediction
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              onClick={scrollToAbout}
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6"
            >
              Learn More
            </Button>
          </div>

          {/* Hero Image */}
          <div className="mt-16 animate-fade-in delay-500">
            <img
              src="/assets/generated/car-showroom-hero.dim_1200x600.jpg"
              alt="Car Price Prediction - ML Powered"
              className="w-full max-w-3xl mx-auto rounded-2xl shadow-2xl border border-border"
            />
          </div>

          {/* Feature Highlights */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto animate-fade-in delay-700">
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-6">
              <Brain className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">ML Algorithms</h3>
              <p className="text-sm text-muted-foreground">
                Advanced machine learning models for accurate predictions
              </p>
            </div>
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-6">
              <TrendingUp className="w-8 h-8 text-accent mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">Future Forecasts</h3>
              <p className="text-sm text-muted-foreground">
                1, 3, and 5-year price predictions with confidence scores
              </p>
            </div>
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-6">
              <BarChart3 className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">Market Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Real-time market trends and depreciation calculations
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
