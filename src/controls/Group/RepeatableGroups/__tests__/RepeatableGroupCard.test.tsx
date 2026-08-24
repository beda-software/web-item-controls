import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { FCEQuestionnaireItem, GroupItemProps } from 'sdc-qrf';
import { beforeAll, describe, expect, test, vi } from 'vitest';

import { ThemeProvider } from 'src/theme';
import { GROUP_HIDE_ADD_ITEM_BUTTON_EXTENSION_URL } from 'src/utils/constants';

import { RepeatableGroupCard } from '../RepeatableGroupCard';
import { RepeatableGroupProps } from '../types';

vi.mock('sdc-qrf', async () => {
    const actual = await vi.importActual<typeof import('sdc-qrf')>('sdc-qrf');
    return {
        ...actual,
        QuestionItems: () => <div data-testid="question-items" />,
    };
});

vi.mock('../RepeatableGroupCard/hooks', () => ({
    useRepeatableGroup: () => ({
        onRemove: vi.fn(),
        parentPath: [],
        context: {},
    }),
}));

function getProps(extension?: FCEQuestionnaireItem['extension']): RepeatableGroupProps {
    const questionItem = {
        linkId: 'card-group',
        type: 'group',
        repeats: true,
        item: [],
        extension,
    } as FCEQuestionnaireItem;

    return {
        index: 0,
        items: [{}],
        onChange: vi.fn(),
        groupItem: {
            parentPath: [],
            context: [{}],
            questionItem,
        } as unknown as GroupItemProps,
    };
}

describe('RepeatableGroupCard', () => {
    beforeAll(() => {
        i18n.activate('en');
    });

    test('renders a remove button by default', () => {
        render(
            <I18nProvider i18n={i18n}>
                <ThemeProvider>
                    <RepeatableGroupCard {...getProps()} />
                </ThemeProvider>
            </I18nProvider>,
        );

        expect(screen.getByTestId('remove-group-button')).toBeInTheDocument();
    });

    test('hides the remove button when GroupHideAddItemButton extension is true', () => {
        render(
            <I18nProvider i18n={i18n}>
                <ThemeProvider>
                    <RepeatableGroupCard
                        {...getProps([{ url: GROUP_HIDE_ADD_ITEM_BUTTON_EXTENSION_URL, valueBoolean: true }])}
                    />
                </ThemeProvider>
            </I18nProvider>,
        );

        expect(screen.queryByTestId('remove-group-button')).not.toBeInTheDocument();
    });
});
