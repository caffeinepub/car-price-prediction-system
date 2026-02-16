# Specification

## Summary
**Goal:** Provide clear developer documentation for the project structure and ensure all frontend-referenced static SEO images exist at the expected paths.

**Planned changes:**
- Add a root-level README.md describing where frontend and backend code live, pointing to backend/main.mo and frontend/src/App.tsx as key entry points.
- Document how to run the frontend locally and how to run/deploy the Motoko canister with dfx, referencing frontend/PRODUCTION_DEPLOYMENT.md where relevant.
- Ensure the static image files referenced by the frontend exist under frontend/public/assets/generated with the exact required filenames (including ml-car-prediction.dim_800x400.jpg and car-showroom-hero.dim_1200x600.jpg).

**User-visible outcome:** Developers can quickly find the frontend/backend entry points, run the app locally, deploy to the Internet Computer, and the site loads without broken image links for the required generated assets.
