import type { Meta, StoryObj } from '@storybook/react';

// ColorSchemedecorator is not compatible with storybook tests
/* import { withColorSchemeDecorator } from 'src/storybook/decorators'; */

import { CONTEXT, WIZARD_ITEM, WithGroupWizardProviderDecorator, testScrollTo } from './GroupWizard.stories.utils';
import { GroupWizardVertical, GroupWizardWithTooltips } from './index';

const meta: Meta<typeof GroupWizardVertical> = {
    title: 'Questionnaire / questions / group / wizard',
    component: GroupWizardVertical,
    decorators: [WithGroupWizardProviderDecorator],
};

export default meta;
type Story = StoryObj<typeof GroupWizardVertical>;

export const Vertical: Story = {
    play: testScrollTo(WIZARD_ITEM),
    render: () => <GroupWizardVertical parentPath={[]} questionItem={WIZARD_ITEM} context={CONTEXT} />,
};

export const WithTooltips: Story = {
    play: testScrollTo(WIZARD_ITEM),
    render: () => <GroupWizardWithTooltips parentPath={[]} questionItem={WIZARD_ITEM} context={CONTEXT} />,
};
