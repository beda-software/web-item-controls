import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { Decorator } from '@storybook/react';
import { ThemeProvider } from '../src/theme/ThemeProvider';
import { messages as enMessages } from '../src/locale/en/messages';
import React from 'react';

i18n.load('en', enMessages);
i18n.activate('en');

export const withThemeDecorator: Decorator = (Story) => {
    return (
        <ThemeProvider>
            <Story />
        </ThemeProvider>
    );
};

export const withI18nDecorator: Decorator = (Story) => {
    return (
        <I18nProvider i18n={i18n}>
            <Story />
        </I18nProvider>
    );
};
