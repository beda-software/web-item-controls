import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { screen, render, act, fireEvent, waitFor } from '@testing-library/react';
import { Questionnaire, QuestionnaireItem } from 'fhir/r4b';
import { expect, test, vi } from 'vitest';

import { QuestionnaireResponseForm } from '@beda.software/fhir-questionnaire';
import { questionnaireServiceLoader } from '@beda.software/fhir-questionnaire/components';
import { success } from '@beda.software/remote-data';

import { createInMemoryFHIRService } from 'src/__tests__/fhir-service-mock';
import { FormWrapper } from 'src/components/FormWrapper';
import {
    groupItemComponent,
    itemControlGroupItemComponents,
    itemControlQuestionItemComponents,
    questionItemComponents,
} from 'src/controls';
import { ThemeProvider } from 'src/theme';

const integerItem = (linkId: string, required: boolean): QuestionnaireItem => ({
    text: linkId,
    type: 'integer',
    linkId,
    required,
});

const getQuestionnaire = (): Questionnaire => ({
    name: 'Group tabs test',
    title: 'Group tabs test',
    resourceType: 'Questionnaire',
    status: 'active',
    id: 'group-tabs-test',
    meta: {
        profile: ['https://emr-core.beda.software/StructureDefinition/fhir-emr-questionnaire'],
    },
    url: 'https://aidbox.emr.beda.software/fhir/Questionnaire/group-tabs-test',
    item: [
        {
            type: 'group',
            linkId: 'tabs',
            extension: [
                {
                    url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                    valueCodeableConcept: { coding: [{ code: 'group-tabs' }] },
                },
            ],
            item: [
                {
                    linkId: 'tab-1',
                    type: 'group',
                    text: 'Tab 1',
                    item: [integerItem('test-integer-1-1', true), integerItem('test-integer-1-2', true)],
                },
                {
                    linkId: 'tab-2',
                    type: 'group',
                    text: 'Tab 2',
                    item: [integerItem('test-integer-2', false)],
                },
                {
                    linkId: 'tab-3',
                    type: 'group',
                    text: 'Tab 3',
                    item: [
                        integerItem('test-integer-3', false),
                        {
                            linkId: 'tab-3-1',
                            text: 'Group 3.1',
                            type: 'group',
                            item: [integerItem('test-integer-3-1', true)],
                        },
                    ],
                },
            ],
        },
    ],
});

const EXPECTED_ERRORS: Record<string, number> = {
    'tab-1': 2,
    'tab-2': 0,
    'tab-3': 1,
};

async function renderGroupTabsForm() {
    const fhirService = createInMemoryFHIRService();
    const onSuccess = vi.fn();

    act(() => {
        i18n.activate('en');
    });

    render(
        <ThemeProvider>
            <I18nProvider i18n={i18n}>
                <QuestionnaireResponseForm
                    questionnaireLoader={questionnaireServiceLoader(() => Promise.resolve(success(getQuestionnaire())))}
                    onSuccess={onSuccess}
                    serviceProvider={{ service: fhirService.service }}
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

describe('GroupTabs validation errors', () => {
    test('shows no errors before submit', async () => {
        await renderGroupTabsForm();

        for (const tabLinkId of Object.keys(EXPECTED_ERRORS)) {
            const tab = await screen.findByTestId(`group-tab-${tabLinkId}`);
            expect(tab).toHaveAttribute('data-has-errors', 'false');
            expect(screen.queryByTestId(`group-tab-errors-count-${tabLinkId}`)).not.toBeInTheDocument();
        }
    }, 60000);

    test('shows the number of validation errors for each tab after submit', async () => {
        const onSuccess = await renderGroupTabsForm();

        const submitButton = await screen.findByTestId('submit-button');
        act(() => {
            fireEvent.click(submitButton);
        });

        for (const [tabLinkId, errorsCount] of Object.entries(EXPECTED_ERRORS)) {
            await waitFor(() => {
                const tab = screen.getByTestId(`group-tab-${tabLinkId}`);
                expect(tab).toHaveAttribute('data-has-errors', errorsCount > 0 ? 'true' : 'false');

                const badge = screen.queryByTestId(`group-tab-errors-count-${tabLinkId}`);
                if (errorsCount > 0) {
                    expect(badge).toHaveTextContent(String(errorsCount));
                } else {
                    expect(badge).not.toBeInTheDocument();
                }
            });
        }
        expect(onSuccess).not.toHaveBeenCalled();
    }, 60000);

    test('updates the errors count when an invalid field is fixed', async () => {
        await renderGroupTabsForm();

        const submitButton = await screen.findByTestId('submit-button');
        act(() => {
            fireEvent.click(submitButton);
        });
        await waitFor(() => expect(screen.getByTestId('group-tab-errors-count-tab-1')).toHaveTextContent('2'));

        const input = (await screen.findByTestId('test-integer-1-1')).querySelector('input')!;
        act(() => {
            fireEvent.change(input, { target: { value: '42' } });
        });

        await waitFor(() => expect(screen.getByTestId('group-tab-errors-count-tab-1')).toHaveTextContent('1'));
        expect(screen.getByTestId('group-tab-errors-count-tab-3')).toHaveTextContent('1');
    }, 60000);
});
