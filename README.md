# @beda.software/web-item-controls

Reusable FHIR Questionnaire web itemControls and readonly itemControls for Beda-based React applications.

This repository is a package, not a standalone frontend application. Storybook is the local development surface, and the library build publishes only the package entry points described below.

## Public API

Only these package subpaths are supported:

```json
"exports": {
    "./controls": {
        "types": "./dist/controls/index.d.ts",
        "import": "./dist/controls/index.js"
    },
    "./readonly-controls": {
        "types": "./dist/readonly-controls/index.d.ts",
        "import": "./dist/readonly-controls/index.js"
    }
}
```

Use subpath imports:

```ts
import { QuestionString } from '@beda.software/web-item-controls/controls';
import { QuestionString as ReadonlyQuestionString } from '@beda.software/web-item-controls/readonly-controls';
```

The package root is intentionally not a public entry point.

## Styling

Consumers should not import `style.css` directly. The generated public JavaScript entries import `../style.css` automatically after `yarn build:lib` runs `scripts/inject-style-imports.mjs`.

The consuming application bundler must support CSS imports from dependencies.

## Peer Dependencies

The host application owns the main framework, UI, i18n, and FHIR integration versions. Install compatible versions of the package peer dependencies, including:

-   `react`
-   `react-dom`
-   `antd`
-   `styled-components`
-   `react-hook-form`
-   `sdc-qrf`
-   `@beda.software/fhir-react`
-   `@beda.software/fhir-questionnaire`
-   `@lingui/cli`
-   `@lingui/core`
-   `@lingui/macro`
-   `@lingui/react`
-   `axios`
-   `rc-picker`

This repository also keeps matching development dependencies so Storybook, tests, and local builds can run here.

## Local Development

Install dependencies:

```sh
yarn install
```

Compile Lingui catalogs:

```sh
yarn compile
```

Start Storybook:

```sh
yarn start
```

`yarn storybook` is equivalent to `yarn start`.

## Build And Validation

Build the package:

```sh
yarn build:lib
```

Validate generated package shape:

```sh
yarn check:package
```

Smoke test a packed tarball in a temporary consumer project:

```sh
yarn smoke:package
```

Run TypeScript checks:

```sh
yarn typecheck
```

CI runs the package build, package output check, tarball smoke test, typecheck, lint/format checks, Storybook checks, and tests.

## Publishing And Consumption Notes

The package is currently marked `"private": true`.

`@beda.software/fhir-questionnaire` is still referenced as a git dependency/peer. Consumers need access to that git source until it is replaced by a registry version or pinned release.

Some controls depend on Beda/Aidbox/FHIR runtime services and configuration. Consumers should provide the expected host application context, including compatible FHIR, Lingui, Ant Design, and styled-components setup.

## License

See [LICENSE](LICENSE).
