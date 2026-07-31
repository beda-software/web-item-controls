import type { Decorator, Meta, StoryObj } from '@storybook/react';
import { Questionnaire, QuestionnaireResponse } from 'fhir/r4b';
import { FormProvider, useForm } from 'react-hook-form';
import { FCEQuestionnaireItem, FormItems, ItemContext, QuestionnaireResponseFormProvider } from 'sdc-qrf';

import { BaseQuestionnaireResponseFormPropsContext } from '@beda.software/fhir-questionnaire/contexts';
import { success } from '@beda.software/remote-data';

import s from 'src/components/BaseQuestionnaireResponseForm/BaseQuestionnaireResponseForm.module.scss';
import { ValueSetExpandProvider } from 'src/contexts';
import { questionItemComponents } from 'src/controls';
import { withColorSchemeDecorator } from 'src/storybook/decorators';

import { GroupWizardVertical, GroupWizardWithTooltips } from './index';

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
    decorators: [withColorSchemeDecorator, WithGroupWizardProviderDecorator],
};

export default meta;
type Story = StoryObj<typeof GroupWizardVertical>;

export const Vertical: Story = {
    render: () => <GroupWizardVertical parentPath={[]} questionItem={WIZARD_ITEM} context={CONTEXT} />,
};

export const WithTooltips: Story = {
    render: () => <GroupWizardWithTooltips parentPath={[]} questionItem={WIZARD_ITEM} context={CONTEXT} />,
};
