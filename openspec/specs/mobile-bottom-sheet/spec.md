# mobile-bottom-sheet Specification

## Purpose
TBD - created by archiving change mobile-redesign. Update Purpose after archive.
## Requirements
### Requirement: Mobile Bottom Sheet Initialization
The application MUST render a swipeable bottom sheet interface when the viewport is determined to be a mobile size (`isMobile === true`). The Google map MUST render full-screen in the background without overlapping occlusion from older sidebar designs.

#### Scenario: Mobile user loads application
- **WHEN** a user visits the app on a screen width below the mobile breakpoint
- **THEN** the map renders edge-to-edge
- **THEN** the bottom sheet appears at the bottom of the screen showing the `InfoBlock` list context

### Requirement: Bottom Sheet Interaction States
The bottom sheet MUST support at least two states: "collapsed/peek" (showing only essential controls) and "expanded/half" (showing details or list). 

#### Scenario: User interacts with sheet
- **WHEN** the user drags the sheet upwards
- **THEN** it expands to display the `CardsList`
- **WHEN** the user drags it down
- **THEN** it collapses cleanly to the bottom edge without obscuring the map completely

