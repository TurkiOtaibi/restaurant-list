# Responsive & Accessibility User Stories

Source of truth:

- `docs/feature-map/FEATURE_MAP.md`
- `docs/feature-map/FEATURE_CATALOG.md`
- `docs/feature-map/FEATURE_TREE.md`
- `docs/feature-map/FEATURE_TRACEABILITY.md`

Scope: all `RESP-*` and `A11Y-*` features from `FEATURE_CATALOG.md`.

Total features processed: 6
Total user stories written: 130

## Engineering Decision Records

Approved EDRs that resolve responsive/accessibility clarifications:

- `docs/engineering-decisions/EDR-002_RATING_ACCESSIBILITY_CONTRACT.md`

## Shared Responsive and Accessibility Requirements

### Accessibility Baseline

- Target conformance is WCAG 2.2 AA.
- Requirements apply to all active screens and states unless a feature explicitly does not render there.
- Active screens include:
  - Login
  - Register
  - قوائمي
  - Create List
  - Edit List
  - Delete confirmation
  - List Detail
  - Add Place
  - الأماكن
  - Place Detail
  - Rating
  - صفحتي
  - Public Lists
  - Loading states
  - Empty states
  - Error states
  - Dialogs
  - Bottom sheets
  - Menus
  - Bottom navigation

### Responsive Certification Matrix

Required viewport coverage:

- Mobile:
  - `320x568`
  - `390x844`
  - `430x932`
- Tablet:
  - `768x1024`
  - `1024x768`
- Desktop:
  - `1440x900`
- Browser coverage:
  - Chromium
  - Firefox
  - WebKit
- Additional accessibility/adaptive modes:
  - `200%` browser zoom
  - increased text size
  - `prefers-reduced-motion`
  - forced-colors/high-contrast mode where supported

### No Horizontal Overflow Rule

- For every supported active screen and viewport:
  - `document.documentElement.scrollWidth <= window.innerWidth`
- No horizontal page overflow is permitted.
- Global `overflow-x:hidden` and global `overflow-x:clip` must not be used to hide layout defects.
- Layout defects must be fixed at source with containment, wrapping, `min-width: 0`, logical sizing, or correct responsive layout.

### Touch Targets

- Every interactive control must provide a minimum hit target of `44x44` CSS pixels.
- This includes navigation items, row links, buttons, icon buttons, close controls, filter controls, menu triggers, rating controls, form controls, and dialog/sheet actions.
- Visual size may be smaller only if the actual hit area remains at least `44x44`.

### Contrast Requirements

- Normal text contrast must meet WCAG 2.2 AA: at least `4.5:1`.
- Large text contrast must meet WCAG 2.2 AA: at least `3:1`.
- Non-text UI components and graphical objects required to understand state must meet at least `3:1`.
- Focus indicators must be visible and meet at least `3:1` contrast against adjacent colors.
- Placeholder text must be readable and must not be the only way to identify a field.
- Disabled controls must be visually distinguishable and must not be required to complete a flow.
- Forced-colors mode must keep text, selected states, focus indicators, buttons, links, dialogs, and form controls distinguishable.

### RTL and Arabic Requirements

- Arabic UI text must render as real Arabic with no mojibake and no visible Unicode escape sequences.
- RTL layout must use logical properties and leading/trailing behavior.
- Mixed Arabic/English content must preserve readable order with bidi isolation where needed.
- Numeric fragments must use Western digits and LTR-safe formatting.
- Assistive technology reading order must match the visual/logical Arabic-first experience.

## Responsive & Accessibility Module

### RESP-001 - RTL primary nav

Feature Description: The global app shell provides RTL-native primary navigation for the Arabic-first product.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| RESP-001-US-001 | Show Arabic RTL primary navigation | Critical | As an Arabic user, I want primary navigation in Arabic RTL order so that the app structure is clear. | Given I am on an active app screen, when the shell renders, then primary navigation labels are `قوائمي`, `الأماكن`, and `صفحتي` with no mojibake or Unicode escape text. |
| RESP-001-US-002 | Preserve approved navigation order | Critical | As a user, I want the approved three destinations stable. | Given primary navigation renders, then only `قوائمي`, `الأماكن`, and `صفحتي` appear as primary destinations and no separate restaurant/cafe primary tabs appear. |
| RESP-001-US-003 | Highlight active destination | High | As a user, I want to know the current section. | Given I am on a primary section, when navigation renders, then the matching item has a clear selected state that is not confused with keyboard focus. |
| RESP-001-US-004 | Nav hidden on auth screens | Medium | As a guest, I want login and registration focused. | Given I open login or registration, when the screen renders, then primary app navigation is hidden. |
| RESP-001-US-005 | Navigation landmark | High | As a screen-reader user, I want the primary nav announced as navigation. | Given app navigation renders, then it exposes a navigation landmark or equivalent semantic structure. |
| RESP-001-US-006 | Accessible nav item names | High | As a screen-reader user, I want each destination named clearly. | Given nav items render, then each item has an accessible name matching its visible Arabic label. |
| RESP-001-US-007 | Keyboard navigation | Critical | As a keyboard user, I want to use primary navigation without touch. | Given focus reaches navigation, when I use Tab and Enter or Space, then every nav item can be focused and activated. |
| RESP-001-US-008 | Focus-visible navigation state | High | As a keyboard user, I want visible focus. | Given a nav item receives keyboard focus, then a visible `focus-visible` indicator appears and meets contrast requirements. |
| RESP-001-US-009 | RTL icon and label alignment | Medium | As an Arabic user, I want nav icons and labels visually balanced. | Given navigation renders in RTL, then icon/label spacing uses logical inline positioning and does not assume physical left/right. |
| RESP-001-US-010 | Minimum nav touch targets | Critical | As a mobile user, I want reliable bottom navigation taps. | Given bottom navigation renders, then every nav item has at least a `44x44` CSS pixel hit target. |
| RESP-001-US-011 | Bottom nav does not obscure final content | Critical | As a mobile user, I want final rows/actions reachable. | Given any active screen at `320x568`, `390x844`, or `430x932`, when scrolled to the end, then the final interactive element is not obscured by bottom navigation, safe-area padding, or browser UI. |
| RESP-001-US-012 | Bottom nav safe-area support | Critical | As an iOS Safari user, I want nav safe from browser/system controls. | Given a notch device or iOS-like safe area, when bottom navigation renders, then it accounts for `env(safe-area-inset-bottom)` without covering content. |
| RESP-001-US-013 | Nav responsive matrix coverage | High | As QA, I want nav certified across required viewports. | Given the certification matrix is tested in Chromium, Firefox, and WebKit, then navigation fits and remains operable at every required viewport. |
| RESP-001-US-014 | Nav 200% zoom support | High | As a low-vision user, I want primary navigation usable at high zoom. | Given `200%` browser zoom, when navigation renders, then labels remain readable, targets remain `44x44`, and no horizontal overflow occurs. |
| RESP-001-US-015 | Nav reading order in RTL | High | As a screen-reader user, I want nav reading order to match Arabic structure. | Given screen reader navigation through the nav, then item order is logical for the RTL Arabic app and does not announce hidden or obsolete destinations. |

Story Count: 15

Coverage Assessment: Covers Arabic labels, approved destinations, RTL order, active state, auth-screen behavior, semantics, keyboard, focus-visible, touch targets, safe areas, bottom-nav overlap, viewport/browser matrix, 200% zoom, and screen-reader reading order.

Missing Assumptions: None.

Risks: Critical navigation and accessibility risk if the nav overlaps content, announces corrupted Arabic, or fails keyboard operation.

### RESP-002 - Safe-area aware layout

Feature Description: Active screens account for mobile safe areas, dynamic viewport behavior, layout containment, and adaptive desktop/tablet presentation.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| RESP-002-US-001 | Apply responsive certification matrix | Critical | As QA, I want every active screen tested against approved viewports. | Given Login, Register, قوائمي, List Detail, الأماكن, Place Detail, Rating, صفحتي, Public Lists, dialogs, and sheets are tested, then each passes at `320x568`, `390x844`, `430x932`, `768x1024`, `1024x768`, and `1440x900`. |
| RESP-002-US-002 | Enforce no horizontal overflow | Critical | As any user, I want pages to fit without zooming out. | Given any supported screen and viewport, then `document.documentElement.scrollWidth <= window.innerWidth`. |
| RESP-002-US-003 | Prohibit global overflow masking | Critical | As QA, I want real layout defects fixed. | Given global styles are reviewed, then `overflow-x:hidden` and `overflow-x:clip` are not used globally to conceal overflow; any local clipping has a documented component reason and does not hide content. |
| RESP-002-US-004 | Support top safe area | High | As an iOS Safari user, I want headers below the status area. | Given a notch device or safe-area viewport, when a screen loads, then header/top content accounts for `env(safe-area-inset-top)`. |
| RESP-002-US-005 | Support bottom safe area | Critical | As a mobile user, I want final content above system/browser controls. | Given a screen scrolls to the end, then bottom padding accounts for bottom navigation height, `env(safe-area-inset-bottom)`, and additional breathing room. |
| RESP-002-US-006 | Handle browser chrome changes | High | As a mobile browser user, I want layout stable when browser chrome expands/collapses. | Given mobile browser UI changes viewport height, then content and fixed nav remain usable without hidden controls. |
| RESP-002-US-007 | Avoid fragile fixed viewport height | High | As a mobile user, I want dynamic viewport support. | Given viewport height changes, then layouts avoid unsafe fixed `100vh` assumptions and use safe dynamic viewport behavior where needed. |
| RESP-002-US-008 | Virtual keyboard on auth forms | High | As a mobile user, I want auth forms usable while typing. | Given the virtual keyboard is open on Login or Register, then focused field, error text, and submit/cancel actions remain reachable. |
| RESP-002-US-009 | Virtual keyboard on create/edit flows | High | As a mobile user, I want forms usable while typing. | Given the virtual keyboard is open in Create List, Edit List, Add Place, or Rating notes, then fields and primary actions remain reachable without horizontal overflow. |
| RESP-002-US-010 | Dialogs fit viewport matrix | High | As a mobile/tablet user, I want dialogs usable in all supported sizes. | Given a dialog opens at any certification viewport, then title, content, close control, and actions fit within the viewport and can scroll internally if needed. |
| RESP-002-US-011 | Bottom sheets fit mobile viewports | High | As a mobile user, I want sheets usable on small screens. | Given a bottom sheet opens at `320x568`, `390x844`, or `430x932`, then close control, content, and actions are visible or reachable through internal scrolling. |
| RESP-002-US-012 | Phone landscape support | High | As a phone landscape user, I want active screens usable after rotation. | Given a landscape phone viewport, when active screens render, then no horizontal overflow occurs and fixed nav/sheets/dialogs do not hide critical controls. |
| RESP-002-US-013 | Tablet portrait layout | Medium | As a tablet user, I want content balanced in portrait. | Given `768x1024`, when active screens render, then content uses available width without stretched mobile rows or excessive dead zones. |
| RESP-002-US-014 | Tablet landscape layout | Medium | As a tablet user, I want content balanced in landscape. | Given `1024x768`, when active screens render, then content remains readable and does not rely on a narrow mobile-only column. |
| RESP-002-US-015 | Desktop layout at 1440px | Medium | As a desktop user, I want the app not to look like a stretched phone. | Given `1440x900`, when active screens render, then content is constrained or arranged intentionally and does not create oversized mobile rows. |
| RESP-002-US-016 | Long Arabic names contained | High | As an Arabic user, I want long names readable. | Given long Arabic list/place names render in rows, cards, dialogs, and sheets, then text wraps or clamps predictably without horizontal overflow. |
| RESP-002-US-017 | Long English names contained | High | As a user, I want long English names contained. | Given long English list/place names render, then text wraps or clamps without colliding with ratings, counts, thumbnails, or actions. |
| RESP-002-US-018 | Mixed Arabic/English names contained | High | As a bilingual user, I want mixed names readable. | Given mixed Arabic/English names render, then bidi isolation preserves order and no overflow occurs. |
| RESP-002-US-019 | Long private notes contained | High | As a user, I want long notes not to break profile/rating layouts. | Given long note previews or note fields render, then content wraps, clamps, or scrolls internally without page-level horizontal overflow. |
| RESP-002-US-020 | Place/list rows reflow correctly | High | As a user, I want dense rows to remain readable. | Given place/list rows render at narrow widths, then thumbnail, text, rating/count, and actions do not collide and the text column uses `min-width: 0` or equivalent containment. |
| RESP-002-US-021 | Loading states match layout | Medium | As a user, I want loading states not to cause layout jumps. | Given loading states render at any certification viewport, then skeletons/placeholders match final layout dimensions and do not create overflow. |
| RESP-002-US-022 | Error states fit all viewports | Medium | As a user, I want errors usable on small screens. | Given an error state renders at any certification viewport, then message and retry action remain readable and reachable. |
| RESP-002-US-023 | Menus fit safe areas | Medium | As a mobile user, I want menus usable near screen edges. | Given a menu opens near any viewport edge, then it remains within viewport bounds and does not require horizontal scrolling. |
| RESP-002-US-024 | Browser matrix coverage | High | As QA, I want layout certified across engines. | Given Chromium, Firefox, and WebKit are tested, then the responsive matrix passes in each browser or any browser-specific exception is documented as a release blocker. |

Story Count: 24

Coverage Assessment: Covers viewport matrix, no-overflow assertion, overflow masking prohibition, top/bottom safe areas, iOS Safari/browser chrome, dynamic viewport behavior, virtual keyboard, dialogs, sheets, landscape, tablet, desktop, long Arabic/English/mixed names, long notes, rows, loading/error/menu states, and browser matrix.

Missing Assumptions: None.

Risks: Critical usability risk if content is hidden under browser chrome/nav, if global overflow masking hides defects, or if the layout only works at one mobile size.

### RESP-003 - 200% zoom/adaptive pressure

Feature Description: The frontend is certified for 200% browser zoom, increased text size, forced-colors/high-contrast mode, and adaptive pressure without loss of function.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| RESP-003-US-001 | Support 200% zoom on active screens | Critical | As a low-vision user, I want the app usable at 200% zoom. | Given `200%` browser zoom in Chromium, Firefox, or WebKit, when active screens render, then no horizontal overflow occurs and core actions remain available. |
| RESP-003-US-002 | Enforce zoom overflow assertion | Critical | As QA, I want a measurable 200% pass/fail rule. | Given a 200% zoom/adaptive-pressure test runs, then `document.documentElement.scrollWidth <= window.innerWidth` for every tested screen. |
| RESP-003-US-003 | Preserve functionality under adaptive width | Critical | As a user under zoom pressure, I want features not removed. | Given effective viewport width is reduced by zoom or text scaling, then navigation, forms, rows, dialogs, sheets, rating control, and retry actions remain operable. |
| RESP-003-US-004 | Increased text size support | High | As a user with larger text, I want content to reflow. | Given browser or OS text size is increased, then labels, buttons, rows, metadata, and validation errors do not clip or overlap. |
| RESP-003-US-005 | Long Arabic text under zoom | High | As an Arabic user, I want long Arabic content readable at high zoom. | Given long Arabic names or notes and 200% zoom, then content remains contained without horizontal overflow. |
| RESP-003-US-006 | Long English text under zoom | High | As a user, I want long English content contained at high zoom. | Given long English names and 200% zoom, then wrapping/clamping prevents overlap with ratings, actions, or thumbnails. |
| RESP-003-US-007 | Mixed content under zoom | High | As a bilingual user, I want mixed Arabic/English content readable at high zoom. | Given mixed Arabic/English names and 200% zoom, then bidi order remains readable and no overflow occurs. |
| RESP-003-US-008 | Touch targets remain 44x44 under zoom | High | As a zoomed user, I want controls operable. | Given 200% zoom or increased text size, then interactive controls keep a minimum `44x44` CSS pixel hit target. |
| RESP-003-US-009 | Dialogs usable at 200% zoom | High | As a low-vision user, I want dialogs usable at high zoom. | Given a dialog opens at 200% zoom, then it fits the viewport, traps focus, and primary/secondary/close controls are reachable. |
| RESP-003-US-010 | Sheets usable at 200% zoom | High | As a low-vision mobile user, I want sheets usable at high zoom. | Given a bottom sheet opens at 200% zoom, then content scrolls internally as needed and close/actions remain reachable. |
| RESP-003-US-011 | Rating control usable at 200% zoom | High | As a low-vision user, I want to rate without layout failure. | Given the rating screen is at 200% zoom, then the rating control remains keyboard and pointer operable without clipped values. |
| RESP-003-US-012 | Profile archive usable at 200% zoom | High | As a low-vision user, I want archive rows readable. | Given profile archive renders at 200% zoom, then rows reflow and final content remains above bottom nav. |
| RESP-003-US-013 | Places list usable at 200% zoom | High | As a low-vision user, I want places browseable. | Given the Places page renders at 200% zoom, then rows do not clip ratings, names, or artwork. |
| RESP-003-US-014 | Forced-colors text visibility | High | As a high-contrast user, I want text visible. | Given forced-colors mode is active, then foreground/background text remains distinguishable and no required text disappears. |
| RESP-003-US-015 | Forced-colors controls and state | High | As a high-contrast user, I want controls and states visible. | Given forced-colors mode is active, then buttons, inputs, selected states, borders, and focus indicators remain distinguishable. |
| RESP-003-US-016 | Reduced motion preserves function | High | As a motion-sensitive user, I want the app fully functional. | Given `prefers-reduced-motion` is active, then no critical information relies on animation and all flows remain completeable. |
| RESP-003-US-017 | Reduced motion disables nonessential animation | Medium | As a motion-sensitive user, I want nonessential motion reduced. | Given reduced motion is active, then decorative transitions, shimmer, row animations, sheet motion, and rating animation are removed or minimized. |
| RESP-003-US-018 | Browser matrix for adaptive modes | High | As QA, I want adaptive behavior certified across engines. | Given Chromium, Firefox, and WebKit are tested, then 200% zoom and reduced-motion behavior pass in each browser. |

Story Count: 18

Coverage Assessment: Covers 200% zoom, no-overflow assertion, adaptive function preservation, increased text, long Arabic/English/mixed text, touch targets, dialogs, sheets, rating, profile, places, forced colors, reduced motion, and browser matrix.

Missing Assumptions: None.

Risks: Critical accessibility compliance and usability risk if 200% zoom creates overflow, clipped controls, or inaccessible modal flows.

### RESP-004 - Western Arabic numerals

Feature Description: Visible UI uses Western Arabic numerals (`0-9`) with bidi-safe formatting.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| RESP-004-US-001 | Display Western digits in counts | High | As a user, I want counts shown with Western digits so that numbers are consistent. | Given list, place, rating, profile, pagination, or validation counts appear, then digits use `0-9`. |
| RESP-004-US-002 | Prevent Arabic-Indic numerals | High | As Product, I want Arabic-Indic numerals excluded from active UI. | Given active UI text is inspected, then Arabic-Indic digits `٠١٢٣٤٥٦٧٨٩` are not present. |
| RESP-004-US-003 | Decimal ratings use period | High | As a user, I want decimal ratings clear. | Given a decimal rating appears, then it uses a period such as `8.5`, not Arabic decimal punctuation. |
| RESP-004-US-004 | Rating values are LTR-isolated | High | As an RTL user, I want rating values visually stable. | Given values such as `8.5/10` render inside Arabic UI, then the numeric fragment is LTR-isolated and does not reorder surrounding text. |
| RESP-004-US-005 | Counts are bidi-safe | Medium | As an Arabic user, I want counts readable in Arabic labels. | Given a count appears in Arabic text, then the number is isolated or formatted so text order remains correct. |
| RESP-004-US-006 | Dates use Western digits | Medium | As a user, I want dates consistent when shown. | Given dates appear in UI, then day/year values use Western digits and follow the approved date format for that surface. |
| RESP-004-US-007 | Validation messages use Western digits | Medium | As a user, I want validation limits readable. | Given validation messages mention limits such as `80` or `1000`, then numbers use Western digits. |
| RESP-004-US-008 | Loading and empty states use Western digits | Medium | As a user, I want all numeric UI consistent. | Given loading, empty, or summary states include numeric placeholders or counts, then digits use Western numerals. |
| RESP-004-US-009 | Screen-reader numeric context | Medium | As a screen-reader user, I want numeric values meaningful. | Given a numeric value is announced, then its accessible label provides context such as rating, count, date, or limit. |
| RESP-004-US-010 | Cross-surface numeral consistency | Medium | As QA, I want one numeral rule across the app. | Given the same number appears in Places, Lists, Ratings, Profile, Public Lists, dialogs, and errors, then formatting is consistent. |

Story Count: 10

Coverage Assessment: Covers Western digits, Arabic-Indic prevention, decimal separator, LTR isolation, counts, dates, validation, loading/empty states, screen-reader context, and cross-surface consistency.

Missing Assumptions: None.

Risks: Medium UX and RTL clarity risk if components bypass shared numeral formatting.

### A11Y-001 - Focus trap and restoration

Feature Description: Dialogs and sheets meet the approved modal accessibility contract for keyboard and screen-reader users.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| A11Y-001-US-001 | Dialog role semantics | Critical | As a screen-reader user, I want dialogs announced correctly. | Given a dialog opens, then it has `role=\"dialog\"`, `aria-modal=\"true\"`, and an accessible name associated with the visible title. |
| A11Y-001-US-002 | Bottom sheet modal semantics | Critical | As a screen-reader user, I want bottom sheets announced as modal surfaces. | Given a bottom sheet opens, then it exposes modal dialog semantics equivalent to the approved dialog contract. |
| A11Y-001-US-003 | Initial focus placement | Critical | As a keyboard user, I want focus placed predictably when a modal opens. | Given a dialog or sheet opens, then initial focus moves to the first meaningful focus target, title, first invalid field, or configured safe initial focus element. |
| A11Y-001-US-004 | Trap focus in dialog | Critical | As a keyboard user, I want focus trapped inside a dialog. | Given a dialog is open, when I Tab or Shift+Tab through controls, then focus remains inside the dialog. |
| A11Y-001-US-005 | Trap focus in bottom sheet | Critical | As a keyboard user, I want focus trapped inside a bottom sheet. | Given a bottom sheet is open, when I Tab or Shift+Tab, then focus remains inside the sheet. |
| A11Y-001-US-006 | Restore focus to trigger | Critical | As a keyboard user, I want to continue from where I opened the modal. | Given I open a dialog/sheet from a trigger, when it closes, then focus returns to the triggering control. |
| A11Y-001-US-007 | Restore focus fallback if trigger unmounts | High | As a keyboard user, I want focus not lost after mutations. | Given the trigger unmounts after modal close, then focus moves to a logical fallback such as page heading, updated row, or primary action. |
| A11Y-001-US-008 | Escape closes dismissible dialogs | High | As a keyboard user, I want Escape recovery. | Given a dismissible dialog/sheet is open, when I press Escape, then it closes unless unsaved-input protection requires confirmation. |
| A11Y-001-US-009 | Accessible close control | High | As a screen-reader user, I want close controls named. | Given a close button renders, then it has a clear accessible Arabic name such as `إغلاق`. |
| A11Y-001-US-010 | Inert background | Critical | As a modal user, I want background inactive. | Given a modal dialog/sheet is open, then background content is inert to keyboard, screen-reader navigation where supported, and pointer interaction. |
| A11Y-001-US-011 | Modal scroll locking | High | As a mobile user, I want background not to scroll behind modals. | Given a modal/sheet is open, then background scroll is locked or managed so content behind the modal does not move unexpectedly. |
| A11Y-001-US-012 | Internal modal scrolling | High | As a mobile user, I want long modal content reachable. | Given modal/sheet content exceeds viewport height, then content scrolls internally and actions remain reachable. |
| A11Y-001-US-013 | Dialog safe-area support | High | As an iOS Safari user, I want modal actions reachable. | Given a dialog/sheet opens on a safe-area device, then title, close control, and action buttons are not obscured by notch, browser UI, or safe-area padding. |
| A11Y-001-US-014 | Dialog validation errors announced | Critical | As a screen-reader user, I want validation errors communicated. | Given modal form validation fails, then errors are associated with fields and announced through accessible error text or live region. |
| A11Y-001-US-015 | Focus first invalid field | High | As a keyboard user, I want correction to start at the right field. | Given modal form submission fails validation, then focus moves to the first invalid field or an error summary that links to it. |
| A11Y-001-US-016 | Modal loading announced | Medium | As a screen-reader user, I want pending modal actions conveyed. | Given a modal action is pending, then `aria-busy` or an accessible status communicates loading without relying only on animation. |
| A11Y-001-US-017 | Unsaved-input protection accessible | Medium | As a user, I want unsaved changes protected accessibly. | Given a create/edit modal has unsaved input, when I attempt to close, then prevention/confirmation is keyboard-operable and screen-reader understandable. |
| A11Y-001-US-018 | No nested modal focus conflict | Medium | As a keyboard user, I want focus behavior predictable. | Given a modal is open, when another modal would be triggered, then the system prevents invalid nested focus traps or manages them with a clear active modal. |
| A11Y-001-US-019 | Dialog 200% zoom support | High | As a low-vision user, I want modals usable at high zoom. | Given `200%` zoom, when a dialog/sheet opens, then it meets the modal contract and no horizontal overflow occurs. |
| A11Y-001-US-020 | Dialog browser matrix coverage | High | As QA, I want modal accessibility certified across engines. | Given Chromium, Firefox, and WebKit are tested, then focus trap, restoration, Escape, semantics, and safe-area behavior pass. |

Story Count: 20

Coverage Assessment: Covers explicit dialog/sheet semantics, accessible name, initial focus, trap, restoration, fallback, Escape, close labels, inert background, scroll locking, internal scroll, safe areas, validation, loading, unsaved-input protection, nested-modal prevention, 200% zoom, and browser matrix.

Missing Assumptions: None.

Risks: Critical accessibility risk if modals lack semantics, leak focus, fail restoration, or hide actions under keyboard/browser UI.

### A11Y-002 - Keyboard-operable rating control

Feature Description: Rating control supports keyboard interaction, screen-reader labels, half-step values, and accessible mobile/touch behavior.

#### User Stories

| Story ID | Title | Priority | User Story | Acceptance Criteria |
|---|---|---|---|---|
| A11Y-002-US-001 | Rating control keyboard focus | Critical | As a keyboard user, I want to focus the rating control. | Given the rating screen is open, when I Tab through controls, then the rating control receives visible `focus-visible`. |
| A11Y-002-US-002 | Define rating keyboard model | Critical | As QA, I want exact keyboard behavior. | Given the rating control pattern is implemented, then keyboard interaction is documented and testable as either radio group, slider, or approved composite control. |
| A11Y-002-US-003 | Select rating by keyboard | Critical | As a keyboard user, I want to set a rating without pointer input. | Given focus is on the rating control, when I use the documented keyboard commands, then I can select and save a valid rating. |
| A11Y-002-US-004 | Keyboard supports half increments | High | As a keyboard user, I want equal precision. | Given the control supports `0.5` increments, when I use keyboard input, then values such as `1`, `1.5`, `8.5`, and `10` are reachable. |
| A11Y-002-US-005 | Invalid rating values unreachable | High | As QA, I want invalid values prevented. | Given keyboard interaction is used, then values such as `0`, `0.5`, `8.25`, `8.3`, and `10.5` cannot be selected. |
| A11Y-002-US-006 | Announce selected rating | Critical | As a screen-reader user, I want selected value announced. | Given I select `8.5`, then assistive technology can determine the selected value as `8.5/10`. |
| A11Y-002-US-007 | Accessible rating labels | High | As a screen-reader user, I want the scale understandable. | Given rating options are exposed, then labels include value and scale context, such as `8.5 من 10`. |
| A11Y-002-US-008 | Selected state announced | High | As a screen-reader user, I want to know which rating is selected. | Given a rating value is selected, then selected state is conveyed semantically and not only through color. |
| A11Y-002-US-009 | Rating focus indicator contrast | High | As a keyboard user, I want visible focus. | Given rating control receives focus, then focus indicator is visible and meets the focus contrast requirement. |
| A11Y-002-US-010 | Rating touch targets | Critical | As a mobile user, I want reliable rating taps. | Given rating control renders on mobile, then every interactive rating target has at least `44x44` CSS pixel hit area. |
| A11Y-002-US-011 | Rating at 320px and 390px | High | As a mobile user, I want rating usable on small screens. | Given `320x568` or `390x844`, when rating control renders, then values, notes field, and actions do not overflow or overlap. |
| A11Y-002-US-012 | Rating at 200% zoom | High | As a low-vision user, I want rating usable at high zoom. | Given `200%` browser zoom, then the rating control remains keyboard/pointer operable and no values are clipped. |
| A11Y-002-US-013 | Rating RTL layout clarity | Medium | As an Arabic user, I want rating values visually clear. | Given rating UI renders in RTL, then numeric values are LTR-isolated and labels/actions follow logical Arabic order. |
| A11Y-002-US-014 | Rating validation error announcement | Critical | As a screen-reader user, I want save errors announced. | Given rating save fails validation, then the error is associated with the rating control and announced through accessible error text/live region. |
| A11Y-002-US-015 | Rating loading state announcement | Medium | As a screen-reader user, I want save progress conveyed. | Given rating save is pending, then loading state is conveyed with `aria-busy` or accessible status and controls prevent duplicate submission. |
| A11Y-002-US-016 | Rating reduced motion | Medium | As a motion-sensitive user, I want rating feedback usable. | Given `prefers-reduced-motion` is active, then rating selection feedback does not rely on nonessential animation. |
| A11Y-002-US-017 | Rating forced-colors support | Medium | As a high-contrast user, I want rating state visible. | Given forced-colors mode is active, then rating values, selected state, focus, and disabled state remain distinguishable. |
| A11Y-002-US-018 | Rating screen-reader order | High | As a screen-reader user, I want rating flow logical. | Given I navigate the rating screen with assistive tech, then heading, place name, rating control, notes, errors, and actions are announced in logical order. |
| A11Y-002-US-019 | Rating browser matrix coverage | High | As QA, I want rating accessibility certified across engines. | Given Chromium, Firefox, and WebKit are tested, then keyboard, focus, labels, and selected state behavior pass. |

Story Count: 19

Coverage Assessment: Covers exact keyboard model, focus, keyboard selection, half increments, invalid-value prevention, selected announcements, labels, focus contrast, touch targets, small mobile, 200% zoom, RTL, validation/loading announcements, reduced motion, forced colors, screen-reader order, and browser matrix.

Missing Assumptions: None.

Risks: Critical product and accessibility risk if users cannot rate without pointer input or if decimal ratings are inaccessible.

## Module Summary

Total Features Processed: 6

Total User Stories Generated: 106

Features With Highest Complexity:

- `RESP-002` - certification matrix, safe areas, dynamic viewport, keyboard pressure, tablet/desktop, long content, no-overflow rules.
- `A11Y-001` - modal semantics, focus trap/restoration, inert background, safe areas, validation/loading accessibility.
- `A11Y-002` - keyboard-operable half-step rating control with screen-reader and mobile constraints.
- `RESP-003` - 200% zoom, increased text, forced colors, reduced motion across browser engines.

Features With Highest Business Risk:

- `RESP-003` - 200% zoom failure blocks low-vision users and release readiness.
- `A11Y-001` - inaccessible dialogs/sheets block create/edit/delete/add/rating flows.
- `A11Y-002` - inaccessible rating control blocks core product action.
- `RESP-002` - safe-area or overflow failures make mobile unusable.
- `RESP-001` - bottom navigation overlap blocks primary navigation.

Recommended QA Priority Order:

1. `RESP-003`
2. `A11Y-001`
3. `A11Y-002`
4. `RESP-002`
5. `RESP-001`
6. `RESP-004`

QA Certification Requirements:

- Run viewport matrix tests for all active screens.
- Run no-overflow assertion: `document.documentElement.scrollWidth <= window.innerWidth`.
- Run browser coverage in Chromium, Firefox, and WebKit.
- Run keyboard-only navigation checks.
- Run dialog/sheet focus trap, initial focus, restoration, Escape, and inert-background checks.
- Run screen-reader validation checklist for navigation, headings, forms, errors, dialogs, sheets, rating, and row metadata.
- Run contrast validation for normal text, large text, UI components, focus indicators, placeholders, and disabled states.
- Run safe-area validation for iOS Safari-like notch, bottom nav, dynamic browser chrome, and virtual keyboard.
- Run long-content fixtures for Arabic, English, mixed-language names, and long private notes.
- Run 200% zoom validation for active screens, dialogs, sheets, rating, Places, Profile, and Public Lists.
- Run reduced-motion and forced-colors validation.

Coverage Assessment:

- Covered: WCAG 2.2 AA baseline, mobile/tablet/desktop viewport matrix, Chromium/Firefox/WebKit matrix, 200% zoom, increased text, forced colors, reduced motion, RTL-native layout, Arabic UX, mixed Arabic/English content, Western numerals, safe areas, dynamic viewport, virtual keyboard, no horizontal overflow, overflow masking prohibition, bottom navigation safety, responsive dialogs, responsive sheets, long names, long notes, keyboard navigation, focus-visible, focus order, screen-reader labels, accessible names, heading/reading order, dialog semantics, sheet semantics, error announcements, loading announcements, live/status behavior, contrast thresholds, touch targets, and QA certification requirements.
- Not included: new design-system redesign, new component framework migration, platform-native app accessibility APIs, social accessibility features, or future non-current screens because they are outside current `RESP-*` and `A11Y-*` catalog scope.

Resolved Product Decisions:

- Target conformance is WCAG 2.2 AA.
- Required viewport coverage is `320x568`, `390x844`, `430x932`, `768x1024`, `1024x768`, and `1440x900`.
- Supported browser certification matrix is Chromium, Firefox, and WebKit.
- No horizontal overflow is permitted on supported screens.
- Minimum touch target is `44x44` CSS pixels.
- Dialogs require `role=\"dialog\"`, `aria-modal=\"true\"`, accessible name, initial focus, focus trap, and focus restoration.
- Final interactive elements must never be obscured by bottom navigation, safe-area padding, or browser UI.
- iOS Safari safe-area handling is required for notch devices, browser chrome changes, and dynamic viewport changes.
- Reduced-motion mode must remain fully functional and no critical information may rely on animation.
- Global `overflow-x:hidden` and `overflow-x:clip` must not be used to hide layout defects.

Open Product Questions:

- None.
