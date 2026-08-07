import type { Decorator, Meta, StoryObj } from '@storybook/react';
import { FormProvider, useForm } from 'react-hook-form';
import { FormItems, QuestionnaireResponseFormProvider, mapResponseToForm } from 'sdc-qrf';

import { success } from '@beda.software/remote-data';

import s from 'src/components/BaseQuestionnaireResponseForm/BaseQuestionnaireResponseForm.module.scss';
import { ValueSetExpandProvider } from 'src/contexts';
import {
    groupItemComponent,
    itemControlGroupItemComponents,
    itemControlQuestionItemComponents,
    questionItemComponents,
} from 'src/controls';
import { withColorSchemeDecorator } from 'src/storybook/decorators';

import {
    CONTEXT,
    PLAN_GOALSTASKS_TAB_ITEM,
    QUESTIONNAIRE,
    QUESTIONNAIRE_RESPONSE,
} from './GoalsAndTasksAccordion.fixtures';
import { Group } from './index';

const WithGoalsAndTasksProviderDecorator: Decorator = (Story) => {
    const methods = useForm<FormItems>({
        defaultValues: mapResponseToForm(QUESTIONNAIRE_RESPONSE, QUESTIONNAIRE),
    });

    return (
        <FormProvider {...methods}>
            <QuestionnaireResponseFormProvider
                questionItemComponents={questionItemComponents}
                groupItemComponent={groupItemComponent}
                itemControlQuestionItemComponents={itemControlQuestionItemComponents}
                itemControlGroupItemComponents={itemControlGroupItemComponents}
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

const meta: Meta<typeof Group> = {
    title: 'Questionnaire / questions / group / accordion',
    component: Group,
    decorators: [withColorSchemeDecorator, WithGoalsAndTasksProviderDecorator],
};

export default meta;
type Story = StoryObj<typeof Group>;

export const GoalsAndTasks: Story = {
    render: () => <Group questionItem={PLAN_GOALSTASKS_TAB_ITEM} parentPath={[]} context={CONTEXT} />,
};
