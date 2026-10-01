import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { expect, waitFor } from 'storybook/test';

import { GroupTabs } from './index';
import {
    CONTEXT,
    WIZARD_ITEM,
    WithGroupWizardProviderDecorator,
    testScrollTo,
} from '../GroupWizard/GroupWizard.stories.utils';

const meta: Meta<typeof GroupTabs> = {
    title: 'Questionnaire / questions / group / tabs',
    component: GroupTabs,
    decorators: [WithGroupWizardProviderDecorator],
};

export default meta;
type Story = StoryObj<typeof GroupTabs>;

export const Tabs: Story = {
    play: testScrollTo(WIZARD_ITEM),
    render: () => <GroupTabs parentPath={[]} questionItem={WIZARD_ITEM} context={CONTEXT} />,
};

const REQUIRED_FIELD_ERRORS = [
    'wizard.items.personal-info.items.first-name',
    'wizard.items.personal-info.items.last-name',
    'wizard.items.health-info.items.age',
];

function GroupTabsWithValidationErrors() {
    const { setError } = useFormContext();

    useEffect(() => {
        REQUIRED_FIELD_ERRORS.forEach((name) => setError(name, { type: 'required', message: 'Required' }));
    }, [setError]);

    return <GroupTabs parentPath={[]} questionItem={WIZARD_ITEM} context={CONTEXT} />;
}

export const WithValidationErrors: Story = {
    play: async ({ canvas }) => {
        await waitFor(() => expect(canvas.getByTestId('group-tab-errors-count-personal-info')).toHaveTextContent('2'));
        expect(canvas.getByTestId('group-tab-errors-count-health-info')).toHaveTextContent('1');
        expect(canvas.queryByTestId('group-tab-errors-count-contact-details')).not.toBeInTheDocument();
        expect(canvas.queryByTestId('group-tab-errors-count-additional-notes')).not.toBeInTheDocument();
        expect(canvas.getByTestId('group-tab-personal-info')).toHaveAttribute('data-has-errors', 'true');
        expect(canvas.getByTestId('group-tab-contact-details')).toHaveAttribute('data-has-errors', 'false');
    },
    render: () => <GroupTabsWithValidationErrors />,
};
