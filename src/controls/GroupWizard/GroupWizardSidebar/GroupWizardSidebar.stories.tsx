import type { Meta, StoryObj } from '@storybook/react';
import { expect, screen, waitFor, within } from 'storybook/test';

import { GroupWizardBus } from 'src/controls/GroupWizard';

import {
    CONTEXT,
    GOALS_AND_TASKS_ITEM,
    WithGroupWizardSidebarProviderDecorator,
} from './GroupWizardSidebar.stories.utils';
import { GroupWizardSidebar } from './index';

const meta: Meta<typeof GroupWizardSidebar> = {
    title: 'Questionnaire / questions / group / wizard-sidebar',
    component: GroupWizardSidebar,
    decorators: [WithGroupWizardSidebarProviderDecorator],
};

export default meta;
type Story = StoryObj<typeof GroupWizardSidebar>;

export const Default: Story = {
    render: () => <GroupWizardSidebar parentPath={[]} questionItem={GOALS_AND_TASKS_ITEM} context={CONTEXT} />,
};

export const ExpandAndSelectSubgroup: Story = {
    render: () => <GroupWizardSidebar parentPath={[]} questionItem={GOALS_AND_TASKS_ITEM} context={CONTEXT} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        // A single top-level instance has no collapse toggle - its subgroups are always visible. "Interventions
        // and actions" (itemControl `gtable`) is walked/split just like a plain subgroup, so it starts with no
        // instances until one is added via its header.
        const interventionsHeader = await canvas.findByTestId(
            'sidebar-menu-add-plan-goalstasks-details-interventionsactions',
        );
        interventionsHeader.click();

        const subgroupRow = await canvas.findByTestId(
            'sidebar-menu-row-plan-goalstasks.items.0.plan-goalstasks-details-interventionsactions.items.0',
        );
        subgroupRow.click();

        await waitFor(() => expect(canvas.getByText('Interventions and actions')).toBeInTheDocument());
    },
};

export const InnerGroupHeaderAdd: Story = {
    render: () => <GroupWizardSidebar parentPath={[]} questionItem={GOALS_AND_TASKS_ITEM} context={CONTEXT} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        const goalSettingHeader = await canvas.findByTestId('sidebar-menu-add-plan-goalstasks-details-goalsetting');
        expect(canvas.getByText('Goal setting')).toBeInTheDocument();
        expect(canvas.queryByText('Add Goal setting')).not.toBeInTheDocument();

        goalSettingHeader.click();

        await waitFor(() =>
            expect(
                canvas.getByTestId(
                    'sidebar-menu-row-plan-goalstasks.items.0.plan-goalstasks-details-goalsetting.items.0',
                ),
            ).toBeInTheDocument(),
        );
        // The header stays - it isn't replaced by a numbered row or a trailing "Add Goal setting" text line.
        expect(canvas.getByTestId('sidebar-menu-add-plan-goalstasks-details-goalsetting')).toBeInTheDocument();
        expect(canvas.queryByText('Add Goal setting')).not.toBeInTheDocument();
    },
};

export const SubgroupShowsParentPreview: Story = {
    render: () => <GroupWizardSidebar parentPath={[]} questionItem={GOALS_AND_TASKS_ITEM} context={CONTEXT} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        const goalSettingHeader = await canvas.findByTestId('sidebar-menu-add-plan-goalstasks-details-goalsetting');
        goalSettingHeader.click();

        const goalSettingRow = await canvas.findByTestId(
            'sidebar-menu-row-plan-goalstasks.items.0.plan-goalstasks-details-goalsetting.items.0',
        );
        goalSettingRow.click();

        // The ancestor ("Goals and tasks 1") preview is a heading, distinct from the plain sidebar row label -
        // its own field(s), like "Problems/Needs", render alongside it as a read-only preview. QuestionChoice
        // (used for the "open-choice" Problems/Needs field) tags its Form.Item with a fixed
        // data-testid="question-choice" and carries the linkId separately via data-linkid.
        await waitFor(() =>
            expect(canvas.getByRole('heading', { name: 'Goals and tasks 1', level: 5 })).toBeInTheDocument(),
        );
        expect(canvasElement.querySelector('[data-linkid="plan-goalstasks-problemneed"]')).toBeInTheDocument();
    },
};

export const TopLevelAccordion: Story = {
    render: () => <GroupWizardSidebar parentPath={[]} questionItem={GOALS_AND_TASKS_ITEM} context={CONTEXT} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await canvas.findByTestId('sidebar-menu-row-plan-goalstasks.items.0');
        expect(canvas.queryByTestId('sidebar-menu-toggle-plan-goalstasks.items.0')).not.toBeInTheDocument();

        const addButton = await canvas.findByTestId('sidebar-menu-add-plan-goalstasks');
        addButton.click();

        // Adding the 2nd instance expands it and collapses the 1st; the toggle is now enabled for both.
        const toggle0 = await canvas.findByTestId('sidebar-menu-toggle-plan-goalstasks.items.0');
        const toggle1 = await canvas.findByTestId('sidebar-menu-toggle-plan-goalstasks.items.1');

        await waitFor(() => expect(toggle1).toHaveAttribute('aria-label', 'Collapse'));
        expect(toggle0).toHaveAttribute('aria-label', 'Expand');

        // Collapsing the open item (index 1) opens the next one, wrapping to index 0.
        toggle1.click();
        await waitFor(() => expect(toggle0).toHaveAttribute('aria-label', 'Collapse'));
        expect(toggle1).toHaveAttribute('aria-label', 'Expand');

        // Uncollapsing item 1 opens it and closes item 0 - only one is ever open.
        toggle1.click();
        await waitFor(() => expect(toggle1).toHaveAttribute('aria-label', 'Collapse'));
        expect(toggle0).toHaveAttribute('aria-label', 'Expand');
    },
};

export const DeleteRequiresConfirmation: Story = {
    render: () => <GroupWizardSidebar parentPath={[]} questionItem={GOALS_AND_TASKS_ITEM} context={CONTEXT} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        const removeButton = await canvas.findByTestId('sidebar-menu-remove-plan-goalstasks.items.0');
        removeButton.click();

        // Popconfirm renders its popup in a portal outside canvasElement, so it must be queried via the
        // document-scoped `screen`, not `within(canvasElement)`.
        await waitFor(() => expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument());

        const confirmButton = await screen.findByText('OK');
        confirmButton.click();

        await waitFor(() =>
            expect(canvas.queryByTestId('sidebar-menu-row-plan-goalstasks.items.0')).not.toBeInTheDocument(),
        );
    },
};

export const AddViaBus: Story = {
    render: () => <GroupWizardSidebar parentPath={[]} questionItem={GOALS_AND_TASKS_ITEM} context={CONTEXT} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await canvas.findByTestId('sidebar-menu-row-plan-goalstasks.items.0');

        GroupWizardBus.dispatch({ type: 'sidebarAddElement', groupLinkId: 'plan-goalstasks' });

        await waitFor(() => expect(canvas.getByTestId('sidebar-menu-row-plan-goalstasks.items.1')).toBeInTheDocument());
    },
};
