import { useRef, useCallback, useState, useEffect } from 'react';

interface UseAudioPlayerReturn {
  playNote: (note: string) => void;
  stopNote: (note: string) => void;
  setVolume: (volume: number) => void;
  isLoading: boolean;
  loadError: string | null;
}

// Fallback frequencies for oscillator-based synthesis
const NOTE_FREQUENCIES: Record<string, number> = {
  C4: 261.63, 'C#4': 277.18, D4: 293.66, 'D#4': 311.13, E4: 329.63,
  F4: 349.23, 'F#4': 369.99, G4: 392.0, 'G#4': 415.3, A4: 440.0, 'A#4': 466.16, B4: 493.88,
  C5: 523.25, 'C#5': 554.37, D5: 587.33, 'D#5': 622.25, E5: 659.25,
  F5: 698.46, 'F#5': 739.99, G5: 783.99, 'G#5': 830.61, A5: 880.0, 'A#5': 932.33, B5: 987.77,
  C6: 1046.5,
};

interface ActiveNote {
  gainNode: GainNode;
  oscillators: OscillatorNode[];
  stopTime?: number;
}

export function useAudioPlayer(): UseAudioPlayerReturn {
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const activeNotesRef = useRef<Map<string, ActiveNote>>(new Map());
  const volumeRef = useRef<number>(0.7);
  const [isLoading] = useState(false);
  const [loadError] = useState<string | null>(null);

  // Lazy-initialize AudioContext on first user interaction
  const getAudioContext = useCallback((): AudioContext | null => {
    if (!audioContextRef.current) {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = ctx;

        const masterGain = ctx.createGain();
        masterGain.gain.value = volumeRef.current;
        masterGain.connect(ctx.destination);
        masterGainRef.current = masterGain;
      } catch (e) {
        console.error('Failed to create AudioContext:', e);
        return null;
      }
    }

    // Resume if suspended (browser autoplay policy)
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(() => {});
    }

    return audioContextRef.current;
  }, []);

  // Piano-like tone using multiple oscillators (additive synthesis)
  const playNote = useCallback((note: string) => {
    // Don't re-trigger if already playing
    if (activeNotesRef.current.has(note)) return;

    const frequency = NOTE_FREQUENCIES[note];
    if (!frequency) return;

    const ctx = getAudioContext();
    if (!ctx || !masterGainRef.current) return;

    const gainNode = ctx.createGain();
    gainNode.connect(masterGainRef.current);

    // Piano-like ADSR envelope
    const now = ctx.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.4, now + 0.01); // Fast attack
    gainNode.gain.exponentialRampToValueAtTime(0.25, now + 0.1); // Decay
    gainNode.gain.setTargetAtTime(0.15, now + 0.1, 0.5); // Sustain

    const oscillators: OscillatorNode[] = [];

    // Fundamental + harmonics for piano-like timbre
    const harmonics = [
      { ratio: 1, gain: 1.0 },
      { ratio: 2, gain: 0.5 },
      { ratio: 3, gain: 0.25 },
      { ratio: 4, gain: 0.1 },
    ];

    harmonics.forEach(({ ratio, gain }) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = ratio === 1 ? 'triangle' : 'sine';
      osc.frequency.value = frequency * ratio;
      oscGain.gain.value = gain;

      osc.connect(oscGain);
      oscGain.connect(gainNode);
      osc.start(now);

      oscillators.push(osc);
    });

    activeNotesRef.current.set(note, { gainNode, oscillators });
  }, [getAudioContext]);

  const stopNote = useCallback((note: string) => {
    const active = activeNotesRef.current.get(note);
    if (!active) return;

    const ctx = audioContextRef.current;
    if (!ctx) return;

    const { gainNode, oscillators } = active;
    const now = ctx.currentTime;

    // Release envelope
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    // Stop oscillators after release
    oscillators.forEach((osc) => {
      try {
        osc.stop(now + 0.35);
      } catch (e) {
        // Already stopped
      }
    });

    activeNotesRef.current.delete(note);

    // Cleanup after release
    setTimeout(() => {
      try {
        gainNode.disconnect();
      } catch (e) {
        // Already disconnected
      }
    }, 400);
  }, []);

  const setVolume = useCallback((volume: number) => {
    volumeRef.current = volume;
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = volume;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      activeNotesRef.current.forEach(({ gainNode, oscillators }) => {
        oscillators.forEach((osc) => {
          try { osc.stop(); } catch (e) {}
        });
        try { gainNode.disconnect(); } catch (e) {}
      });
      activeNotesRef.current.clear();

      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  return { playNote, stopNote, setVolume, isLoading, loadError };
}
