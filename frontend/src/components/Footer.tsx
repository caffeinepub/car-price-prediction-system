import { SiGithub } from 'react-icons/si';
import { Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const appIdentifier = typeof window !== 'undefined' 
    ? encodeURIComponent(window.location.hostname) 
    : 'gesture-piano';

  return (
    <footer className="border-t border-white/20 bg-white/5 backdrop-blur-sm mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-white/80 text-sm text-center md:text-left">
            © {currentYear} Gesture Piano. All rights reserved.
          </div>

          <div className="flex items-center gap-2 text-white/80 text-sm">
            <span>Built with</span>
            <Heart className="w-4 h-4 text-red-400 fill-red-400" />
            <span>using</span>
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-white/90 font-medium underline"
            >
              caffeine.ai
            </a>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 hover:text-white transition-colors"
            >
              <SiGithub className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
