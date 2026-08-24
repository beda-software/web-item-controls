import { render, screen } from '@testing-library/react';
import { FCEQuestionnaireItem, GroupItemProps } from 'sdc-qrf';
import { describe, expect, test, vi } from 'vitest';

import { GROUP_HIDE_ADD_ITEM_BUTTON_EXTENSION_URL } from 'src/utils/constants';

import { RepeatableGroupRow } from '../RepeatableGroupRow';
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
        linkId: 'row-group',
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

describe('RepeatableGroupRow', () => {
    test('renders a delete button by default', () => {
        render(<RepeatableGroupRow {...getProps()} />);

        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('hides the delete button when GroupHideAddItemButton extension is true', () => {
        render(
            <RepeatableGroupRow
                {...getProps([{ url: GROUP_HIDE_ADD_ITEM_BUTTON_EXTENSION_URL, valueBoolean: true }])}
            />,
        );

        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
});
