## ADDED Requirements

### Requirement: Marker Selection Response
When a marker is selected, the application MUST update the global `mapParameters.selectMarker` state. On mobile devices, the traditional Google Maps `InfoWindow` MUST NOT open if it conflicts with the mobile layout. Instead, tapping a marker MUST trigger the bottom sheet to display that marker's `Card` data.

#### Scenario: Mobile user taps a map marker
- **WHEN** the user taps a construction marker on mobile
- **THEN** the map centers on the marker
- **THEN** the bottom sheet snaps to a visible state displaying the details (`CardMini` or equivalent) of the selected marker
- **THEN** no traditional map default info-window overlays
