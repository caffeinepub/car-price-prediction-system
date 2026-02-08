import { Heart, Mail } from 'lucide-react';
import { SiLinkedin, SiGithub } from 'react-icons/si';
import { useGetApiContactInfo } from '../hooks/useQueries';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { data: contactInfo } = useGetApiContactInfo();

  const socialLinks = [
    { 
      icon: SiLinkedin, 
      href: 'https://www.linkedin.com/in/aswin-s-nair-41a666369', 
      label: 'LinkedIn' 
    },
    { 
      icon: SiGithub, 
      href: 'https://github.com', 
      label: 'GitHub' 
    }
  ];

  return (
    <footer className="bg-gradient-to-b from-background to-muted/50 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/assets/generated/ml-car-prediction.dim_800x400.jpg"
                alt="Car Price Prediction Logo"
                className="h-12 w-24 object-contain"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Car Price Predictor
              </span>
            </div>
            <p className="text-muted-foreground mb-4">
              Machine learning-powered car price prediction system providing accurate vehicle valuation forecasts.
            </p>

            <div className="flex gap-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-10 h-10 rounded-full bg-muted hover:bg-primary/20 flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                  >
                    <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Email</p>
                  <a
                    href={`mailto:${contactInfo?.contactEmail || 'aswinjr462005@gmail.com'}`}
                    className="text-primary hover:text-accent transition-colors font-medium"
                  >
                    {contactInfo?.contactEmail || 'aswinjr462005@gmail.com'}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Founder Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">Project Lead</h3>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Founder</p>
              <p className="font-bold text-lg">{contactInfo?.founder || 'ASWIN S NAIR'}</p>
              <p className="text-sm text-muted-foreground">
                Leading innovation in ML-powered automotive analytics
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border text-center">
          <p className="text-muted-foreground text-sm flex items-center justify-center gap-2 flex-wrap">
            © {currentYear}. Built with{' '}
            <Heart className="w-4 h-4 text-primary inline fill-primary" /> using{' '}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-accent transition-colors font-medium"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
