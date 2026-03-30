# Generated Reports

This directory stores raw reports produced by engine adapters before capture.

Typical flow:

1. `npm run reports:generate -- --engine codex --from-manifest demo-api-kisa-report --capture-id demo-api-kisa-live`
2. raw report is written here
3. the report is copied into `artifacts/captures/<capture-id>/`
4. the captured report is scored and indexed

These files are useful for debugging adapter behavior before or after capture.
