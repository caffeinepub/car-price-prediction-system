interface Landmark {
  x: number;
  y: number;
  z: number;
}

interface HandLandmarks {
  landmarks: Landmark[];
  handedness: string;
}

// All 25 notes from C4 to C6
const NOTES = [
  'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4',
  'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5', 'B5',
  'C6',
];

// Debounce: track last triggered note per hand to avoid rapid re-triggering
const lastNoteTime: Map<string, number> = new Map();
const NOTE_DEBOUNCE_MS = 80;

function isFingerExtended(tip: Landmark, pip: Landmark, mcp: Landmark): boolean {
  // A finger is extended if the tip is above (lower y) the PIP joint by a meaningful margin
  // and the PIP is above the MCP
  return tip.y < pip.y - 0.02 && pip.y < mcp.y + 0.05;
}

function getThumbExtended(tip: Landmark, ip: Landmark, mcp: Landmark): boolean {
  // Thumb extension: tip is far from MCP horizontally
  const dx = Math.abs(tip.x - mcp.x);
  const dy = Math.abs(tip.y - mcp.y);
  return dx > 0.05 || dy > 0.05;
}

export function detectGesture(hands: HandLandmarks[]): string[] {
  const activeNotes: string[] = [];
  const now = Date.now();

  hands.forEach((hand, handIdx) => {
    const { landmarks } = hand;
    if (!landmarks || landmarks.length < 21) return;

    // Key landmark indices
    const wrist = landmarks[0];
    // Thumb
    const thumbTip = landmarks[4];
    const thumbIp = landmarks[3];
    const thumbMcp = landmarks[2];
    // Index
    const indexTip = landmarks[8];
    const indexPip = landmarks[6];
    const indexMcp = landmarks[5];
    // Middle
    const middleTip = landmarks[12];
    const middlePip = landmarks[10];
    const middleMcp = landmarks[9];
    // Ring
    const ringTip = landmarks[16];
    const ringPip = landmarks[14];
    const ringMcp = landmarks[13];
    // Pinky
    const pinkyTip = landmarks[20];
    const pinkyPip = landmarks[18];
    const pinkyMcp = landmarks[17];

    const indexExtended = isFingerExtended(indexTip, indexPip, indexMcp);
    const middleExtended = isFingerExtended(middleTip, middlePip, middleMcp);
    const ringExtended = isFingerExtended(ringTip, ringPip, ringMcp);
    const pinkyExtended = isFingerExtended(pinkyTip, pinkyPip, pinkyMcp);
    const thumbExtended = getThumbExtended(thumbTip, thumbIp, thumbMcp);

    const extendedFingers = [indexExtended, middleExtended, ringExtended, pinkyExtended];
    const extendedCount = extendedFingers.filter(Boolean).length;

    // Need at least 2 fingers extended to trigger a note
    if (extendedCount < 2) return;

    // Use the horizontal position (x) of the hand to select the note
    // x=0 is left edge, x=1 is right edge of the camera frame
    // Map hand x position across the 25 notes
    // Use wrist x as the primary position indicator
    const handX = wrist.x;

    // Map x position to note index (0 to 24)
    // Clamp to valid range
    const noteIndex = Math.max(0, Math.min(NOTES.length - 1, Math.floor(handX * NOTES.length)));
    const note = NOTES[noteIndex];

    // Debounce per hand
    const handKey = `hand_${handIdx}`;
    const lastTime = lastNoteTime.get(handKey) || 0;
    if (now - lastTime < NOTE_DEBOUNCE_MS) return;

    lastNoteTime.set(handKey, now);

    if (!activeNotes.includes(note)) {
      activeNotes.push(note);
    }
  });

  return activeNotes;
}
