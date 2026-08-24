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
    test('the repeatable Goals and Tasks entries collapse to one open at a time on their own', () => {
        act(() => {
            i18n.activate('en');
        });

        render(
            <Providers>
                <Group questionItem={PLAN_GOALSTASKS_TAB_ITEM} parentPath={[]} context={CONTEXT} />
            </Providers>,
        );

        // plan-goalstasks is the sole child of plan-goalstasks-tab, so no sibling
        // ever turns it into an accordion from above - it must qualify on its own
        // (each instance nests multiple groups, one repeatable). The last entry is
        // open by default. Problems/Needs gates Goal Settings/Interventions and
        // Actions/Services and Treatments (see getAccordionGateFields) and each
        // instance already has a default-open collection, so Problems/Needs itself
        // renders read-only (a plain readonly-controls display, not an input) here -
        // getByText, not getByDisplayValue.
        expect(screen.getByText('Type 2 diabetes management')).toBeInTheDocument();
        expect(screen.queryByText('Hypertension management')).not.toBeInTheDocument();

        // Both entries' tabs are always visible, even though only one is expanded -
        // this is the actual fix for the "false single form" problem: the collapsed
        // entry's own name is never hidden behind a click.
        expect(screen.getByText('Goals and Tasks 1')).toBeInTheDocument();
        expect(screen.getByText('Goals and Tasks 2')).toBeInTheDocument();

        // Switch to the first entry directly - no need to open anything first.
        fireEvent.click(screen.getByText('Goals and Tasks 1'));

        expect(screen.getByText('Hypertension management')).toBeInTheDocument();
        expect(screen.queryByText('Type 2 diabetes management')).not.toBeInTheDocument();
    });

    test('renders the sibling accordion and cascades into the repeatable Goal Settings', () => {
        act(() => {
            i18n.activate('en');
        });

        render(
            <Providers>
                <Group questionItem={PLAN_GOALSTASKS_TAB_ITEM} parentPath={[]} context={CONTEXT} />
            </Providers>,
        );

        fireEvent.click(screen.getByText('Goals and Tasks 1'));
        // Goal Settings is the default-open collection, which locks Problems/Needs
        // (see getAccordionGateFields) - it renders as plain readonly text, not an
        // input, so getByText rather than getByDisplayValue.
        expect(screen.getByText('Hypertension management')).toBeInTheDocument();

        // Every sibling's tab (with its count) is always visible in the combined
        // breadcrumb bar - Goal Settings is the default-open sibling, its own count
        // shows on its tab, and only its last repeat is open (the first is collapsed).
        const goalSettings = screen.getByTestId('breadcrumb-segment-plan-goalstasks-details-goalsetting-voice');
        expect(within(goalSettings).getByText('(2)')).toBeInTheDocument();

        // Interventions and Actions has its own tab (with count) too, even though
        // it's not the expanded one.
        const interventions = screen.getByTestId(
            'breadcrumb-segment-plan-goalstasks-details-interventionsactions-voice',
        );
        expect(within(interventions).getByText('(1)')).toBeInTheDocument();

        expect(screen.getByDisplayValue('Increase weekly physical activity')).toBeInTheDocument();
        expect(screen.queryByDisplayValue('Lower blood pressure below 140/90')).not.toBeInTheDocument();

        // Switch to Interventions and Actions directly.
        fireEvent.click(screen.getByText('Interventions and Actions'));

        // Goal Settings' tab is still visible now that it's the collapsed one.
        expect(screen.getByTestId('breadcrumb-segment-plan-goalstasks-details-goalsetting-voice')).toBeInTheDocument();

        expect(screen.queryByDisplayValue('Increase weekly physical activity')).not.toBeInTheDocument();
        expect(screen.getByDisplayValue('Home blood pressure monitoring')).toBeInTheDocument();
        expect(screen.getByText('Add Interventions and Actions')).toBeInTheDocument();
    });

    test('Problems/Needs is read-only while a collection tab is open, and clicking it re-enables editing', () => {
        act(() => {
            i18n.activate('en');
        });

        render(
            <Providers>
                <Group questionItem={PLAN_GOALSTASKS_TAB_ITEM} parentPath={[]} context={CONTEXT} />
            </Providers>,
        );

        fireEvent.click(screen.getByText('Goals and Tasks 1'));

        // Problems/Needs gates Goal Settings/Interventions and Actions/Services and
        // Treatments (see getAccordionGateFields) - it's already answered here, so
        // Goal Settings opens by default, which locks it. Locked means displayed with
        // the readonly-controls component, not a disabled edit control - so its value
        // shows as plain text and there's no input to query for at all.
        expect(screen.getByText('Hypertension management')).toBeInTheDocument();
        expect(screen.queryByDisplayValue('Hypertension management')).not.toBeInTheDocument();
        expect(screen.getByText(/Read-only while editing Goal Settings/)).toBeInTheDocument();

        // Clicking the read-only field closes the open collection and re-enables it -
        // the collection tabs themselves stay enabled since the gate is still met.
        fireEvent.click(screen.getByTestId('gate-field-plan-goalstasks-problemneed-voice'));

        expect(screen.getByDisplayValue('Hypertension management')).toBeInTheDocument();
        expect(screen.queryByDisplayValue('Increase weekly physical activity')).not.toBeInTheDocument();
        expect(screen.getByTestId('breadcrumb-segment-plan-goalstasks-details-goalsetting-voice')).not.toBeDisabled();
    });

    test('adding an intervention after opening the section does not crash', () => {
        act(() => {
            i18n.activate('en');
        });

        render(
            <Providers>
                <Group questionItem={PLAN_GOALSTASKS_TAB_ITEM} parentPath={[]} context={CONTEXT} />
            </Providers>,
        );

        // Goals and Tasks 2 is open by default, but only Goals and Tasks 1 has an
        // Interventions/Actions entry seeded.
        fireEvent.click(screen.getByText('Goals and Tasks 1'));

        fireEvent.click(screen.getByText('Interventions and Actions'));

        expect(screen.getByDisplayValue('Home blood pressure monitoring')).toBeInTheDocument();
        // Only the active leaf's remove control is rendered on the combined header.
        expect(screen.getAllByTestId('remove-group-button')).toHaveLength(1);

        // This used to throw "Cannot read properties of undefined (reading
        // 'questionnaire')" because the group started with zero seeded items, so
        // there was no context[0] to fall back to for the first added row.
        expect(() => fireEvent.click(screen.getByText('Add Interventions and Actions'))).not.toThrow();

        // The newly added item opens in place of the previous one - still exactly
        // one open item, so still exactly one remove control.
        expect(screen.queryByDisplayValue('Home blood pressure monitoring')).not.toBeInTheDocument();
        expect(screen.getAllByTestId('remove-group-button')).toHaveLength(1);
        expect(
            within(
                screen.getByTestId('breadcrumb-segment-plan-goalstasks-details-interventionsactions-voice'),
            ).getByText('(2)'),
        ).toBeInTheDocument();
    });
});
