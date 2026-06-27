# EDR-002: Rating Accessibility Contract

## Status

Approved

## Decision

The visual rating control renders as:

```text
★★★★★
```

The accessibility semantic is a slider.

Range:

- Minimum: `1.0`
- Maximum: `10.0`
- Step: `0.5`

Keyboard interaction:

- `Tab`
- `Shift+Tab`
- `ArrowLeft`
- `ArrowRight`
- `Home`
- `End`

Screen-reader announcement:

```text
Rating, X.X out of 10
```

## Applies To

Rating control accessibility user stories, A11Y-002 test cases, rating-related RTM mappings, smoke coverage, regression coverage, and accessibility automation.

