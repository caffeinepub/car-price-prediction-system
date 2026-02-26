import { Award, Mail, User, Brain, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useGetApiContactInfo } from '../hooks/useQueries';

export function About() {
  const { data: contactInfo } = useGetApiContactInfo();

  return (
    <section id="about" className="py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              About the <span className="text-primary">Project</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A machine learning-powered car price prediction system that provides accurate vehicle valuation forecasts.
            </p>
          </div>

          {/* Project Abstract */}
          <Card className="mb-12 border-primary/20 shadow-lg">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Project Overview</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                This Car Price Prediction System leverages advanced machine learning algorithms to provide accurate 
                vehicle price estimates based on comprehensive specifications including brand, model year, mileage, 
                transmission type, fuel type, and ownership history.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The system analyzes market trends and depreciation patterns to forecast not only current prices but 
                also future valuations at 1-year, 3-year, and 5-year intervals, empowering buyers and sellers with 
                data-driven insights for informed decision-making.
              </p>
            </CardContent>
          </Card>

          {/* Founder Information */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="border-accent/20 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Founder</p>
                    <h3 className="text-xl font-bold">ASWIN S NAIR</h3>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Leading this innovative ML project with expertise in data science and automotive market analysis.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contact</p>
                    <h3 className="text-xl font-bold">Get in Touch</h3>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-primary" />
                  <a
                    href={`mailto:${contactInfo?.contactEmail || 'aswinjr462005@gmail.com'}`}
                    className="text-primary hover:text-accent transition-colors font-medium"
                  >
                    {contactInfo?.contactEmail || 'aswinjr462005@gmail.com'}
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Technology Features */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="border-primary/20 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-xl font-bold mb-3">ML Algorithms</h4>
                <p className="text-muted-foreground">
                  Advanced machine learning models trained on comprehensive automotive market data to deliver 
                  accurate price predictions with high confidence scores.
                </p>
              </CardContent>
            </Card>

            <Card className="border-accent/20 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
                <h4 className="text-xl font-bold mb-3">Future Forecasting</h4>
                <p className="text-muted-foreground">
                  Predict vehicle values up to 5 years ahead with detailed depreciation analysis and market 
                  trend projections for strategic planning.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Core Values */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Award,
                title: 'Accuracy',
                description: 'High-precision predictions backed by robust ML models and real market data.',
              },
              {
                icon: Target,
                title: 'Reliability',
                description: 'Consistent performance with confidence scores for every prediction.',
              },
              {
                icon: Brain,
                title: 'Innovation',
                description: 'Cutting-edge technology delivering actionable automotive insights.',
              },
            ].map((value, index) => (
              <Card key={index} className="border-border/50 hover:border-primary/50 transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-bold mb-2">{value.title}</h4>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
