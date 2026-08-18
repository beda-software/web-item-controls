import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Patient, Practitioner, Questionnaire } from 'fhir/r4b';
import { vi } from 'vitest';

import { QuestionnaireResponseForm } from '@beda.software/fhir-questionnaire';
import { questionnaireServiceLoader } from '@beda.software/fhir-questionnaire/components';
import { WithId, withRootAccess } from '@beda.software/fhir-react';
import { success } from '@beda.software/remote-data';

import { FormWrapper } from 'src/components/FormWrapper';
import {
    groupItemComponent,
    itemControlGroupItemComponents,
    itemControlQuestionItemComponents,
    questionItemComponents,
} from 'src/controls';
import { axiosInstance, service } from 'src/services/fhir';
import { createPatient, createPractitionerRole, loginAdminUser } from 'src/setupTests';
import { ThemeProvider } from 'src/theme';

const getQuestionnaire = (): Questionnaire => {
    return {
        name: 'Group wizard sidebar test',
        title: 'Group wizard sidebar test',
        resourceType: 'Questionnaire',
        status: 'active',
        id: 'group-wizard-sidebar-test',
        meta: {
            profile: ['https://emr-core.beda.software/StructureDefinition/fhir-emr-questionnaire'],
        },
        url: 'https://aidbox.emr.beda.software/fhir/Questionnaire/group-wizard-sidebar-test',
        item: [
            {
                linkId: 'plan-goalstasks',
                text: 'Goals and tasks',
                type: 'group',
                repeats: true,
                item: [
                    {
                        linkId: 'plan-goalstasks-problemneed',
                        text: 'Problems/Needs',
                        type: 'string',
                        repeats: false,
                    },
                    {
                        linkId: 'plan-goalstasks-details-goalsetting',
                        text: 'Goal setting',
                        type: 'group',
                        repeats: true,
                        item: [{ linkId: 'plan-goalstasks-details-goalsetting-goals', text: 'Goals', type: 'string' }],
                    },
                    {
                        linkId: 'plan-goalstasks-details-interventionsactions',
                        text: 'Interventions and actions',
                        type: 'group',
                        repeats: true,
                        extension: [
                            {
                                url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                                valueCodeableConcept: { coding: [{ code: 'gtable' }] },
                            },
                        ],
                        item: [
                            {
                                linkId: 'plan-goalstasks-details-interventionsactions-owner',
                                text: 'Owner',
                                type: 'string',
                            },
                        ],
                    },
                    {
                        linkId: 'plan-goalstasks-details-servicestreatments',
                        text: 'Services and treatments',
                        type: 'group',
                        repeats: true,
                        extension: [
                            {
                                url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                                valueCodeableConcept: { coding: [{ code: 'gtable' }] },
                            },
                        ],
                        item: [
                            {
                                linkId: 'plan-goalstasks-details-servicestreatments-provider',
                                text: 'Provider',
                                type: 'string',
                            },
                        ],
                    },
                ],
            },
        ],
    };
};

describe('GroupWizardSidebar renders correctly', async () => {
    async function setup() {
        await loginAdminUser();

        return await withRootAccess(axiosInstance, async () => {
            const patient = await createPatient({
                name: [{ given: ['John'], family: 'Smith' }],
            });

            const { practitioner, practitionerRole } = await createPractitionerRole({});

            return { patient, practitioner, practitionerRole };
        });
    }

    async function renderForm(_patient: Patient, _practitioner: WithId<Practitioner>) {
        const onSuccess = vi.fn();

        act(() => {
            i18n.activate('en');
        });

        render(
            <ThemeProvider>
                <I18nProvider i18n={i18n}>
                    <QuestionnaireResponseForm
                        questionnaireLoader={questionnaireServiceLoader(() =>
                            Promise.resolve(success(getQuestionnaire())),
                        )}
                        onSuccess={onSuccess}
                        serviceProvider={{ service }}
                        FormWrapper={FormWrapper}
                        groupItemComponent={groupItemComponent}
                        questionItemComponents={questionItemComponents}
                        itemControlQuestionItemComponents={itemControlQuestionItemComponents}
                        itemControlGroupItemComponents={itemControlGroupItemComponents}
                    />
                </I18nProvider>
            </ThemeProvider>,
        );

        return onSuccess;
    }

    test('shows the default instance (auto-expanded, no toggle), switches subgroup instantly, and adds a new top-level instance', async () => {
        const { patient, practitioner } = await setup();

        await renderForm(patient, practitioner);

        await screen.findByTestId('sidebar-menu-row-plan-goalstasks.items.0');
        // The row appearing doesn't guarantee the auto-select effect has run yet, so this needs a retrying query.
        await screen.findByText('Problems/Needs');

        // A single top-level item has nothing to collapse into, so its subgroups are always visible and there's
        // no collapse toggle for it.
        expect(screen.queryByTestId('sidebar-menu-toggle-plan-goalstasks.items.0')).not.toBeInTheDocument();

        // "Interventions and actions" (repeatable, itemControl `gtable`) is walked and split into per-instance
        // rows the same as a plain repeatable subgroup - it starts with no instances, so one is added first.
        const interventionsHeader = await screen.findByTestId(
            'sidebar-menu-add-plan-goalstasks-details-interventionsactions',
        );
        act(() => {
            fireEvent.click(interventionsHeader);
        });

        const interventionsRow = await screen.findByTestId(
            'sidebar-menu-row-plan-goalstasks.items.0.plan-goalstasks-details-interventionsactions.items.0',
        );
        act(() => {
            fireEvent.click(interventionsRow);
        });

        await waitFor(() => expect(screen.getByText('Owner')).toBeInTheDocument());

        const addButton = await screen.findByTestId('sidebar-menu-add-plan-goalstasks');
        act(() => {
            fireEvent.click(addButton);
        });

        await waitFor(() => expect(screen.getByTestId('sidebar-menu-row-plan-goalstasks.items.1')).toBeInTheDocument());
    }, 60000);

    test('inner group add button lives in its header and appends to the list without a separate "Add" line', async () => {
        const { patient, practitioner } = await setup();

        await renderForm(patient, practitioner);

        await screen.findByTestId('sidebar-menu-row-plan-goalstasks.items.0');

        const goalSettingHeader = await screen.findByTestId('sidebar-menu-add-plan-goalstasks-details-goalsetting');
        expect(screen.getByText('Goal setting')).toBeInTheDocument();
        expect(screen.queryByText('Add Goal setting')).not.toBeInTheDocument();

        act(() => {
            fireEvent.click(goalSettingHeader);
        });

        await screen.findByTestId(
            'sidebar-menu-row-plan-goalstasks.items.0.plan-goalstasks-details-goalsetting.items.0',
        );
        // The header stays put (same test id, same "Goal setting" label, still no "Add Goal setting" text line)
        // once an instance has been added - it isn't replaced by a numbered row or a trailing text button.
        expect(screen.getByTestId('sidebar-menu-add-plan-goalstasks-details-goalsetting')).toBeInTheDocument();
        expect(screen.getByText('Goal setting')).toBeInTheDocument();
        expect(screen.queryByText('Add Goal setting')).not.toBeInTheDocument();

        act(() => {
            fireEvent.click(goalSettingHeader);
        });

        await waitFor(() =>
            expect(
                screen.getByTestId(
                    'sidebar-menu-row-plan-goalstasks.items.0.plan-goalstasks-details-goalsetting.items.1',
                ),
            ).toBeInTheDocument(),
        );
    }, 60000);

    test("subgroup content shows the parent group's own data as a read-only preview", async () => {
        const { patient, practitioner } = await setup();

        await renderForm(patient, practitioner);
        await screen.findByTestId('sidebar-menu-row-plan-goalstasks.items.0');

        const problemsField = await screen.findByTestId('plan-goalstasks-problemneed');
        const problemsInput = problemsField.querySelector('input')!;
        act(() => {
            fireEvent.change(problemsInput, { target: { value: 'Chronic pain' } });
        });
        await waitFor(() => expect(problemsInput).toHaveValue('Chronic pain'));

        const goalSettingHeader = await screen.findByTestId('sidebar-menu-add-plan-goalstasks-details-goalsetting');
        act(() => {
            fireEvent.click(goalSettingHeader);
        });

        const goalSettingRow = await screen.findByTestId(
            'sidebar-menu-row-plan-goalstasks.items.0.plan-goalstasks-details-goalsetting.items.0',
        );
        act(() => {
            fireEvent.click(goalSettingRow);
        });

        // The ancestor ("Goals and tasks 1") preview title is a heading, distinct from the plain sidebar row label.
        await screen.findByRole('heading', { name: 'Goals and tasks 1', level: 5 });

        const previewProblemsInput = screen.getByTestId('plan-goalstasks-problemneed').querySelector('input')!;
        expect(previewProblemsInput).toHaveValue('Chronic pain');
        expect(previewProblemsInput).toBeDisabled();

        // The currently-selected node's own field stays editable.
        const goalsInput = screen.getByTestId('plan-goalstasks-details-goalsetting-goals').querySelector('input')!;
        expect(goalsInput).not.toBeDisabled();
    }, 60000);

    test('top-level rows behave as a single-expand accordion once 2+ instances exist', async () => {
        const { patient, practitioner } = await setup();

        await renderForm(patient, practitioner);

        await screen.findByTestId('sidebar-menu-row-plan-goalstasks.items.0');

        const addButton = await screen.findByTestId('sidebar-menu-add-plan-goalstasks');
        act(() => {
            fireEvent.click(addButton);
        });

        await screen.findByTestId('sidebar-menu-row-plan-goalstasks.items.1');

        // Adding the 2nd instance selects and expands it, collapsing the 1st.
        const toggle0 = await screen.findByTestId('sidebar-menu-toggle-plan-goalstasks.items.0');
        const toggle1 = await screen.findByTestId('sidebar-menu-toggle-plan-goalstasks.items.1');

        expect(toggle0).toHaveAttribute('aria-label', 'Expand');
        expect(toggle1).toHaveAttribute('aria-label', 'Collapse');
        // Every nested section (e.g. "Goal setting") is only rendered while its parent root instance is
        // expanded - since the accordion only ever expands one root instance at a time, at most one copy of a
        // given nested section's header exists in the DOM.
        expect(screen.getAllByTestId('sidebar-menu-add-plan-goalstasks-details-goalsetting')).toHaveLength(1);

        // Collapsing the currently-open item (index 1, the last one) opens the next one, wrapping to index 0.
        act(() => {
            fireEvent.click(toggle1);
        });

        await waitFor(() => expect(toggle0).toHaveAttribute('aria-label', 'Collapse'));
        expect(toggle1).toHaveAttribute('aria-label', 'Expand');
        expect(screen.getAllByTestId('sidebar-menu-add-plan-goalstasks-details-goalsetting')).toHaveLength(1);

        // Uncollapsing a closed item (index 1) opens it and closes whichever was open (index 0).
        act(() => {
            fireEvent.click(toggle1);
        });

        await waitFor(() => expect(toggle1).toHaveAttribute('aria-label', 'Collapse'));
        expect(toggle0).toHaveAttribute('aria-label', 'Expand');
        expect(screen.getAllByTestId('sidebar-menu-add-plan-goalstasks-details-goalsetting')).toHaveLength(1);
    }, 60000);

    test('deleting an instance requires confirmation', async () => {
        const { patient, practitioner } = await setup();

        await renderForm(patient, practitioner);

        const removeButton = await screen.findByTestId('sidebar-menu-remove-plan-goalstasks.items.0');
        act(() => {
            fireEvent.click(removeButton);
        });

        const confirmText = await screen.findByText('Are you sure you want to delete this item?');
        expect(confirmText).toBeInTheDocument();
        expect(screen.getByTestId('sidebar-menu-row-plan-goalstasks.items.0')).toBeInTheDocument();

        const confirmButton = await screen.findByText('OK');
        act(() => {
            fireEvent.click(confirmButton);
        });

        await waitFor(() =>
            expect(screen.queryByTestId('sidebar-menu-row-plan-goalstasks.items.0')).not.toBeInTheDocument(),
        );
    }, 60000);
});
