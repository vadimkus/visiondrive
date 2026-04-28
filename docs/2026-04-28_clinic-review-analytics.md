# Clinic Review Analytics

Date: 2026-04-28

## Context

Backlog item 50 asks for a solo-practitioner review overview: requested, replied, published, average rating, and a negative-private-feedback queue.

## Shipped

- Added `/clinic/review-analytics` with 30-day, 90-day, and all-time filters.
- Added `GET /api/clinic/review-analytics/overview`.
- Reuses `ClinicPatientReview`; no new review analytics table.
- Shows requested, replied, published, reply rate, publish rate, average rating, rated review count, and rating distribution.
- Adds a low-rated private feedback queue for ratings of 1-3 that are not archived.
- Links back to `/clinic/reputation` for editing individual review records.
- Added sidebar navigation, dashboard quick action, EN/RU strings, and Knowledge Base guidance.

## Limits

- The first pass uses current review status for request/reply/publish counts.
- It does not yet attribute reviews to external platforms such as Google Maps.
- Negative feedback detection is rating-based; sentiment analysis on notes/comments is not included yet.
