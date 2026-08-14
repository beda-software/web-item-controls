import type { Decorator, Meta, StoryObj } from '@storybook/react';
import { FormProvider, useForm } from 'react-hook-form';
import { FormItems, QuestionnaireResponseFormProvider, mapResponseToForm } from 'sdc-qrf';
import { expect, userEvent, waitFor } from 'storybook/test';

import { success } from '@beda.software/remote-data';

import s from 'src/components/BaseQuestionnaireResponseForm/BaseQuestionnaireResponseForm.module.scss';
import { ValueSetExpandProvider } from 'src/contexts';
import {
    groupItemComponent,
    itemControlGroupItemComponents,
    itemControlQuestionItemComponents,
    questionItemComponents,
} from 'src/controls';
import { GroupWizardBus } from 'src/controls/GroupWizard';

// ColorSchemeDecorator is not compatible with storybook tests (see
// GroupAccordionExpandBus.stories.tsx), so this story gets its own meta/decorator
// rather than reusing GoalsAndTasksAccordion.stories.tsx's.
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
    title: 'Questionnaire / questions / group / accordion / reactivate gate field via bus',
    component: Group,
    decorators: [WithGoalsAndTasksProviderDecorator],
};

export default meta;
type Story = StoryObj<typeof Group>;

// Demonstrates 'reactivateGateField': Problems/Needs gates Goal Settings/
// Interventions and Actions/Services and Treatments (see getAccordionGateFields in
// accordionContext.ts) - opening one of those locks Problems/Needs, same as clicking
// its own "Read-only while editing X - click to edit" overlay would. The dispatch is
// keyed by "plan-goalstasks" - the parent "Goals and Tasks" group's own linkId, not
// Problems/Needs' - since that's what identifies which record's gate to reactivate.
export const ReactivateGateFieldViaBus: Story = {
    render: () => <Group questionItem={PLAN_GOALSTASKS_TAB_ITEM} parentPath={[]} context={CONTEXT} />,
    play: async ({ canvas }) => {
        await userEvent.click(canvas.getByText('Goals and Tasks 1'));

        // Goal Settings opens by default (it already has data), which locks
        // Problems/Needs - it renders as plain readonly text, not an editable input.
        await waitFor(() => expect(canvas.getByText('Hypertension management')).toBeInTheDocument());
        expect(canvas.queryByDisplayValue('Hypertension management')).not.toBeInTheDocument();

        GroupWizardBus.dispatch({ type: 'reactivateGateField', groupLinkId: 'plan-goalstasks' });

        // Same effect as clicking the overlay directly: the open collection closes
        // and Problems/Needs becomes an editable input again.
        await waitFor(() => expect(canvas.getByDisplayValue('Hypertension management')).toBeInTheDocument());
        expect(canvas.queryByDisplayValue('Increase weekly physical activity')).not.toBeInTheDocument();
    },
};
