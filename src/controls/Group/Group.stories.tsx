import type { Decorator, Meta, StoryObj } from '@storybook/react';
import { Questionnaire, QuestionnaireResponse } from 'fhir/r4b';
import { FormProvider, useForm } from 'react-hook-form';
import {
    FCEQuestionnaireItem,
    FormItems,
    ItemContext,
    QuestionnaireResponseFormProvider,
    mapResponseToForm,
} from 'sdc-qrf';

import { success } from '@beda.software/remote-data';

import s from 'src/components/BaseQuestionnaireResponseForm/BaseQuestionnaireResponseForm.module.scss';
import { groupItemComponent, questionItemComponents } from 'src/controls';
import { withColorSchemeDecorator } from 'src/storybook/decorators';

import { Group } from './index';

const GROUP_ITEM: FCEQuestionnaireItem = {
    linkId: 'example',
    text: 'Group Title',
    type: 'group',
    required: true,
    item: [
        { linkId: 'first-name', text: 'First name', type: 'string' },
        { linkId: 'last-name', text: 'Last name', type: 'string' },
        { linkId: 'notes', text: 'Notes', type: 'text' },
    ],
};

const QUESTIONNAIRE: Questionnaire = {
    resourceType: 'Questionnaire',
    status: 'active',
    item: [GROUP_ITEM],
};

const QUESTIONNAIRE_RESPONSE: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress',
    item: [
        {
            linkId: 'example',
            item: [
                { linkId: 'first-name', answer: [{ valueString: 'John' }] },
                { linkId: 'last-name', answer: [{ valueString: 'Doe' }] },
            ],
        },
    ],
};

const CONTEXT: ItemContext[] = [
    {
        questionnaire: QUESTIONNAIRE,
        resource: QUESTIONNAIRE_RESPONSE,
        context: QUESTIONNAIRE_RESPONSE,
    },
];

const REPEATABLE_GROUP_ITEM: FCEQuestionnaireItem = {
    linkId: 'repeatable-example',
    text: 'Contact',
    type: 'group',
    repeats: true,
    item: [{ linkId: 'contact-name', text: 'Name', type: 'string' }],
};

const REPEATABLE_QUESTIONNAIRE: Questionnaire = {
    resourceType: 'Questionnaire',
    status: 'active',
    item: [REPEATABLE_GROUP_ITEM],
};

const REPEATABLE_QUESTIONNAIRE_RESPONSE: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress',
    item: [
        {
            linkId: 'repeatable-example',
            item: [{ linkId: 'contact-name', answer: [{ valueString: 'John' }] }],
        },
        {
            linkId: 'repeatable-example',
            item: [{ linkId: 'contact-name', answer: [{ valueString: 'Jane' }] }],
        },
    ],
};

const REPEATABLE_CONTEXT: ItemContext[] = [
    {
        questionnaire: REPEATABLE_QUESTIONNAIRE,
        resource: REPEATABLE_QUESTIONNAIRE_RESPONSE,
        context: REPEATABLE_QUESTIONNAIRE_RESPONSE,
    },
];

function createGroupProviderDecorator(response: QuestionnaireResponse, questionnaire: Questionnaire): Decorator {
    return function WithGroupProviderDecorator(Story) {
        const methods = useForm<FormItems>({
            defaultValues: mapResponseToForm(response, questionnaire),
        });

        return (
            <FormProvider {...methods}>
                <QuestionnaireResponseFormProvider
                    questionItemComponents={questionItemComponents}
                    groupItemComponent={groupItemComponent}
                    formValues={{}}
                    setFormValues={() => undefined}
                    fhirService={async () => success(undefined)}
                    evaluateFhirpath={() => []}
                >
                    <form className={s.form}>
                        <Story />
                    </form>
                </QuestionnaireResponseFormProvider>
            </FormProvider>
        );
    };
}

const meta: Meta<typeof Group> = {
    title: 'Questionnaire / questions / group',
    component: Group,
    decorators: [withColorSchemeDecorator],
};

export default meta;
type Story = StoryObj<typeof Group>;

export const Example: Story = {
    decorators: [createGroupProviderDecorator(QUESTIONNAIRE_RESPONSE, QUESTIONNAIRE)],
    render: () => <Group parentPath={[]} questionItem={GROUP_ITEM} context={CONTEXT} />,
};

export const Repeatable: Story = {
    decorators: [createGroupProviderDecorator(REPEATABLE_QUESTIONNAIRE_RESPONSE, REPEATABLE_QUESTIONNAIRE)],
    render: () => <Group parentPath={[]} questionItem={REPEATABLE_GROUP_ITEM} context={REPEATABLE_CONTEXT} />,
};

export const RepeatableWithHiddenAddButton: Story = {
    decorators: [createGroupProviderDecorator(REPEATABLE_QUESTIONNAIRE_RESPONSE, REPEATABLE_QUESTIONNAIRE)],
    render: () => (
        <Group
            parentPath={[]}
            questionItem={{
                ...REPEATABLE_GROUP_ITEM,
                extension: [
                    {
                        url: 'https://smartforms.csiro.au/ig/StructureDefinition/GroupHideAddItemButton',
                        valueBoolean: true,
                    },
                ],
            }}
            context={REPEATABLE_CONTEXT}
        />
    ),
};
