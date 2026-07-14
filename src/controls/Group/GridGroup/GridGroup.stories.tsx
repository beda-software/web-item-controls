import type { Decorator, Meta, StoryObj } from '@storybook/react';
import { Questionnaire, QuestionnaireResponse } from 'fhir/r4b';
import { FormProvider, useForm } from 'react-hook-form';
import {
    FCEQuestionnaire,
    FCEQuestionnaireItem,
    FormItems,
    ItemContext,
    QuestionnaireResponseFormProvider,
} from 'sdc-qrf';

import { success } from '@beda.software/remote-data';

import s from 'src/components/BaseQuestionnaireResponseForm/BaseQuestionnaireResponseForm.module.scss';
import { ValueSetExpandProvider } from 'src/contexts';
import { questionItemComponents } from 'src/controls';
import { withColorSchemeDecorator } from 'src/storybook/decorators';

import { GridGroup } from './index';
import { VITALS_GRID_RAW } from './vitalsGridFixture';

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
                evaluateFhirpath={() => []}
            >
                <ValueSetExpandProvider.Provider value={async () => []}>
                    <form className={s.form}>
                        <Story />
                    </form>
                </ValueSetExpandProvider.Provider>
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

const VITALS_QUESTIONNAIRE: FCEQuestionnaire = {
    resourceType: 'Questionnaire',
    status: 'active',
    item: [VITALS_GRID_RAW],
    meta: {
        profile: ['https://emr-core.beda.software/StructureDefinition/fhir-emr-questionnaire'],
    },
};

const VITALS_GRID_ITEM = VITALS_QUESTIONNAIRE.item![0]!;

const VITALS_QUESTIONNAIRE_RESPONSE: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress',
};

const VITALS_CONTEXT: ItemContext[] = [
    {
        questionnaire: VITALS_QUESTIONNAIRE,
        resource: VITALS_QUESTIONNAIRE_RESPONSE,
        context: VITALS_QUESTIONNAIRE_RESPONSE,
    },
];

export const VitalsObservationsGrid: Story = {
    render: () => (
        <GridGroup
            groupItem={{
                parentPath: [],
                questionItem: VITALS_GRID_ITEM,
                context: VITALS_CONTEXT,
            }}
        />
    ),
};
