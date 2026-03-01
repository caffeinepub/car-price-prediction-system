import { useRef, useState, useCallback, useEffect } from 'react';
import { ArrowLeft, Upload, Download, Image as ImageIcon, Sparkles, Mail, MapPin, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MyPhotoProps {
  onBack: () => void;
}

type FilterName = 'original' | 'grayscale' | 'sepia' | 'vignette' | 'neon' | 'vintage' | 'cool' | 'warm';

interface Filter {
  name: FilterName;
  label: string;
  emoji: string;
  description: string;
}

const FILTERS: Filter[] = [
  { name: 'original', label: 'Original', emoji: '🖼️', description: 'No filter applied' },
  { name: 'grayscale', label: 'Grayscale', emoji: '⬛', description: 'Classic black & white' },
  { name: 'sepia', label: 'Sepia', emoji: '🟤', description: 'Warm vintage brown tones' },
  { name: 'vignette', label: 'Vignette', emoji: '🔲', description: 'Dark edges, bright center' },
  { name: 'neon', label: 'Neon Glow', emoji: '💜', description: 'Vibrant neon colors' },
  { name: 'vintage', label: 'Vintage', emoji: '📷', description: 'Faded retro look' },
  { name: 'cool', label: 'Cool Blue', emoji: '🔵', description: 'Cool blue tones' },
  { name: 'warm', label: 'Warm Sunset', emoji: '🌅', description: 'Warm orange tones' },
];

function applyFilter(
  ctx: CanvasRenderingContext2D,
  imageData: ImageData,
  filter: FilterName,
  width: number,
  height: number
): ImageData {
  const data = new Uint8ClampedArray(imageData.data);

  if (filter === 'grayscale') {
    for (let i = 0; i < data.length; i += 4) {
      const avg = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      data[i] = data[i + 1] = data[i + 2] = avg;
    }
  } else if (filter === 'sepia') {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
      data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
      data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
    }
  } else if (filter === 'neon') {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      data[i] = Math.min(255, r * 0.2 + 80);
      data[i + 1] = Math.min(255, g * 0.1 + 20);
      data[i + 2] = Math.min(255, b * 1.8 + 60);
      data[i] = data[i] > 128 ? Math.min(255, data[i] * 1.5) : data[i] * 0.5;
      data[i + 2] = data[i + 2] > 100 ? Math.min(255, data[i + 2] * 1.4) : data[i + 2];
    }
  } else if (filter === 'vintage') {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      data[i] = Math.min(255, r * 0.9 + 20);
      data[i + 1] = Math.min(255, g * 0.85 + 15);
      data[i + 2] = Math.min(255, b * 0.7 + 10);
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = data[i] * 0.7 + avg * 0.3;
      data[i + 1] = data[i + 1] * 0.7 + avg * 0.3;
      data[i + 2] = data[i + 2] * 0.7 + avg * 0.3;
    }
  } else if (filter === 'cool') {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(0, data[i] - 30);
      data[i + 1] = Math.min(255, data[i + 1] + 10);
      data[i + 2] = Math.min(255, data[i + 2] + 50);
    }
  } else if (filter === 'warm') {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] + 50);
      data[i + 1] = Math.min(255, data[i + 1] + 20);
      data[i + 2] = Math.max(0, data[i + 2] - 30);
    }
  }

  return new ImageData(data, width, height);
}

function applyVignette(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const gradient = ctx.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.3,
    width / 2, height / 2, Math.max(width, height) * 0.75
  );
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.7)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

// Profile hero section
function ProfileHero() {
  return (
    <div className="relative rounded-3xl overflow-hidden mb-10 animate-card-enter">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-900/60 via-purple-900/40 to-indigo-900/60" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-end gap-6 p-8">
        {/* Profile photo */}
        <div className="relative flex-shrink-0">
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-violet-400/60 shadow-2xl shadow-violet-500/30 ring-4 ring-violet-500/20">
            <img
              src="/assets/generated/profile-aswin.dim_400x400.png"
              alt="ASWIN S NAIR"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to WhatsApp image if generated one fails
                (e.target as HTMLImageElement).src = '/assets/WhatsApp Image 2026-01-22 at 8.09.21 PM.jpeg';
              }}
            />
          </div>
          {/* Online indicator */}
          <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-400 rounded-full border-2 border-background shadow-lg" />
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left pb-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-400/30 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-violet-300" />
            <span className="text-violet-300 text-xs font-medium">Developer & Creator</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-1">
            ASWIN S NAIR
          </h2>
          <p className="text-white/70 text-sm sm:text-base mb-4 max-w-md">
            Passionate about building intelligent systems and creative web experiences. 
            Founder of this Car Price Prediction platform.
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-4">
            {['Machine Learning', 'React', 'Internet Computer', 'Full Stack'].map(tag => (
              <span key={tag} className="px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-white/70 text-xs">
                {tag}
              </span>
            ))}
          </div>

          {/* Contact row */}
          <div className="flex flex-wrap gap-4 justify-center sm:justify-start text-white/60 text-xs">
            <a
              href="mailto:aswinjr462005@gmail.com"
              className="flex items-center gap-1.5 hover:text-violet-300 transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              aswinjr462005@gmail.com
            </a>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              India
            </span>
            <span className="flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5" />
              ICP Developer
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MyPhoto({ onBack }: MyPhotoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterName>('original');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const originalImageRef = useRef<HTMLImageElement | null>(null);

  const renderWithFilter = useCallback((filter: FilterName) => {
    const canvas = canvasRef.current;
    const img = originalImageRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const maxW = 700;
    const maxH = 500;
    let w = img.naturalWidth;
    let h = img.naturalHeight;
    if (w > maxW) { h = (h * maxW) / w; w = maxW; }
    if (h > maxH) { w = (w * maxH) / h; h = maxH; }
    canvas.width = w;
    canvas.height = h;

    ctx.drawImage(img, 0, 0, w, h);

    if (filter !== 'original') {
      const imageData = ctx.getImageData(0, 0, w, h);
      const filtered = applyFilter(ctx, imageData, filter, w, h);
      ctx.putImageData(filtered, 0, 0);
    }

    if (filter === 'vignette' || filter === 'vintage') {
      applyVignette(ctx, w, h);
    }
  }, []);

  useEffect(() => {
    if (imageLoaded) {
      renderWithFilter(selectedFilter);
    }
  }, [selectedFilter, imageLoaded, renderWithFilter]);

  const loadImage = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        originalImageRef.current = img;
        setImageLoaded(true);
        setSelectedFilter('original');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadImage(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) loadImage(file);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `photo-${selectedFilter}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 animate-fade-in">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-violet-400" />
              My Photo
            </h1>
            <p className="text-white/60 text-sm">Profile & photo filter studio</p>
          </div>
          {imageLoaded && (
            <Button
              onClick={handleDownload}
              className="ml-auto bg-violet-600 hover:bg-violet-500 text-white gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          )}
        </div>

        {/* Profile Hero Section */}
        <ProfileHero />

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/40 text-sm font-medium px-3 py-1 rounded-full border border-white/10 bg-white/5">
            📸 Photo Filter Studio
          </span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Photo Editor */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Upload + Filters */}
          <div className="space-y-4 animate-card-enter">
            {/* Upload area */}
            <div
              className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-violet-400 bg-violet-500/10'
                  : 'border-white/20 hover:border-violet-400/50 hover:bg-white/5'
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <ImageIcon className="w-10 h-10 text-violet-400 mx-auto mb-3" />
              <p className="text-white font-medium text-sm">
                {imageLoaded ? 'Change Photo' : 'Upload Photo'}
              </p>
              <p className="text-white/40 text-xs mt-1">Click or drag & drop</p>
            </div>

            {/* Filter list */}
            <div className="space-y-2">
              <h3 className="text-white/70 text-xs font-semibold uppercase tracking-wider px-1">Filters</h3>
              {FILTERS.map((f) => (
                <button
                  key={f.name}
                  onClick={() => setSelectedFilter(f.name)}
                  disabled={!imageLoaded}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    selectedFilter === f.name
                      ? 'bg-violet-600/30 border border-violet-500/50 text-white'
                      : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed'
                  }`}
                >
                  <span className="text-xl">{f.emoji}</span>
                  <div>
                    <div className="font-medium text-sm">{f.label}</div>
                    <div className="text-xs opacity-60">{f.description}</div>
                  </div>
                  {selectedFilter === f.name && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-violet-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Canvas preview */}
          <div className="lg:col-span-2 animate-card-enter delay-100">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 min-h-[400px] flex items-center justify-center">
              {imageLoaded ? (
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-[500px] rounded-xl shadow-2xl"
                  style={{ display: 'block' }}
                />
              ) : (
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center mx-auto mb-4 animate-float">
                    <ImageIcon className="w-10 h-10 text-white/30" />
                  </div>
                  <p className="text-white/40 text-sm">Upload a photo to apply filters</p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 bg-violet-600 hover:bg-violet-500 text-white gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Choose Photo
                  </Button>
                </div>
              )}
            </div>

            {imageLoaded && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-white/50 text-sm">
                  Filter: <span className="text-violet-400 font-medium">{FILTERS.find(f => f.name === selectedFilter)?.label}</span>
                </p>
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 gap-2"
                >
                  <Download className="w-4 h-4" />
                  Save Image
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Hidden canvas for processing */}
        <canvas ref={hiddenCanvasRef} className="hidden" />
      </div>
    </div>
  );
}
