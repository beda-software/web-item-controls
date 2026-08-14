# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

`@beda.software/web-item-controls` is a **library package**, not a standalone app. It provides FHIR Questionnaire
"itemControl" React components (form controls and their readonly counterparts) that render SDC (Structured Data
Capture) Questionnaires for Beda-based React applications. Storybook is the primary local development surface —
there is no app to run beyond it.

Only two subpaths are public: `@beda.software/web-item-controls/controls` and
`@beda.software/web-item-controls/readonly-controls` (plus `/contexts` and `/components`). The package root
(`src/index.ts`) is intentionally not a consumable entry point — it only pulls in global styles.

## Commands

```sh
yarn start                 # Storybook dev server on :6006 (equivalent to `yarn storybook`)
yarn build:lib             # Build the library (vite.lib.config.ts) + inject style.css imports into dist entries
yarn typecheck             # tsc --noEmit
yarn lint                  # eslint src --ext ts,tsx --max-warnings 0
yarn extract               # lingui extract -> updates src/locale/*/messages.po
yarn compile               # lingui compile --typescript -> generates message catalogs consumed by lingui/macro
yarn test                  # vitest --no-threads
yarn test-storybook        # storybook test-runner against a built Storybook (used in CI, needs build-storybook first)
```

Before starting `yarn start`/Storybook or any other long-running dev process, check whether it's already running
(e.g. `lsof -i :6006`, or just ask) instead of blindly launching a second instance — the user is often already
running it.

Run a single test file or test name with vitest directly, e.g.:

```sh
yarn vitest run src/controls/GroupWizard/__tests__/GroupWizard.test.tsx
yarn vitest run -t "wizard renders group"
```

Many tests exercise real FHIR resources against a live Aidbox instance (via `@beda.software/fhir-react` /
`aidbox-react`, see `src/setupTests.ts`, `src/services/fhir.ts`). To run the full suite as CI does, bring up the
test backend first:

```sh
make up-test     # starts Aidbox + seeds via docker-compose.tests.yaml
yarn test
make down-test
make logs-test   # tail backend logs if a test run fails
```

`yarn compile` must be run before typecheck/lint/build/test in a fresh checkout — lingui macros resolve against the
compiled catalogs. `contrib/emr-config/config.js` must exist (copy `contrib/emr-config/config.local.js` if missing)
before running the suite locally; CI does this via `cp contrib/emr-config/config.local.js contrib/emr-config/config.js`.

The `prepare` script (`husky install && yarn compile && yarn build:lib`) runs on install. A pre-commit hook runs
`yarn typecheck` and `lint-staged` (eslint --fix + prettier --write on staged `.ts(x)`/`.js(x)` files).

## Architecture

### Registry pattern: itemControl → component

The core of this package is a **mapping from FHIR Questionnaire item-control codes to React components**, consumed
by `sdc-qrf`'s questionnaire renderer:

- `src/controls/controls.tsx` exports `questionItemComponents`, `groupItemComponent`,
  `itemControlQuestionItemComponents`, and `itemControlGroupItemComponents` — these map Questionnaire item `type`
  (e.g. `string`, `choice`, `attachment`) and item-control extension codes (e.g. `slider`, `wizard`, `group-tabs`,
  `blood-pressure`) to the editable control components in `src/controls/*`.
- `src/readonly-controls/readonly-controls.tsx` is the equivalent mapping to the readonly/display components in
  `src/readonly-controls/*`, used for read-only rendering of the same questionnaires (e.g. summaries, PDFs).

When adding a new control, the component itself is not enough — it must also be wired into the relevant mapping in
`controls.tsx` / `readonly-controls.tsx` and re-exported from `src/controls/index.ts` /
`src/readonly-controls/index.ts` to be part of the public API (see `vite.lib.config.ts` build entries).

### Control component conventions

Editable controls live under `src/controls/<Name>/index.tsx` and follow this shape (see `src/controls/String` as a
minimal example):

- Accept `{ parentPath, questionItem }: QuestionItemProps` from `sdc-qrf`.
- Build the RHF field path as `[...parentPath, linkId, 0, 'value', <fhirType>]`.
- Call `useFieldController` (`src/components/BaseQuestionnaireResponseForm/hooks.tsx`) — a wrapper around
  `@beda.software/fhir-questionnaire`'s `useFieldController` that additionally builds antd `Form.Item` props
  (label, validation state, hidden state) from the questionnaire item's metadata.
- Render an antd form control bound to `value`/`onChange`/`disabled`/`onBlur`/`placeholder` from the controller.

Each control typically ships a co-located `*.stories.tsx` using `WithQuestionFormProviderDecorator` and
`withColorSchemeDecorator` (`src/storybook/decorators`) to render in isolation without a real questionnaire form.

Readonly controls under `src/readonly-controls/<Name>` follow the analogous display-only shape.

### Supporting layers

- `src/services/*` — FHIR/Aidbox client setup (`fhir.ts`), auth (`auth.ts`), questionnaire loading
  (`questionnaire.ts`), valueset expansion, file upload.
- `src/contexts/*` — React contexts consumed by controls (markdown editor config, valueset-expand).
- `src/sharedState/*` — cross-component shared state (current user/patient/practitioner/org) via
  `@beda.software/fhir-react`'s `createSharedState`.
- `src/utils/*` — FHIR/questionnaire helpers: `enableWhen.ts` (conditional item visibility), `fhirpath.ts`,
  `questionnaire.ts`, `extract.ts`, date/theme/unit helpers.
- `src/theme` — the `ThemeProvider` used by tests/stories.
- `src/components/*` — generic UI building blocks (Table, Select, Modal, SearchBar, DatePicker, TimePicker,
  Spinner) exported as their own public subpath, independent of the questionnaire item-control system.
- `src/components/BaseQuestionnaireResponseForm/*` — the shared plumbing (`useFieldController`, `FieldLabel`,
  error-message formatting) that every question control builds on.

### Peer dependency boundary

The host application owns versions of React, antd, styled-components, react-hook-form, sdc-qrf,
`@beda.software/fhir-react`, `@beda.software/fhir-questionnaire`, Lingui, axios, and rc-picker (see
`peerDependencies` in `package.json`). This repo keeps matching devDependencies only to run Storybook/tests/build
locally — don't add runtime imports that assume a specific peer version beyond what's declared.

### Styling

Consumers must not import `style.css` directly — `scripts/inject-style-imports.mjs` (run as part of
`yarn build:lib`) prepends a `style.css` import into the built `controls/index.js` and `readonly-controls/index.js`
entry files after Vite's build step.

### i18n

All user-facing strings go through Lingui macros (`@lingui/macro`), enforced by the `string-to-lingui/t-call-in-function`
eslint rule. Locales live in `src/locale/{en,es,ru,de}`; run `yarn extract` after adding/changing strings, then
`yarn compile` to regenerate the TypeScript catalogs before typecheck/build.

## Import conventions

- Use the `src/*` path alias for internal imports (configured in `tsconfig.json`, `vite.config.ts`, and eslint's
  `import/resolver`), not relative `../../..` paths across directories.
- Import order is enforced by eslint (`import/order`): builtin → external (with `aidbox-react/**` and
  `@beda.software/**` grouped after other externals) → internal `src/**` → relative, alphabetized within each
  group, blank line between groups.
