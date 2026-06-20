# Restaurant & Cafe Wishlist Tracker Documentation

This folder contains the product, engineering, QA, and roadmap documentation for the Restaurant & Cafe Wishlist Tracker.

The original MVP documents remain the baseline for the Core Foundation already implemented through Sprint 2. The product plan has now expanded beyond MVP; use the full production system roadmap for future planning.

Documents are intentionally numbered to preserve the requested order:

1. [Executive Summary](01-executive-summary.md)
2. [Product Scope](02-product-scope.md)
3. [Functional Requirements](03-functional-requirements.md)
4. [Non-Functional Requirements](04-non-functional-requirements.md)
5. [Business Rules](05-business-rules.md)
6. [User Roles & Permissions](06-user-roles-and-permissions.md)
7. [User Flows](07-user-flows.md)
8. [Screen Inventory](08-screen-inventory.md)
9. [Information Architecture](09-information-architecture.md)
10. [Database Design](10-database-design.md)
11. [ERD](11-erd.md)
12. [API Specification](12-api-specification.md)
13. [Validation Rules](13-validation-rules.md)
14. [Edge Cases](14-edge-cases.md)
15. [UX Recommendations](15-ux-recommendations.md)
16. [MVP Scope](16-mvp-scope.md)
17. [Future Roadmap](17-future-roadmap.md)
18. [Sprint Plan](18-sprint-plan.md)
19. [QA Strategy](19-qa-strategy.md)
20. [Requirement Traceability Matrix](20-requirement-traceability-matrix.md)

Additional review and remediation artifacts:

21. [Product Audit Report](21-product-audit-report.md)
22. [Audit Remediation Summary](22-audit-remediation-summary.md)
23. [Development Standards](23-development-standards.md)
24. [Sprint 0 Verification Checklist](24-sprint-0-verification-checklist.md)
25. [Sprint 0 Completion Report](25-sprint-0-completion-report.md)
26. [Sprint 1 Completion Report](26-sprint-1-completion-report.md)
27. [Sprint 2 Completion Report](27-sprint-2-completion-report.md)
28. [Full Production System Roadmap](28-production-system-roadmap.md)
29. [World-Class Product Experience Specification](29-world-class-product-experience-specification.md)
30. [World-Class Design Audit Report](30-world-class-design-audit-report.md)
31. [Design Remediation Phase Package](31-design-remediation-phase-package.md)
32. [Final Design Production Package](32-final-design-production-package.md)

The Core Foundation is deliberately focused on two user intents:

- Places I want to try.
- Places I have tried.

The full production roadmap expands beyond the original MVP while preserving this foundation and adding security, social, discovery, moderation, and operational maturity in controlled phases.

## Final MVP Decisions

- Authentication uses email and password with JWT access tokens and refresh tokens.
- Social login is out of scope.
- Public lists are visible only to authenticated users.
- Anonymous users cannot access any list.
- Users can create places but cannot edit places in MVP.
- Place detail is part of MVP.
- Search is limited to place-name search only.
- One Add To List action targets one list.
- Adding an existing place to the same list is idempotent and does not create duplicates.
- One rating exists per user per place; repeated rating submission updates the existing rating.
- First rating removes the place from all of that user's lists.
- Tried places may be re-added to lists later and display a Tried indicator.
- Rating notes are private to the rating owner.
- Average rating and rating count are calculated from the ratings table.
