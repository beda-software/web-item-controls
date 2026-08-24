import type { Meta, StoryObj } from '@storybook/react';
import { FCEQuestionnaireItem } from 'sdc-qrf';

import { GroupWizardSidebar } from 'src/controls/GroupWizard/GroupWizardSidebar';
import {
    CONTEXT,
    GOALS_AND_TASKS_ITEM,
    WithGroupWizardSidebarProviderDecorator,
} from 'src/controls/GroupWizard/GroupWizardSidebar/GroupWizardSidebar.stories.utils';
import { GROUP_HIDE_ADD_ITEM_BUTTON_EXTENSION_URL } from 'src/utils/constants';

const HIDDEN_ADD_ITEM: FCEQuestionnaireItem = {
    ...GOALS_AND_TASKS_ITEM,
    extension: [{ url: GROUP_HIDE_ADD_ITEM_BUTTON_EXTENSION_URL, valueBoolean: true }],
};

const meta: Meta<typeof GroupWizardSidebar> = {
    title: 'GroupHideAddItemButton / GroupWizardSidebar',
    component: GroupWizardSidebar,
    decorators: [WithGroupWizardSidebarProviderDecorator],
};

export default meta;
type Story = StoryObj<typeof GroupWizardSidebar>;

export const AddButtonVisible: Story = {
    render: () => <GroupWizardSidebar parentPath={[]} questionItem={GOALS_AND_TASKS_ITEM} context={CONTEXT} />,
};

export const AddButtonHidden: Story = {
    render: () => <GroupWizardSidebar parentPath={[]} questionItem={HIDDEN_ADD_ITEM} context={CONTEXT} />,
};
