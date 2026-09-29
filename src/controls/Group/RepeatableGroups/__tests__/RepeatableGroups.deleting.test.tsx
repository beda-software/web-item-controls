import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { screen, render, fireEvent, waitFor, act } from '@testing-library/react';
import { Questionnaire } from 'fhir/r4b';
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

import { ProcedureCase } from './types';

type FHIRService = ReturnType<typeof createInMemoryFHIRService>;

const getQuestionnaire = (): Questionnaire => {
    return {
        id: 'repeatable-group',
        name: 'Repeatable Group',
        title: 'Repeatable Group',
        status: 'active',
        meta: {
            profile: ['https://emr-core.beda.software/StructureDefinition/fhir-emr-questionnaire'],
        },
        item: [
            {
                text: 'Items',
                type: 'group',
                linkId: 'repeatable-group',
                item: [
                    {
                        item: [
                            {
                                text: 'Text',
                                type: 'string',
                                linkId: 'repeatable-group-text',
                            },
                        ],
                        type: 'group',
                        linkId: 'repeatable-group-inner',
                        repeats: true,
                    },
                ],
            },
        ],
        resourceType: 'Questionnaire',
    };
};

const CASE: ProcedureCase = {
    case: [
        {
            text: 'Test 1',
        },
        {
            text: 'Test 2',
        },
        {
            text: 'Test 3',
        },
        {
            text: 'Test 4',
        },
        {
            text: 'Test 5',
        },
    ],
};

describe('Repeatable group creates correct questionnaire response', async () => {
    function setup() {
        return createInMemoryFHIRService();
    }

    async function renderRepeatableGroupForm(fhirService: FHIRService) {
        const onSuccess = vi.fn();

        act(() => {
            i18n.activate('en');
        });

        const renderer = render(
            <ThemeProvider>
                <I18nProvider i18n={i18n}>
                    <QuestionnaireResponseForm
                        questionnaireLoader={questionnaireServiceLoader(() =>
                            Promise.resolve(success(getQuestionnaire())),
                        )}
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

        return { onSuccess, renderer };
    }

    test('Test group removes correct item', async () => {
        const fhirService = setup();

        const DELETING_INDEX = 1;

        await renderRepeatableGroupForm(fhirService);

        await waitFor(async () => await screen.findByTestId('submit-button'), { timeout: 2000 });

        if (CASE.case.length > 1) {
            const addAnotherAnswerButton = await screen.findByTestId('add-another-answer-button');

            CASE.case.slice(1).forEach(() => {
                act(() => {
                    fireEvent.click(addAnotherAnswerButton);
                });
            });
        }

        const textFields = await screen.findAllByTestId('repeatable-group-text');
        for (const [textFieldIndex, textField] of textFields.entries()) {
            expect(textField).toBeEnabled();

            const textInput = textField.querySelector('input')!;
            act(() => {
                fireEvent.change(textInput, {
                    target: { value: CASE.case[textFieldIndex]!.text },
                });
            });
            const textInput2 = textField.querySelector('input')!;

            await waitFor(() => {
                expect(textInput2.value).toBe(CASE.case[textFieldIndex]!.text);
            });
        }

        const allRemoveButton = await screen.findAllByTestId('remove-group-button');
        const removeButton = allRemoveButton[DELETING_INDEX]!;
        expect(removeButton).toBeEnabled();

        const removingTextField = textFields[DELETING_INDEX]!;
        expect(removingTextField).toBeEnabled();

        act(() => {
            fireEvent.click(removeButton);
        });

        await waitFor(() => {
            expect(removingTextField).not.toBeInTheDocument();
        });

        const textFields2 = await screen.findAllByTestId('repeatable-group-text');
        expect(textFields2).toHaveLength(CASE.case.length - 1);

        const controlCases = CASE.case.filter((_, index) => index !== DELETING_INDEX);

        for (const [textFieldIndex, textField] of textFields2.entries()) {
            const textFieldInput = textField.querySelector('input')!;

            expect(textFieldInput).toBeEnabled();
            expect(textFieldInput.value).toBe(controlCases[textFieldIndex]!.text);
        }
    }, 60000);

    test('Test group removes all items and add again', async () => {
        const fhirService = setup();

        await renderRepeatableGroupForm(fhirService);

        const addAnotherAnswerButton = await screen.findByTestId('add-another-answer-button');

        if (CASE.case.length > 1) {
            CASE.case.slice(1).forEach(() => {
                act(() => {
                    fireEvent.click(addAnotherAnswerButton);
                });
            });
        }

        const textFields = await screen.findAllByTestId('repeatable-group-text');
        for (const [textFieldIndex, textField] of textFields.entries()) {
            expect(textField).toBeEnabled();

            const textInput = textField.querySelector('input')!;
            act(() => {
                fireEvent.change(textInput, {
                    target: { value: CASE.case[textFieldIndex]!.text },
                });
            });
            const textInput2 = textField.querySelector('input')!;

            await waitFor(() => {
                expect(textInput2.value).toBe(CASE.case[textFieldIndex]!.text);
            });
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const _ of textFields) {
            const allRemoveButtons = await screen.findAllByTestId('remove-group-button');
            const removeButton = allRemoveButtons[0]!;

            expect(removeButton).toBeInTheDocument();

            act(() => {
                fireEvent.click(removeButton);
            });

            await waitFor(() => {
                expect(removeButton).not.toBeInTheDocument();
            });
        }

        const textFields2 = screen.queryByTestId('repeatable-group-text');
        expect(textFields2).toBeNull();

        if (CASE.case.length > 1) {
            CASE.case.forEach(() => {
                act(() => {
                    fireEvent.click(addAnotherAnswerButton);
                });
            });
        }

        await waitFor(async () => {
            const textFields3 = await screen.findAllByTestId('repeatable-group-text');
            expect(textFields3).toHaveLength(CASE.case.length);
        });
    }, 60000);
});
