import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { screen, render, fireEvent, waitFor, act } from '@testing-library/react';
import { Patient, Practitioner, Questionnaire, QuestionnaireResponse } from 'fhir/r4b';
import { describe, expect, test, vi } from 'vitest';

import { QuestionnaireResponseForm } from '@beda.software/fhir-questionnaire';
import { questionnaireServiceLoader } from '@beda.software/fhir-questionnaire/components';
import { ensure, extractBundleResources, WithId, withRootAccess } from '@beda.software/fhir-react';
import { success } from '@beda.software/remote-data';

import { FormWrapper } from 'src/components/FormWrapper';
import {
    itemControlGroupItemComponents,
    itemControlQuestionItemComponents,
    questionItemComponents,
    groupItemComponent,
} from 'src/controls';
import { axiosInstance, getFHIRResources, service } from 'src/services/fhir';
import { createPatient, createPractitionerRole, loginAdminUser } from 'src/setupTests';
import { ThemeProvider } from 'src/theme';
import { evaluate } from 'src/utils/fhirpath';

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
                text: 'Text',
                type: 'string',
                linkId: 'simple-text',
            },
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

type ProcedureCase = {
    case: { text: string }[];
};

const CASES: ProcedureCase[] = [
    {
        case: [
            {
                text: 'Test 1',
            },
        ],
    },
    {
        case: [
            {
                text: 'Test 2',
            },
            {
                text: 'Test 3',
            },
        ],
    },
    {
        case: [
            {
                text: 'Test 4',
            },
            {
                text: 'Test 5',
            },
            {
                text: 'Test 6',
            },
        ],
    },
    {
        case: [
            {
                text: 'Test 7',
            },
            {
                text: 'Test 8',
            },
            {
                text: 'Test 9',
            },
            {
                text: 'Test 10',
            },
            {
                text: 'Test 11',
            },
        ],
    },
];

describe('Repeatable group creates correct questionnaire response', async () => {
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

    async function renderRepeatableGroupForm(patient: Patient, practitioner: WithId<Practitioner>) {
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

    test('Test questionnaire loading', async () => {
        const { patient, practitioner } = await setup();

        const onSuccess = await renderRepeatableGroupForm(patient, practitioner);

        await waitFor(async () => await screen.findByTestId('submit-button'), { timeout: 2000 });

        const submitButton = await screen.findByTestId('submit-button');
        expect(submitButton).toBeEnabled();

        act(() => {
            fireEvent.click(submitButton);
        });

        await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    });

    test.each(CASES)(
        'Test group adding first and then filling all fields',
        async (caseData) => {
            const { patient, practitioner } = await setup();

            const onSuccess = await renderRepeatableGroupForm(patient, practitioner);

            await waitFor(async () => await screen.findByTestId('submit-button'), { timeout: 2000 });

            if (caseData.case.length > 1) {
                const addAnotherAnswerButton = await screen.findByTestId('add-another-answer-button');
                caseData.case.slice(1).forEach(() => {
                    act(() => {
                        fireEvent.click(addAnotherAnswerButton);
                    });
                });
            }

            const textFields = await screen.findAllByTestId('repeatable-group-text');
            textFields.forEach((textField, textFieldIndex) => {
                expect(textField).toBeEnabled();

                const textInput = textField.querySelector('input')!;
                act(() => {
                    fireEvent.change(textInput, {
                        target: { value: caseData.case[textFieldIndex]!.text },
                    });
                });
            });

            const submitButton = await screen.findByTestId('submit-button');
            expect(submitButton).toBeEnabled();

            act(() => {
                fireEvent.click(submitButton);
            });

            await waitFor(() => expect(onSuccess).toHaveBeenCalled());

            await withRootAccess(axiosInstance, async () => {
                const qrsBundleRD = await getFHIRResources<QuestionnaireResponse>('QuestionnaireResponse', {
                    questionnaire: 'repeatable-group',
                    _sort: ['-createdAt', '_id'],
                });

                const qrs = extractBundleResources(ensure(qrsBundleRD)).QuestionnaireResponse;
                expect(qrs.length).toBeGreaterThan(0);

                const currentQR = qrs[0];

                const repeatableGroupTexts = evaluate(
                    currentQR,
                    "QuestionnaireResponse.repeat(item).where(linkId='repeatable-group-text')",
                );
                expect(repeatableGroupTexts.length).toBe(caseData.case.length);

                repeatableGroupTexts.forEach((text, textIndex) => {
                    expect(text!.answer[0].valueString).toBe(caseData.case[textIndex]!.text);
                });
            });
        },
        60000,
    );

    test.each(CASES)(
        'Test filling all fields and adding one by one',
        async (caseData) => {
            const { patient, practitioner } = await setup();

            const onSuccess = await renderRepeatableGroupForm(patient, practitioner);

            for (const [caseIndex, caseItem] of caseData.case.entries()) {
                const textFields = await screen.findAllByTestId('repeatable-group-text');
                const textField = textFields[caseIndex];
                expect(textField).toBeEnabled();

                const textInput = textField!.querySelector('input')!;
                act(() => {
                    fireEvent.change(textInput, {
                        target: { value: caseItem.text },
                    });
                });

                const isLastText = caseIndex === caseData.case.length - 1;
                if (!isLastText) {
                    const addAnotherAnswerButton = (await screen.findByText('Add another answer')).parentElement!;
                    act(() => {
                        fireEvent.click(addAnotherAnswerButton);
                    });
                }
            }

            const submitButton = await screen.findByTestId('submit-button');
            expect(submitButton).toBeEnabled();

            act(() => {
                fireEvent.click(submitButton);
            });

            await waitFor(() => expect(onSuccess).toHaveBeenCalled());

            await withRootAccess(axiosInstance, async () => {
                const qrsBundleRD = await getFHIRResources<QuestionnaireResponse>('QuestionnaireResponse', {
                    questionnaire: 'repeatable-group',
                    _sort: ['-createdAt', '_id'],
                });

                const qrs = extractBundleResources(ensure(qrsBundleRD)).QuestionnaireResponse;
                expect(qrs.length).toBeGreaterThan(0);

                const currentQR = qrs[0];

                const repeatableGroupTexts = evaluate(
                    currentQR,
                    "QuestionnaireResponse.repeat(item).where(linkId='repeatable-group-text')",
                );
                expect(repeatableGroupTexts.length).toBe(caseData.case.length);

                repeatableGroupTexts.forEach((text, textIndex) => {
                    expect(text!.answer[0].valueString).toBe(caseData.case[textIndex]!.text);
                });

                repeatableGroupTexts.forEach((text, textIndex) => {
                    expect(text!.answer[0].valueString).toBe(caseData.case[textIndex]!.text);
                });
            });
        },
        60000,
    );
});
