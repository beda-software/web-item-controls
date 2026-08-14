import type { Meta, StoryObj } from '@storybook/react';

// ColorSchemeDecorator is not compatible with storybook tests (see GroupWizard.stories.tsx).
import {
    CONTEXT,
    ROOT_ITEM,
    WithGroupAccordionProviderDecorator,
    testExpandSibling,
} from './GroupAccordionExpandBus.stories.utils';
import { Group } from './index';

const meta: Meta<typeof Group> = {
    title: 'Questionnaire / questions / group / accordion / expand via bus',
    component: Group,
    decorators: [WithGroupAccordionProviderDecorator],
};

export default meta;
type Story = StoryObj<typeof Group>;

export const ExpandSiblingViaBus: Story = {
    play: testExpandSibling(),
    render: () => <Group questionItem={ROOT_ITEM} parentPath={[]} context={CONTEXT} />,
};
