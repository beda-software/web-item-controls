import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, fireEvent, act, within } from '@testing-library/react';
import { ReactNode } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { FormItems, QuestionnaireResponseFormProvider, mapResponseToForm } from 'sdc-qrf';
import { describe, expect, test } from 'vitest';

import { success } from '@beda.software/remote-data';

import { ValueSetExpandProvider } from 'src/contexts';
import {
    groupItemComponent,
    itemControlGroupItemComponents,
    itemControlQuestionItemComponents,
    questionItemComponents,
} from 'src/controls';
import { ThemeProvider } from 'src/theme';

import {
    CONTEXT,
    PLAN_GOALSTASKS_TAB_ITEM,
    QUESTIONNAIRE,
    QUESTIONNAIRE_RESPONSE,
} from '../GoalsAndTasksAccordion.fixtures';
import { Group } from '../index';

function Providers({ children }: { children: ReactNode }) {
    const methods = useForm<FormItems>({
        defaultValues: mapResponseToForm(QUESTIONNAIRE_RESPONSE, QUESTIONNAIRE),
    });

    return (
        <ThemeProvider>
            <I18nProvider i18n={i18n}>
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
                            <form>{children}</form>
                        </ValueSetExpandProvider.Provider>
                    </QuestionnaireResponseFormProvider>
                </FormProvider>
            </I18nProvider>
        </ThemeProvider>
    );
}

describe('Goals and tasks accordion fixture (real-world shape from issue #9)', () => {
    test('renders the sibling accordion and cascades into the repeatable Goal Settings', () => {
        act(() => {
            i18n.activate('en');
        });

        render(
            <Providers>
                <Group questionItem={PLAN_GOALSTASKS_TAB_ITEM} parentPath={[]} context={CONTEXT} />
            </Providers>,
        );

        expect(screen.getByDisplayValue('Hypertension management')).toBeInTheDocument();

        const goalSettings = screen.getByTestId('accordion-section-plan-goalstasks-details-goalsetting');
        const interventions = screen.getByTestId('accordion-section-plan-goalstasks-details-interventionsactions');
        const services = screen.getByTestId('accordion-section-plan-goalstasks-details-servicestreatments');

        expect(within(goalSettings).getByText('(2)')).toBeInTheDocument();
        expect(within(interventions).getByText('(0)')).toBeInTheDocument();
        expect(within(services).getByText('(0)')).toBeInTheDocument();

        // Goal Settings is the default-open sibling: its last repeat is open, the first is collapsed.
        expect(screen.getByDisplayValue('Increase weekly physical activity')).toBeInTheDocument();
        expect(screen.queryByDisplayValue('Lower blood pressure below 140/90')).not.toBeInTheDocument();

        fireEvent.click(
            within(interventions).getByTestId('accordion-toggle-plan-goalstasks-details-interventionsactions'),
        );

        expect(screen.queryByDisplayValue('Increase weekly physical activity')).not.toBeInTheDocument();
        expect(screen.getByText('Add Interventions and Actions')).toBeInTheDocument();
    });
});
