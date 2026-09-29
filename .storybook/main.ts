import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
    stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],

    addons: [
        getAbsolutePath('@storybook/addon-links'),
        getAbsolutePath('@storybook/addon-themes'),
        getAbsolutePath('@chromatic-com/storybook'),
        getAbsolutePath('@storybook/addon-mcp'),
        getAbsolutePath('@storybook/addon-vitest'),
    ],

    framework: {
        name: getAbsolutePath('@storybook/react-vite'),
        options: {},
    },

    docs: {},

    typescript: {
        reactDocgen: 'react-docgen-typescript',
    },
};
export default config;

function getAbsolutePath(value: string): any {
    return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
