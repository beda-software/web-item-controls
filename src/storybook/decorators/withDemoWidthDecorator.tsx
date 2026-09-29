import type { Decorator } from '@storybook/react-vite';

export const withDemoWidthDecorator: Decorator = (Story) => (
    <div style={{ maxWidth: 960 }}>
        <Story />
    </div>
);
