# mobile-filters Specification

## Purpose
TBD - created by archiving change mobile-redesign. Update Purpose after archive.
## Requirements
### Requirement: Horizontal or Modal Selectors
On mobile devices, the `Selectors` (containing district, date, and state filters) MUST NOT render as a vertical block that pushes content down. It MUST either render horizontally at the top of the app/bottom sheet, or act as a modal that overlays the screen.

#### Scenario: Mobile user views filters
- **WHEN** the app loads in mobile view
- **THEN** the filter options are accessible without occupying significant vertical screen real estate
- **THEN** selecting a filter updates the construction lists seamlessly

