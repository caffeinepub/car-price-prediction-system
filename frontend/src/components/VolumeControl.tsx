import { Volume, Volume1, Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface VolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
}

function VolumeIcon({ volume }: { volume: number }) {
  if (volume === 0) return <VolumeX className="w-5 h-5 text-white flex-shrink-0" />;
  if (volume < 0.33) return <Volume className="w-5 h-5 text-white flex-shrink-0" />;
  if (volume < 0.66) return <Volume1 className="w-5 h-5 text-white flex-shrink-0" />;
  return <Volume2 className="w-5 h-5 text-white flex-shrink-0" />;
}

export function VolumeControl({ volume, onVolumeChange }: VolumeControlProps) {
  const handleIconClick = () => {
    onVolumeChange(volume === 0 ? 0.7 : 0);
  };

  return (
    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
      <button
        onClick={handleIconClick}
        className="flex-shrink-0 hover:opacity-70 transition-opacity"
        title={volume === 0 ? 'Unmute' : 'Mute'}
      >
        <VolumeIcon volume={volume} />
      </button>
      <Slider
        value={[volume]}
        onValueChange={(values) => onVolumeChange(values[0])}
        max={1}
        step={0.01}
        className="flex-1"
      />
      <span className="text-white text-sm font-medium w-10 text-right tabular-nums">
        {Math.round(volume * 100)}%
      </span>
    </div>
  );
}
