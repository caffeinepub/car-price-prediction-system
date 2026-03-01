# Specification

## Summary
**Goal:** Add optional car photo upload functionality to the car price prediction form, persisting photos alongside prediction records and displaying them in prediction history.

**Planned changes:**
- Add a photo upload dropzone/button to `PredictionForm.tsx` labeled "Add Car Photos (Optional)" supporting JPG, PNG, and WEBP files
- Show inline thumbnail previews of selected photos within the form, with the ability to remove individual photos before submission
- Update the Motoko backend (`main.mo`) to include an optional photos field (array of base64 text) in the prediction record type and update the save/predict function to accept and persist photo data
- Update the prediction mutation hook (`useQueries.ts`) to pass the optional base64 photos array to the backend actor call
- Update the prediction history view to display small photo thumbnails for entries that have associated photos, with no broken placeholder for entries without photos

**User-visible outcome:** Users can optionally attach one or more car detail photos when submitting a price prediction. The photos are previewed before submission and displayed as thumbnails in prediction history entries.
