# 2026-05-12 - Clinic Knowledge Base Search And Smart Forms Cleanup

## Context

Vadim reported that Knowledge Base search appeared not to work and asked to delete the smart questionnaire/intake functionality from the Knowledge Base surface.

## Shipped

- Removed Knowledge Base-facing smart questionnaire/intake article content in EN/RU.
- Removed intake/questionnaire wording from the Practice OS capability map and workflow guidance.
- Fixed Knowledge Base search UX so typing immediately hides the capabilities/workflow overview and shows article results near the top of the page.
- Improved search matching by normalizing case, trimming whitespace, handling `ё`, searching categories, and matching multi-word queries across article title, summary, and steps.

## Notes

- This cleanup removes the feature from the Knowledge Base presentation only. Underlying service-specific intake APIs remain in the codebase unless a separate product decision is made to remove them from the app.
