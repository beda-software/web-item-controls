/// <reference types="vitest/config" />
import { createRequire } from 'module';
import * as path from 'path';

import { transformAsync } from '@babel/core';
import { lingui } from '@lingui/vite-plugin';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
// eslint-disable-next-line import/default -- eslint-import-resolver-typescript misreads this package's dual CJS/ESM default export
import react from '@vitejs/plugin-react';
import yaml from 'js-yaml';
import { defineConfig, type Plugin } from 'vite';
import turbosnap from 'vite-plugin-turbosnap';

const require = createRequire(import.meta.url);

const linguiMacroVitestStub = path.resolve(__dirname, 'src/__tests__/mocks/lingui-macro.tsx');

/** Resolve `@lingui/macro` before `@lingui/vite-plugin` (which throws on bare macro resolution). Vitest can resolve macros before Babel strips them. Only used by the `unit` test project. */
function vitestLinguiMacroStubResolve(): Plugin {
    return {
        name: 'vitest-lingui-macro-stub-resolve',
        enforce: 'pre',
        resolveId(id) {
            if (id === '@lingui/macro' || id.startsWith('@lingui/macro/')) {
                return linguiMacroVitestStub;
            }
            return undefined;
        },
    };
}

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
    server: {
        port: command === 'build' ? 5000 : 3000,
    },
    plugins: [
        {
            name: 'yaml-loader',
            transform(code, id) {
                if (!/\.ya?ml$/.test(id)) {
                    return;
                }
                return { code: `export default ${JSON.stringify(yaml.load(code))};`, map: null };
            },
        },
        {
            name: 'compile-fhir-questionnaire-macros',
            enforce: 'pre',
            async transform(code, id) {
                if (id.includes('@beda.software/fhir-questionnaire') && /\.[tj]sx?$/.test(id)) {
                    if (code.includes('@lingui/macro')) {
                        const result = await transformAsync(code, {
                            filename: id,
                            plugins: ['macros'],
                            presets: ['@babel/preset-typescript'],
                            babelrc: false,
                            configFile: false,
                        });
                        return result?.code;
                    }
                }
            },
        },
        ...[
            react({
                include: [/\.[tj]sx?$/, /@beda\.software\/fhir-questionnaire/],
                babel: {
                    plugins: [
                        'macros',
                        [
                            'babel-plugin-styled-components',
                            {
                                displayName: true,
                                fileName: true,
                                meaninglessFileNames: ['index', 'styles'],
                            },
                        ],
                    ],
                },
            }),
            lingui(),
        ],
        command === 'build' ? [turbosnap({ rootDir: process.cwd() })] : [],
    ],
    define: {
        'process.env': {},
    },
    resolve: {
        alias: [{ find: 'src', replacement: path.resolve(__dirname, './src/') }],
    },
    optimizeDeps: {
        exclude: ['@beda.software/fhir-questionnaire'],
    },
    build: {
        outDir: path.resolve(__dirname, 'build'),
        commonjsOptions: {
            defaultIsModuleExports(id) {
                try {
                    const module = require(id);
                    if (module?.default) {
                        return false;
                    }
                    return 'auto';
                } catch (error) {
                    return 'auto';
                }
            },
            transformMixedEsModules: true,
        },
    },
    test: {
        projects: [
            {
                extends: true,
                plugins: [vitestLinguiMacroStubResolve()],
                test: {
                    name: 'unit',
                    include: ['src/**/*.test.{ts,tsx}'],
                    globals: true, // To use the Vitest APIs globally like Jest
                    environment: 'jsdom', // https://vitest.dev/config/#environment
                    setupFiles: 'src/setupTests.ts', //  https://vitest.dev/config/#setupfiles
                    server: {
                        deps: {
                            inline: [/@beda\.software\/fhir-questionnaire/],
                        },
                    },
                },
            },
            {
                // Runs every story as a test in a real browser - https://storybook.js.org/docs/writing-tests/integrations/vitest-addon
                extends: true,
                plugins: [storybookTest({ configDir: path.join(__dirname, '.storybook') })],
                resolve: {
                    // The addon pre-bundles dependencies without the `browser` export condition, so packages
                    // with separate Node/browser builds (axios via @beda.software/remote-data, jose) get their
                    // Node build and crash in the browser. Storybook itself resolves these correctly.
                    conditions: ['browser', 'module', 'import', 'default'],
                },
                test: {
                    name: 'storybook',
                    browser: {
                        enabled: true,
                        headless: true,
                        provider: 'playwright',
                        instances: [{ browser: 'chromium' }],
                    },
                    setupFiles: ['.storybook/vitest.setup.ts'],
                },
            },
        ],
    },
}));
