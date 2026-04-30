## 1. Dependency & Setup

- [ ] 1.1 Install `react-spring-bottom-sheet` and its required CSS via `npm install react-spring-bottom-sheet`.
- [ ] 1.2 Import the bottom sheet styles into `src/index.scss` or `src/RoadConstructionApp.js`.

## 2. Component Refactoring & Filters

- [ ] 2.1 Refactor `Selectors.js` to render horizontally or as a floating modal when `isMobile` is true.
- [ ] 2.2 Modify `InfoBlock.js` to remove redundant wrappers if operating within the bottom sheet context in mobile mode.

## 3. Map & Base Layout Modifications

- [ ] 3.1 Update `RoadConstructionApp.js` container CSS logic so that when `isMobile`, the Google Map naturally takes 100% of the screen height without padding pushed by sidebars.
- [ ] 3.2 Add a new state in `RoadConstructionApp.js` (e.g., `bottomSheetOpen` and `bottomSheetSnapPoint`) to manage the drawer state.

## 4. Bottom Sheet Integration

- [ ] 4.1 In `RoadConstructionApp.js`, conditionally render the `react-spring-bottom-sheet` `<BottomSheet>` component when `isMobile` is true.
- [ ] 4.2 Move the rendering of `InfoBlock` (or the `CardsList` and `Selectors`) into the `<BottomSheet>` wrapper for mobile views.
- [ ] 4.3 Configure snap points for the bottom sheet (e.g., 100px for peek, 50% for half, 90% for fully expanded).

## 5. Interaction & User Experience

- [ ] 5.1 Modify `Map.js` marker/cluster click handlers: when an item is selected on mobile, bypass the standard `InfoWindow` if necessary, and dispatch an event to snap the `BottomSheet` to the half-open state.
- [ ] 5.2 Ensure closing the bottom sheet or dismissing the active card resets the map parameter's `selectMarker`.
- [ ] 5.3 Test filtering interactions from inside the bottom sheet and verify map markers adjust accordingly.
