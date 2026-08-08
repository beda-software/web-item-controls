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

const WithGroupProviderDecorator: Decorator = (Story) => {
    const methods = useForm<FormItems>({
        defaultValues: mapResponseToForm(QUESTIONNAIRE_RESPONSE, QUESTIONNAIRE),
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

const meta: Meta<typeof Group> = {
    title: 'Questionnaire / questions / group',
    component: Group,
    decorators: [withColorSchemeDecorator, WithGroupProviderDecorator],
};

export default meta;
type Story = StoryObj<typeof Group>;

export const Example: Story = {
    render: () => <Group parentPath={[]} questionItem={GROUP_ITEM} context={CONTEXT} />,
};
