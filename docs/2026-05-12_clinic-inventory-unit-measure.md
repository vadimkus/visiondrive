# 2026-05-12 - Clinic Inventory Unit Measure

## Context

Vadim asked to add volume/unit handling for stock items so practitioners can choose ml or grams from a dropdown while still typing a custom measure.

## Shipped

- New stock item form now uses a unit-of-measure input with suggestions: `ml`, `мл`, `g`, `г`, `pcs`, `шт`, `unit`, `pack`, `vial`, `ampoule`, `syringe`.
- New stock item defaults to `шт` in Russian and `pcs` in English so reorder alerts are naturally entered in pieces for normal stock.
- Stock item edit form uses the same suggested unit input.
- Russian label changed from `Единица` to `Мера измерения`.
- Russian reorder label changed to `Оповещать по остатку`, with hint text clarifying that the threshold uses the selected unit.
- Stock quantity, reorder, movement, and consume-per-visit labels now show the selected unit where useful.
- Procedure bill-of-materials entry hints show the selected stock item's unit.
- Product import aliases now recognize `measure`, `volume`, `мера`, `объем`, and `обьем` as unit columns.

## Validation

- Run TypeScript and linter diagnostics after the UI change.
