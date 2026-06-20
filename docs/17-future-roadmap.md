# 17. Future Roadmap

## Roadmap Principles

Future features should extend the core tracker without turning the product into a maps app, Yelp clone, discovery platform, or broad social network.

## Phase 1: MVP Stabilization

Potential work:

- Improve empty states based on usage data.
- Add sorting options for lists and tried places.
- Improve place-name search relevance without recommendations or popularity ranking.
- Add account settings.
- Add export of personal lists and ratings.

## Phase 2: Personal Organization Enhancements

Potential work:

- Custom notes on list entries before trying.
- Personal tags on places.
- Favorite tried places.
- Reorder places inside a list.
- Archive lists.
- Duplicate one of the user's own lists.

## Phase 3: Controlled Sharing Enhancements

Potential work:

- Auth-gated public list links.
- Auth-gated copy link action.
- Public profile page showing only public lists.
- Allow users to copy another authenticated user's public list into their own lists.

Decision gates before any sharing enhancement:

- Confirm anonymous access policy.
- Confirm privacy requirements.
- Confirm abuse and indexing risks.
- Confirm the feature does not create a social feed or discovery platform.

## Phase 4: Data Quality Enhancements

Potential work:

- Duplicate suggestion during place creation.
- Operational correction tooling.
- Soft merge workflow.
- Basic audit log for place changes.

Guardrails:

- These are not MVP.
- Do not introduce user-facing place editing without a full permission and QA model.

## Features To Reconsider Carefully

These may create significant product drift:

- Maps and GPS.
- AI recommendations.
- Reviews as public content.
- Photos.
- Comments.
- Following.
- Social feed.
- Business owner pages.
- Reservation integrations.
- Popularity ranking.
- Trending lists.
