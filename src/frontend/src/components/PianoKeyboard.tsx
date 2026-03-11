interface PianoKeyboardProps {
  activeNotes: string[];
}

// Generate 25 keys spanning two octaves (C4 to C6)
const KEYS = [
  // Octave 4
  { note: "C4", isBlack: false },
  { note: "C#4", isBlack: true },
  { note: "D4", isBlack: false },
  { note: "D#4", isBlack: true },
  { note: "E4", isBlack: false },
  { note: "F4", isBlack: false },
  { note: "F#4", isBlack: true },
  { note: "G4", isBlack: false },
  { note: "G#4", isBlack: true },
  { note: "A4", isBlack: false },
  { note: "A#4", isBlack: true },
  { note: "B4", isBlack: false },
  // Octave 5
  { note: "C5", isBlack: false },
  { note: "C#5", isBlack: true },
  { note: "D5", isBlack: false },
  { note: "D#5", isBlack: true },
  { note: "E5", isBlack: false },
  { note: "F5", isBlack: false },
  { note: "F#5", isBlack: true },
  { note: "G5", isBlack: false },
  { note: "G#5", isBlack: true },
  { note: "A5", isBlack: false },
  { note: "A#5", isBlack: true },
  { note: "B5", isBlack: false },
  // C6
  { note: "C6", isBlack: false },
];

export function PianoKeyboard({ activeNotes }: PianoKeyboardProps) {
  const whiteKeys = KEYS.filter((k) => !k.isBlack);
  const whiteKeyWidth = 44;
  const whiteKeyGap = 2;
  const totalWidth =
    whiteKeys.length * (whiteKeyWidth + whiteKeyGap) - whiteKeyGap;

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-2xl w-full">
      <h3 className="text-white text-xl font-semibold mb-4 text-center">
        Piano Keys (C4–C6)
      </h3>
      <div className="overflow-x-auto pb-2">
        <div
          className="relative mx-auto"
          style={{ width: `${totalWidth}px`, height: "220px" }}
        >
          {/* White keys */}
          <div
            className="flex absolute top-0 left-0"
            style={{ gap: `${whiteKeyGap}px` }}
          >
            {whiteKeys.map((key) => {
              const isActive = activeNotes.includes(key.note);
              return (
                <div
                  key={key.note}
                  className={`relative rounded-b-lg border-2 transition-all duration-75 select-none ${
                    isActive
                      ? "bg-music-vibrant border-music-glow shadow-lg shadow-music-glow/60 scale-y-95"
                      : "bg-white border-gray-300 hover:bg-gray-50"
                  }`}
                  style={{
                    width: `${whiteKeyWidth}px`,
                    height: "200px",
                    transformOrigin: "top",
                  }}
                >
                  <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] font-medium text-gray-500 leading-tight">
                    {key.note}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Black keys */}
          <div
            className="absolute top-0 left-0 pointer-events-none"
            style={{ width: `${totalWidth}px` }}
          >
            {KEYS.map((key, index) => {
              if (!key.isBlack) return null;
              const isActive = activeNotes.includes(key.note);
              const whiteKeysBefore = KEYS.slice(0, index).filter(
                (k) => !k.isBlack,
              ).length;
              const leftOffset =
                whiteKeysBefore * (whiteKeyWidth + whiteKeyGap) - 14;

              return (
                <div
                  key={key.note}
                  className={`absolute rounded-b-md transition-all duration-75 select-none ${
                    isActive
                      ? "bg-music-warm shadow-lg shadow-music-warm/60 scale-y-95"
                      : "bg-gray-900"
                  }`}
                  style={{
                    left: `${leftOffset}px`,
                    width: "28px",
                    height: "130px",
                    transformOrigin: "top",
                    zIndex: 10,
                  }}
                >
                  <div className="absolute bottom-2 left-0 right-0 text-center text-[8px] font-medium text-white/70 leading-tight">
                    {key.note.replace("#", "♯")}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active notes display */}
      <div className="mt-3 text-center min-h-[24px]">
        {activeNotes.length > 0 ? (
          <span className="text-music-vibrant font-semibold text-sm">
            🎵 Playing: {activeNotes.join(", ")}
          </span>
        ) : (
          <span className="text-white/40 text-sm">No notes active</span>
        )}
      </div>
    </div>
  );
}
