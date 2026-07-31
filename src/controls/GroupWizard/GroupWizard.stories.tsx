import type { Decorator, Meta, StoryObj } from '@storybook/react';
import { expect, waitFor } from '@storybook/test';
import { Questionnaire, QuestionnaireResponse } from 'fhir/r4b';
import { FormProvider, useForm } from 'react-hook-form';
import { FCEQuestionnaireItem, FormItems, ItemContext, QuestionnaireResponseFormProvider } from 'sdc-qrf';

import { BaseQuestionnaireResponseFormPropsContext } from '@beda.software/fhir-questionnaire/contexts';
import { success } from '@beda.software/remote-data';

import s from 'src/components/BaseQuestionnaireResponseForm/BaseQuestionnaireResponseForm.module.scss';
import { ValueSetExpandProvider } from 'src/contexts';
import { questionItemComponents } from 'src/controls';
// ColorSchemedecorator is not compatible with storybook tests
/* import { withColorSchemeDecorator } from 'src/storybook/decorators'; */

import { GroupWizardVertical, GroupWizardWithTooltips, GroupWizardBus } from './index';
import { GroupTabs } from '../GroupTabs';

const WIZARD_ITEM: FCEQuestionnaireItem = {
    linkId: 'wizard',
    type: 'group',
    item: [
        {
            linkId: 'personal-info',
            text: 'Personal info',
            type: 'group',
            item: [
                {
                    linkId: 'first-name',
                    text: 'First name',
                    type: 'string',
                    required: true,
                },
                {
                    linkId: 'last-name',
                    text: 'Last name',
                    type: 'string',
                    required: true,
                },
            ],
        },
        {
            linkId: 'contact-details',
            text: 'Contact details',
            type: 'group',
            item: [
                {
                    linkId: 'email',
                    text: 'Email',
                    type: 'string',
                    required: false,
                },
                {
                    linkId: 'phone',
                    text: 'Phone',
                    type: 'string',
                    required: false,
                },
            ],
        },
        {
            linkId: 'health-info',
            text: 'Health info',
            type: 'group',
            item: [
                {
                    linkId: 'age',
                    text: 'Age',
                    type: 'integer',
                    required: true,
                },
            ],
        },
        {
            linkId: 'additional-notes',
            text: 'Additional notes',
            type: 'group',
            item: [
                {
                    linkId: 'notes',
                    text: 'Notes',
                    type: 'string',
                    required: false,
                },
            ],
        },
    ],
};

const QUESTIONNAIRE: Questionnaire = {
    resourceType: 'Questionnaire',
    status: 'active',
    item: [WIZARD_ITEM],
};

const QUESTIONNAIRE_RESPONSE: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress',
};

const CONTEXT: ItemContext[] = [
    {
        questionnaire: QUESTIONNAIRE,
        resource: QUESTIONNAIRE_RESPONSE,
        context: QUESTIONNAIRE_RESPONSE,
    },
];

const WithGroupWizardProviderDecorator: Decorator = (Story) => {
    const methods = useForm<FormItems>();

    return (
        <FormProvider {...methods}>
            <QuestionnaireResponseFormProvider
                questionItemComponents={questionItemComponents}
                formValues={{}}
                setFormValues={() => undefined}
                fhirService={async () => success(undefined)}
                evaluateFhirpath={() => []}
            >
                <ValueSetExpandProvider.Provider value={async () => []}>
                    <BaseQuestionnaireResponseFormPropsContext.Provider value={{ submitting: false }}>
                        <form className={s.form}>
                            <Story />
                        </form>
                    </BaseQuestionnaireResponseFormPropsContext.Provider>
                </ValueSetExpandProvider.Provider>
            </QuestionnaireResponseFormProvider>
        </FormProvider>
    );
};

const meta: Meta<typeof GroupWizardVertical> = {
    title: 'Questionnaire / questions / group / wizard',
    component: GroupWizardVertical,
    decorators: [WithGroupWizardProviderDecorator],
};

export default meta;
type Story = StoryObj<typeof GroupWizardVertical>;

function testScrollTo(qi: FCEQuestionnaireItem) {
    const play: Story['play'] = async ({ canvas }) => {
        for (const item of [...(qi.item ?? [])].reverse()) {
            GroupWizardBus.dispatch({ type: 'scrollTo', groupLinkId: item.linkId });
            const firstElementLinId = item.item?.[0]?.linkId;
            expect(firstElementLinId).toBeDefined();
            await waitFor(() => expect(canvas.getByTestId(firstElementLinId!)).toBeInTheDocument());
        }
    };
    return play;
}

export const Vertical: Story = {
    play: testScrollTo(WIZARD_ITEM),
    render: () => <GroupWizardVertical parentPath={[]} questionItem={WIZARD_ITEM} context={CONTEXT} />,
};

export const WithTooltips: Story = {
    play: testScrollTo(WIZARD_ITEM),
    render: () => <GroupWizardWithTooltips parentPath={[]} questionItem={WIZARD_ITEM} context={CONTEXT} />,
};

export const Tabs: Story = {
    play: testScrollTo(WIZARD_ITEM),
    render: () => <GroupTabs parentPath={[]} questionItem={WIZARD_ITEM} context={CONTEXT} />,
};
