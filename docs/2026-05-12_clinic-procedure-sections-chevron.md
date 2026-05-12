# 2026-05-12 - Clinic Procedure Sections Chevron

## Context

Vadim asked to put the procedure public questionnaire and recommendation library blocks under chevrons and keep them closed by default.

## Shipped

- Existing procedure cards now show `Public questionnaire / Вопросы публичной анкеты` as a collapsed chevron section.
- Existing procedure cards now show `Aftercare library / Библиотека рекомендаций` as a collapsed chevron section.
- Each procedure has independent open/closed state for those sections.
- Form state and save/archive behavior are unchanged; this is a UI simplification only.

## Validation

- Run TypeScript and linter diagnostics after the UI change.
