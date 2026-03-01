import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Music, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { VolumeControl } from './VolumeControl';

interface PianoPageProps {
  onBack: () => void;
}

// Full two-octave keyboard C4–C6
const KEYS = [
  { note: 'C4', isBlack: false, keyboardKey: 'a' },
  { note: 'C#4', isBlack: true, keyboardKey: 'w' },
  { note: 'D4', isBlack: false, keyboardKey: 's' },
  { note: 'D#4', isBlack: true, keyboardKey: 'e' },
  { note: 'E4', isBlack: false, keyboardKey: 'd' },
  { note: 'F4', isBlack: false, keyboardKey: 'f' },
  { note: 'F#4', isBlack: true, keyboardKey: 't' },
  { note: 'G4', isBlack: false, keyboardKey: 'g' },
  { note: 'G#4', isBlack: true, keyboardKey: 'y' },
  { note: 'A4', isBlack: false, keyboardKey: 'h' },
  { note: 'A#4', isBlack: true, keyboardKey: 'u' },
  { note: 'B4', isBlack: false, keyboardKey: 'j' },
  { note: 'C5', isBlack: false, keyboardKey: 'k' },
  { note: 'C#5', isBlack: true, keyboardKey: 'o' },
  { note: 'D5', isBlack: false, keyboardKey: 'l' },
  { note: 'D#5', isBlack: true, keyboardKey: 'p' },
  { note: 'E5', isBlack: false, keyboardKey: ';' },
  { note: 'F5', isBlack: false, keyboardKey: 'z' },
  { note: 'F#5', isBlack: true, keyboardKey: '3' },
  { note: 'G5', isBlack: false, keyboardKey: 'x' },
  { note: 'G#5', isBlack: true, keyboardKey: '4' },
  { note: 'A5', isBlack: false, keyboardKey: 'c' },
  { note: 'A#5', isBlack: true, keyboardKey: '5' },
  { note: 'B5', isBlack: false, keyboardKey: 'v' },
  { note: 'C6', isBlack: false, keyboardKey: 'b' },
];

const KEY_TO_NOTE: Record<string, string> = {};
KEYS.forEach(({ note, keyboardKey }) => {
  KEY_TO_NOTE[keyboardKey] = note;
});

export function PianoPage({ onBack }: PianoPageProps) {
  const { playNote, stopNote, setVolume } = useAudioPlayer();
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [volume, setVolumeState] = useState(0.7);
  const [showKeyboard, setShowKeyboard] = useState(true);

  const handleVolumeChange = useCallback((v: number) => {
    setVolumeState(v);
    setVolume(v);
  }, [setVolume]);

  const startNote = useCallback((note: string) => {
    playNote(note);
    setActiveNotes((prev) => new Set([...prev, note]));
  }, [playNote]);

  const endNote = useCallback((note: string) => {
    stopNote(note);
    setActiveNotes((prev) => {
      const next = new Set(prev);
      next.delete(note);
      return next;
    });
  }, [stopNote]);

  // Keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const note = KEY_TO_NOTE[e.key.toLowerCase()];
      if (note) startNote(note);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const note = KEY_TO_NOTE[e.key.toLowerCase()];
      if (note) endNote(note);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [startNote, endNote]);

  const whiteKeys = KEYS.filter((k) => !k.isBlack);
  const whiteKeyWidth = 48;
  const whiteKeyGap = 2;
  const totalWidth = whiteKeys.length * (whiteKeyWidth + whiteKeyGap) - whiteKeyGap;

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
              <Music className="w-7 h-7 text-amber-400" />
              Piano
            </h1>
            <p className="text-white/60 text-sm">Click keys or use your keyboard to play</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowKeyboard((v) => !v)}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 gap-2"
            >
              <Keyboard className="w-4 h-4" />
              {showKeyboard ? 'Hide' : 'Show'} Keys
            </Button>
          </div>
        </div>

        {/* Piano container */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-card-enter">
          <div className="text-center mb-6">
            <h2 className="text-white text-xl font-semibold">Piano Keyboard (C4 – C6)</h2>
            <p className="text-white/50 text-sm mt-1">
              {showKeyboard ? 'Keyboard shortcuts shown on keys' : 'Click keys to play notes'}
            </p>
          </div>

          {/* Keyboard */}
          <div className="overflow-x-auto pb-4">
            <div className="relative mx-auto" style={{ width: `${totalWidth}px`, height: '240px' }}>
              {/* White keys */}
              <div className="flex absolute top-0 left-0" style={{ gap: `${whiteKeyGap}px` }}>
                {whiteKeys.map((key) => {
                  const isActive = activeNotes.has(key.note);
                  return (
                    <div
                      key={key.note}
                      className={`relative rounded-b-xl border-2 transition-all duration-75 select-none cursor-pointer ${
                        isActive
                          ? 'bg-amber-400 border-amber-300 shadow-lg shadow-amber-400/60 scale-y-95'
                          : 'bg-white border-gray-300 hover:bg-amber-50 active:bg-amber-100'
                      }`}
                      style={{ width: `${whiteKeyWidth}px`, height: '220px', transformOrigin: 'top' }}
                      onMouseDown={() => startNote(key.note)}
                      onMouseUp={() => endNote(key.note)}
                      onMouseLeave={() => activeNotes.has(key.note) && endNote(key.note)}
                      onTouchStart={(e) => { e.preventDefault(); startNote(key.note); }}
                      onTouchEnd={() => endNote(key.note)}
                    >
                      <div className="absolute bottom-3 left-0 right-0 text-center">
                        <div className="text-[9px] font-medium text-gray-400 leading-tight">{key.note}</div>
                        {showKeyboard && (
                          <div className={`text-[10px] font-bold mt-0.5 uppercase ${isActive ? 'text-amber-800' : 'text-gray-500'}`}>
                            {key.keyboardKey}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Black keys */}
              <div className="absolute top-0 left-0" style={{ width: `${totalWidth}px` }}>
                {KEYS.map((key, index) => {
                  if (!key.isBlack) return null;
                  const isActive = activeNotes.has(key.note);
                  const whiteKeysBefore = KEYS.slice(0, index).filter((k) => !k.isBlack).length;
                  const leftOffset = whiteKeysBefore * (whiteKeyWidth + whiteKeyGap) - 16;

                  return (
                    <div
                      key={key.note}
                      className={`absolute rounded-b-lg transition-all duration-75 select-none cursor-pointer z-10 ${
                        isActive
                          ? 'bg-amber-500 shadow-lg shadow-amber-500/60 scale-y-95'
                          : 'bg-gray-900 hover:bg-gray-700 active:bg-gray-600'
                      }`}
                      style={{
                        left: `${leftOffset}px`,
                        width: '32px',
                        height: '140px',
                        transformOrigin: 'top',
                      }}
                      onMouseDown={() => startNote(key.note)}
                      onMouseUp={() => endNote(key.note)}
                      onMouseLeave={() => activeNotes.has(key.note) && endNote(key.note)}
                      onTouchStart={(e) => { e.preventDefault(); startNote(key.note); }}
                      onTouchEnd={() => endNote(key.note)}
                    >
                      <div className="absolute bottom-2 left-0 right-0 text-center">
                        <div className="text-[7px] font-medium text-white/50 leading-tight">
                          {key.note.replace('#', '♯')}
                        </div>
                        {showKeyboard && (
                          <div className={`text-[8px] font-bold uppercase mt-0.5 ${isActive ? 'text-amber-200' : 'text-white/40'}`}>
                            {key.keyboardKey}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active notes */}
          <div className="mt-4 text-center min-h-[28px]">
            {activeNotes.size > 0 ? (
              <span className="text-amber-400 font-semibold text-sm">
                🎵 Playing: {[...activeNotes].join(', ')}
              </span>
            ) : (
              <span className="text-white/30 text-sm">No notes active — click a key or press a keyboard shortcut</span>
            )}
          </div>
        </div>

        {/* Volume + Instructions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in delay-200">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <VolumeControl volume={volume} onVolumeChange={handleVolumeChange} />
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <h3 className="text-white font-semibold mb-3 text-sm">Keyboard Shortcuts</h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-white/60">
              <div><span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-white">A–J</span> White keys (C4–B4)</div>
              <div><span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-white">K–V</span> White keys (C5–B5)</div>
              <div><span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-white">W E T Y U</span> Black keys (oct 4)</div>
              <div><span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-white">O P 3 4 5</span> Black keys (oct 5)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
