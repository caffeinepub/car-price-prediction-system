# Specification

## Summary
**Goal:** Fix inverted name display in the attendance list and add Present Time / Leaving Time tracking to the Attendance Monitor system.

**Planned changes:**
- Fix name display so registered names appear in the correct order (not reversed) in all attendance list views
- Add `presentTime` and `leavingTime` fields to backend attendance records
- Record `presentTime` timestamp automatically when a face is recognized and attendance is marked
- Add a "Mark Leaving" action per attendance record to record `leavingTime`
- Display "Present Time" and "Leaving Time" columns in the attendance records list, showing a placeholder (e.g., "Still Present") when leaving time has not been recorded yet
- Format both times in a human-readable format (e.g., HH:MM:SS or locale string)

**User-visible outcome:** Attendance records show names correctly as registered, and each record displays both when the person arrived and when they left (or indicates they are still present).
