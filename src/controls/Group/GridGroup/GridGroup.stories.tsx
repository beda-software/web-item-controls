import type { Decorator, Meta, StoryObj } from '@storybook/react';
import { Questionnaire, QuestionnaireResponse } from 'fhir/r4b';
import { FormProvider, useForm } from 'react-hook-form';
import { FCEQuestionnaireItem, FormItems, ItemContext, QuestionnaireResponseFormProvider } from 'sdc-qrf';

import { success } from '@beda.software/remote-data';

import s from 'src/components/BaseQuestionnaireResponseForm/BaseQuestionnaireResponseForm.module.scss';
import { questionItemComponents } from 'src/controls';
import { withColorSchemeDecorator } from 'src/storybook/decorators';

import { GridGroup } from './index';

const GRID_ITEM: FCEQuestionnaireItem = {
    linkId: 'measurements',
    text: 'Measurements',
    type: 'group',
    item: [
        {
            linkId: 'week-1',
            text: 'Week 1',
            type: 'group',
            item: [
                { linkId: 'week-1-weight', text: 'Weight', type: 'integer' },
                { linkId: 'week-1-notes', text: 'Notes', type: 'string' },
            ],
        },
        {
            linkId: 'week-2',
            text: 'Week 2',
            type: 'group',
            item: [
                { linkId: 'week-2-weight', text: 'Weight', type: 'integer' },
                { linkId: 'week-2-notes', text: 'Notes', type: 'string' },
            ],
        },
    ],
};

const QUESTIONNAIRE: Questionnaire = {
    resourceType: 'Questionnaire',
    status: 'active',
    item: [GRID_ITEM],
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

const WithGridGroupProviderDecorator: Decorator = (Story) => {
    const methods = useForm<FormItems>();

    return (
        <FormProvider {...methods}>
            <QuestionnaireResponseFormProvider
                questionItemComponents={questionItemComponents}
                formValues={{}}
                setFormValues={() => undefined}
                fhirService={async () => success(undefined)}
            >
                <form className={s.form}>
                    <Story />
                </form>
            </QuestionnaireResponseFormProvider>
        </FormProvider>
    );
};

const meta: Meta<typeof GridGroup> = {
    title: 'Questionnaire / questions / group / grid',
    component: GridGroup,
    decorators: [withColorSchemeDecorator, WithGridGroupProviderDecorator],
};

export default meta;
type Story = StoryObj<typeof GridGroup>;

export const Example: Story = {
    render: () => (
        <GridGroup
            groupItem={{
                parentPath: [],
                questionItem: GRID_ITEM,
                context: CONTEXT,
            }}
        />
    ),
};
