import path from 'path';

import { lingui } from '@lingui/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { externalizeDeps } from 'vite-plugin-externalize-deps';

import dts from '@beda.software/vite-plugin-dts';

export default defineConfig({
    plugins: [
        react({
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
        dts({ entryRoot: 'src/', exclude: ['node_modules/**', '**/*.stories.ts*'] }),
        externalizeDeps(),
    ],
    resolve: {
        alias: [{ find: 'src', replacement: path.resolve(__dirname, './src/') }],
    },
    build: {
        copyPublicDir: false,
        lib: {
            entry: [
                path.resolve(__dirname, 'src/controls/index.ts'),
                path.resolve(__dirname, 'src/readonly-controls/index.ts'),
            ],
            formats: ['es'],
            fileName: (format, entryName) => `${entryName}.js`,
        },
        rollupOptions: {
            output: {
                preserveModules: true,
                preserveModulesRoot: 'src/',
                entryFileNames: (chunkInfo) => {
                    if (chunkInfo.name.includes('node_modules')) {
                        return chunkInfo.name.replace(/node_modules/g, 'ext') + '.js';
                    }

                    return '[name].js';
                },
            },
        },
    },
});
