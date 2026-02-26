import { useState } from 'react';
import { WebcamFeed } from './WebcamFeed';
import { PianoKeyboard } from './PianoKeyboard';
import { VolumeControl } from './VolumeControl';

export function GesturePiano() {
  const [activeNotes, setActiveNotes] = useState<string[]>([]);
  const [volume, setVolume] = useState(0.7);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 animate-fade-in">
          Hand Gesture Piano
        </h1>
        <p className="text-lg text-white/90 animate-fade-in">
          Move your hand left ↔ right to select notes · Extend 2+ fingers to play
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <WebcamFeed
            onActiveNotesChange={setActiveNotes}
            volume={volume}
          />
          <VolumeControl volume={volume} onVolumeChange={setVolume} />
        </div>

        <div className="flex items-center justify-center">
          <PianoKeyboard activeNotes={activeNotes} />
        </div>
      </div>
    </div>
  );
}
