## Why

The current mobile responsive design (RWD) simply squeezes the layout, causing the sidebar and map to overlap poorly or cramp information on small screens. The vertical and horizontal spaces on a mobile screen are too limited for a traditional "sidebar + map" layout. A redesign is necessary to provide a modern, app-like native experience (similar to Google Maps), focusing on a full-screen map with a bottom sheet for data display.

## What Changes

- Implement a "Bottom Sheet" (swipeable bottom drawer) to house the `InfoBlock` and list of construction cases.
- Redesign the `Selectors` (filter area) to be either a horizontal scrollable chip list or a standalone floating filter modal.
- Optimize the map marker click experience: clicking a cluster or marker on mobile will no longer use a traditional Google Maps `InfoWindow`, but will instead snap the bottom sheet to a "half-expanded" state showing the selected `CardMini` details.
- Retain the current desktop layout fully, only applying these UX changes to mobile views.

## Capabilities

### New Capabilities
- `mobile-bottom-sheet`: A new swipeable bottom sheet interface for navigating construction case lists and details on mobile devices.
- `mobile-filters`: A redesigned, space-efficient filtering interface specifically tailored for mobile screens.

### Modified Capabilities
- `map-interactions`: The behavior of clicking markers and clusters on the map will be modified to interact with the new bottom sheet on mobile devices instead of showing info windows.

## Impact

- **UI Components**: Modifications to `InfoBlock.js`, `Map.js`, `RoadConstructionApp.js`, and `Selectors.js`.
- **Dependencies**: Need to introduce a new library for bottom sheet gesture handling, such as `react-spring-bottom-sheet`.
- **Styling**: Significant layout changes in SCSS/CSS for mobile breakpoints.
