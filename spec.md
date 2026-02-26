# Specification

## Summary
**Goal:** Fix the broken hand gesture piano so that webcam hand tracking, audio playback, gesture recognition, and the piano UI all work correctly end-to-end.

**Planned changes:**
- Fix the WebcamFeed component so the camera feed displays live output, MediaPipe Hands initializes without errors, hand landmarks are detected and drawn on the canvas overlay, and gesture events propagate to the audio player.
- Fix the `useAudioPlayer` hook so piano samples load correctly for all 25 keys (C4–C6), and the fallback oscillator activates automatically when samples are unavailable.
- Fix the gesture recognition utility (`gestureRecognition.ts`) so landmark-to-note mapping works reliably for all 25 keys, notes do not fire continuously at rest, and the mapping is consistent with the visual keyboard layout.
- Fix the `GesturePiano` component layout so the webcam feed, piano keyboard, and volume control all render correctly, active keys highlight in real time when gestures are detected, and the volume slider adjusts playback volume.

**User-visible outcome:** Users can open the gesture piano, see their webcam feed with hand landmark overlay, play notes by making hand gestures, see the corresponding keys highlighted on the piano keyboard, and adjust volume — all without errors.
