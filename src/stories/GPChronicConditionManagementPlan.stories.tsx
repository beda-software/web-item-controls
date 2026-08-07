import type { Meta, StoryObj } from '@storybook/react';
import { QuestionItems } from 'sdc-qrf';

import { withColorSchemeDecorator } from 'src/storybook/decorators';

import {
    CONTEXT,
    QUESTIONNAIRE,
    WithGPChronicConditionManagementPlanProviderDecorator,
} from './GPChronicConditionManagementPlan.stories.utils';

function GPChronicConditionManagementPlanForm() {
    return <QuestionItems questionItems={QUESTIONNAIRE.item ?? []} parentPath={[]} context={CONTEXT[0]!} />;
}

const meta: Meta<typeof GPChronicConditionManagementPlanForm> = {
    title: 'Questionnaire / examples / GP Chronic Condition Management Plan',
    component: GPChronicConditionManagementPlanForm,
    decorators: [withColorSchemeDecorator, WithGPChronicConditionManagementPlanProviderDecorator],
};

export default meta;
type Story = StoryObj<typeof GPChronicConditionManagementPlanForm>;

export const Default: Story = {
    render: () => <GPChronicConditionManagementPlanForm />,
};
