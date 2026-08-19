import type { Decorator } from '@storybook/react';
import { Questionnaire, QuestionnaireResponse } from 'fhir/r4b';
import { FormProvider, useForm } from 'react-hook-form';
import { FCEQuestionnaireItem, FormItems, ItemContext, QuestionnaireResponseFormProvider } from 'sdc-qrf';

import { BaseQuestionnaireResponseFormPropsContext } from '@beda.software/fhir-questionnaire/contexts';
import { success } from '@beda.software/remote-data';

import s from 'src/components/BaseQuestionnaireResponseForm/BaseQuestionnaireResponseForm.module.scss';
import { ValueSetExpandProvider } from 'src/contexts';
import { questionItemComponents } from 'src/controls';

// Extracted from the real "Goals and tasks" section of GPChronicConditionManagementPlan.json
// (https://github.com/beda-software/web-item-controls/issues/11), trimmed of unrelated extensions.
export const GOALS_AND_TASKS_ITEM: FCEQuestionnaireItem = {
    linkId: 'plan-goalstasks',
    text: 'Goals and tasks',
    type: 'group',
    repeats: true,
    item: [
        {
            linkId: 'plan-goalstasks-problemneed',
            text: 'Problems/Needs',
            type: 'open-choice',
            repeats: true,
        },
        {
            linkId: 'plan-goalstasks-details-goalsetting',
            text: 'Goal setting',
            type: 'group',
            repeats: true,
            item: [
                { linkId: 'plan-goalstasks-details-goalsetting-goals', text: 'Goals', type: 'text' },
                { linkId: 'plan-goalstasks-details-goalsetting-initiator', text: 'Initiator', type: 'string' },
                { linkId: 'plan-goalstasks-details-goalsetting-targetdate', text: 'Target date', type: 'date' },
                { linkId: 'plan-goalstasks-details-goalsetting-status', text: 'Status', type: 'choice' },
                { linkId: 'plan-goalstasks-details-goalsetting-comment', text: 'Comment', type: 'string' },
            ],
        },
        {
            linkId: 'plan-goalstasks-details-interventionsactions',
            text: 'Interventions and actions',
            type: 'group',
            repeats: true,
            itemControl: { coding: [{ code: 'gtable' }] },
            item: [
                {
                    linkId: 'plan-goalstasks-details-interventionsactions-interventionsactions',
                    text: 'Interventions/Actions',
                    type: 'open-choice',
                },
                { linkId: 'plan-goalstasks-details-interventionsactions-owner', text: 'Owner', type: 'string' },
                {
                    linkId: 'plan-goalstasks-details-interventionsactions-targetdate',
                    text: 'Target date',
                    type: 'date',
                },
                { linkId: 'plan-goalstasks-details-interventionsactions-status', text: 'Status', type: 'choice' },
                { linkId: 'plan-goalstasks-details-interventionsactions-comment', text: 'Comment', type: 'string' },
            ],
        },
        {
            linkId: 'plan-goalstasks-details-servicestreatments',
            text: 'Services and treatments',
            type: 'group',
            repeats: true,
            itemControl: { coding: [{ code: 'gtable' }] },
            item: [
                {
                    linkId: 'plan-goalstasks-details-servicestreatments-servicestreatments',
                    text: 'Required services and treatments',
                    type: 'open-choice',
                },
                {
                    linkId: 'plan-goalstasks-details-servicestreatments-activity',
                    text: 'Activity',
                    type: 'open-choice',
                },
                { linkId: 'plan-goalstasks-details-servicestreatments-provider', text: 'Provider', type: 'string' },
                { linkId: 'plan-goalstasks-details-servicestreatments-comment', text: 'Comment', type: 'string' },
            ],
        },
    ],
};

export const QUESTIONNAIRE: Questionnaire = {
    resourceType: 'Questionnaire',
    status: 'active',
    item: [GOALS_AND_TASKS_ITEM],
};

export const QUESTIONNAIRE_RESPONSE: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress',
};

export const CONTEXT: ItemContext[] = [
    {
        questionnaire: QUESTIONNAIRE,
        resource: QUESTIONNAIRE_RESPONSE,
        context: QUESTIONNAIRE_RESPONSE,
    },
];

export function makeFormValues(instanceCount: number): FormItems {
    return {
        'plan-goalstasks': {
            items: Array.from({ length: instanceCount }, () => ({ items: {} })),
        },
    };
}

export const WithGroupWizardSidebarProviderDecorator: Decorator = (Story) => {
    const methods = useForm<FormItems>({ defaultValues: makeFormValues(1) });

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
