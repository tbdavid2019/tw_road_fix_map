## Context

The current `RoadConstructionApp.js` application serves both desktop and mobile users using CSS media queries (RWD). However, the mobile experience is cramped, overlaying the `InfoBlock` (list and filters) directly on top of the `Map` without a cohesive native-app feel. To improve this, we are pivoting to a "Bottom Sheet" model for mobile.

## Goals / Non-Goals

**Goals:**
- Provide a smooth, native-like bottom sheet interaction for mobile users using `react-spring-bottom-sheet`.
- Keep the Google Map full-screen and unobstructed in the background.
- Sync map marker clicks with the bottom sheet state (snapping to half-open when a marker is tapped).
- Re-use existing `Card`, `InfoBlock`, and `Selectors` components as much as possible, mostly altering their containers and CSS for mobile.

**Non-Goals:**
- Refactoring the entire React structure to a new state manager (Redux, etc.). State will remain in `RoadConstructionApp.js`.
- Modifying the data parsing or fetching layers.
- Changing the desktop layout.

## Decisions

- **Bottom Sheet Library**: We will use `react-spring-bottom-sheet` because it handles touch gestures intuitively, supports snap points (header only, half, full), and is lightweight.
- **State Management**: We will introduce a new state in `RoadConstructionApp.js` (e.g., `bottomSheetState` or `isBottomSheetOpen`) that gets updated when a marker is clicked in `Map.js`.
- **Selector Extraction**: `Selectors.js` will be displayed horizontally at the top or inside the drawer header in the mobile view, overriding the default vertical layout to save vertical space.

## Risks / Trade-offs

- **Library Compatibility**: `react-spring-bottom-sheet` requires React 16.8+. The project supports it, but checking bundle size and CSS clashes is needed.
- **Trade-off - Z-index conflicts**: The Google Maps UI (zoom controls, attribution) and the Bottom Sheet might compete for space. We will mitigate this by adjusting Google Map's `padding` or bottom control positions when on mobile.
- **Risk - Performance limitation**: React re-rendering heavily inside a spring animation can drop frames. We will mitigate this by using React.memo on the `CardList` or ensuring we don't trigger unnecessary re-renders of the Map when the sheet is swiped.