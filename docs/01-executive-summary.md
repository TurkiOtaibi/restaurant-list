# 1. Executive Summary

## Product Name

Restaurant & Cafe Wishlist Tracker

## Product Vision

سجل is a simple personal organization application that helps users keep track of restaurants, cafes, and ice cream places they want to try, mark places they have tried, and rate those places after visiting.

The core product promise is:

> Places I want to try and places I have tried.

The application is intentionally not a maps product, location product, review marketplace, restaurant discovery platform, social network, or AI recommendation tool.

## Problem Statement

People often collect restaurant and cafe recommendations from conversations, social media, friends, and memory, but they lack a lightweight way to organize those places into personal lists and later remember what they tried and how they felt about it.

Existing products often focus on discovery, maps, business listings, photos, reviews, and social engagement. This MVP avoids that complexity and focuses on a narrower job:

- Save places into personal wishlist lists.
- Browse places from one Places screen with internal filters for restaurants, cafes, and ice cream.
- Mark a place as tried.
- Rate a tried place from 1 to 10.
- Keep personal tried history and community rating aggregates.
- Re-add a tried place to a list later while preserving Tried status.

## MVP Positioning

The MVP is a personal tracker with limited public sharing.

Users can create public or private lists. Public lists can be viewed only by authenticated users, but the product does not include social feeds, following, comments, notifications, moderation workflows, photos, maps, or branch management.

## Primary Users

- Users who maintain a personal wishlist of restaurants and cafes.
- Users who want lightweight personal ratings after trying places.
- Users who want to share selected lists publicly without building a social profile or feed.

## Business Value

The product creates value by:

- Reducing friction for saving places to try later.
- Giving users a clean personal archive of tried restaurants and cafes.
- Providing simple community rating context through average rating and rating count.
- Establishing a focused domain model that can support future expansion without overbuilding the MVP.

## MVP Outcomes

The MVP is successful when a user can:

- Create and manage lists.
- Add an existing place or create a new place.
- Browse all places by primary type.
- Add places to one or more lists.
- Mark a place as tried with a mandatory 1 to 10 rating.
- Edit their rating later.
- See tried places and personal rating history.
- View community average rating and rating count.
- Control whether each list is public or private.
- Search existing places by name only.
- Open a place detail screen.

## Core Product Constraints

The MVP must exclude:

- Maps.
- GPS.
- Branch management.
- Neighborhoods.
- Restaurant discovery.
- Social feeds.
- Following users.
- Comments.
- Photos.
- AI recommendations.
- Notifications.
- Admin moderation workflows.
- Google login.
- Apple login.
- Social login.
- Public share URLs.
- User-facing place editing.

## Strategic Product Principle

Every MVP feature must support at least one of these two primary user states:

- I want to try this place.
- I have tried this place.

If a feature primarily supports discovery, location, social interaction, business listing management, or content moderation, it is outside the MVP.

## Final Readiness Position

After audit remediation, the package is ready for Sprint 0 planning. Engineering should treat the updated functional requirements, business rules, API specification, QA strategy, and traceability matrix as the authoritative implementation baseline.
