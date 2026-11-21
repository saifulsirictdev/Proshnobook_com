# Editable default paper header

## Behavior

- The ordinary question builder starts with the screenshot-style default when no Smart/Dynamic header is enabled: centered bold `প্রশ্নবুক.কম উচ্চ বিদ্যালয় ও কলেজ`, centered `অর্ধ বার্ষিক/বার্ষিক পরীক্ষা -২০২৭`, separate centered class and subject lines, then time left / full marks right.
- A **ডিফল্ট হেডার এডিট করুন** button sits beside the set/shuffle controls. Each displayed default-header field can also be clicked. The editor and printed header share the same six-field layout. Save commits the draft; Cancel/Escape discard it.
- Class and subject follow all currently selected, non-excluded questions. Mixed selections show their distinct values instead of silently choosing one. English class/paper metadata receives Bengali display labels.
- Time follows the existing Page Setup duration. No official duration is inferred: if none is supplied it says `নির্ধারিত নয়`.
- Explicit Page Setup full marks win. Otherwise marks use the existing renderer's MCQ/CQ/SHORT weights (1/10/1), answer quotas and active CQ division; English uses task marks. These are paper-builder scores, not a claim of an official exam blueprint.
- Editing a field creates a persistent override (including intentionally empty text). Each field has its own **অটোতে ফিরুন** action. Saving does not freeze the other automatic fields.
- Ordinary-builder changes use its existing `qb:settings` persistence and saved-paper path. Storage failure leaves the draft open and reports failure rather than claiming a successful save. In the English editor, Save awaits the existing authenticated whole-draft save action; failures remain editable.

## Compatibility and safety

- Smart/Dynamic headers and saved templates take exclusive precedence. Applying one disables the default presentation. **ডিফল্ট হেডারে ফিরুন** restores the default and its prior overrides.
- The new settings member is optional. Restoring/serializing legacy settings does not automatically add it. Approved stock, frozen English release digests, bought-paper initialization and marketplace previews are not rewritten.
- Ordinary-builder UI initialization opts into the default only when no custom header is enabled. Existing enabled English headers, including unnamed reference-model headers, remain enabled until the user explicitly returns to the default.
- The new default uses the bundled Unicode Hind Siliguri family. It does not depend on the historical legacy-encoded Adorsho asset having Unicode Bangla glyphs.
- Text is rendered as React text, not HTML. Overrides are bounded to 2,000 characters per field. No database migration, stock import/approval, or external provider call is required.
- Editing controls never enter printed output. Whole-paper default values are passed into recursive section/answer/OMR previews to avoid deriving a different total from a page fragment.

## Checks

- `node --test tests/default-paper-header.test.cjs`: settings round trips, automatic selection changes, per-field overrides/reset, mixed selections, quotas/divisions/English marks, custom-header precedence, input isolation and safe shared rendering.
- `NODE_PATH=<tools>/node_modules CHROMIUM_EXECUTABLE_PATH=<chrome> node scripts/paper-browser/default-header-check.cjs`: real shared editor + paper preview at desktop/mobile widths; toolbar activation, focus, field-click activation, cancel/Escape, save/reload, auto/override/reset, failed save, custom-header exclusivity, horizontal editor fit, print hiding and PDF output. Uses only synthetic fixtures. CI runs it alongside existing PDF regressions.
- `npm run typecheck`, `npm run test:security`, `npm run build`.

Browser fixtures validate the real components but do not claim an authenticated production-user session or a physical printed-paper inspection.
