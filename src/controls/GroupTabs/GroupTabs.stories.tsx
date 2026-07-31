import type { Meta, StoryObj } from '@storybook/react';

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
