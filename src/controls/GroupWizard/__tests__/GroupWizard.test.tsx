import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { screen, render, act, fireEvent, waitFor } from '@testing-library/react';
import { Patient, Practitioner, Questionnaire } from 'fhir/r4b';
import { expect, test, vi } from 'vitest';

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
        name: 'Group wizard test',
        title: 'Group wizard test',
        resourceType: 'Questionnaire',
        status: 'active',
        id: 'group-wizard-test',
        meta: {
            profile: ['https://emr-core.beda.software/StructureDefinition/fhir-emr-questionnaire'],
        },
        url: 'https://aidbox.emr.beda.software/fhir/Questionnaire/group-wizard-test',
        item: [
            {
                type: 'group',
                linkId: 'wizard',
                extension: [
                    {
                        url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                        valueCodeableConcept: {
                            coding: [
                                {
                                    code: 'wizard',
                                },
                            ],
                        },
                    },
                ],
                item: [
                    {
                        linkId: 'group-1',
                        type: 'group',
                        text: 'Group 1',
                        item: [
                            {
                                text: 'Test integer 1',
                                type: 'integer',
                                linkId: 'test-integer-1',
                                required: true,
                            },
                        ],
                    },
                    {
                        linkId: 'group-2',
                        text: 'Group 2',
                        type: 'group',
                        item: [
                            {
                                text: 'Test integer 2',
                                type: 'integer',
                                linkId: 'test-integer-2',
                                required: false,
                            },
                        ],
                    },
                    {
                        linkId: 'group-3',
                        text: 'Group 3',
                        type: 'group',
                        item: [
                            {
                                text: 'Test integer 3',
                                type: 'integer',
                                linkId: 'test-integer-3',
                                required: false,
                            },
                            {
                                linkId: 'group-3-1',
                                text: 'Group 3.1',
                                type: 'group',
                                item: [
                                    {
                                        text: 'Test integer 3.1',
                                        type: 'integer',
                                        linkId: 'test-integer-3-1',
                                        required: true,
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        linkId: 'group-4',
                        text: 'Group 4',
                        type: 'group',
                        item: [
                            {
                                text: 'Test integer 4',
                                type: 'integer',
                                linkId: 'test-integer-4',
                                required: false,
                            },
                        ],
                    },
                ],
            },
        ],
    };
};

type WizardGroup = {
    linkId: string;
    required: boolean;
};
const WIZARD_GROUPS: WizardGroup[] = [
    { linkId: 'group-1', required: true },
    { linkId: 'group-2', required: false },
    { linkId: 'group-3', required: true },
    { linkId: 'group-4', required: false },
];

describe('WizardGroup renders correctly', async () => {
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

    async function renderWizardGroupForm(patient: Patient, practitioner: WithId<Practitioner>) {
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

    test('Test only steps with errors are invalid', async () => {
        const { patient, practitioner } = await setup();

        await renderWizardGroupForm(patient, practitioner);

        const stepsIcons = [];
        for (const group of WIZARD_GROUPS) {
            stepsIcons.push(await screen.findByTestId(`wizard-step-icon-${group.linkId}`));
        }

        expect(stepsIcons).toHaveLength(WIZARD_GROUPS.length);

        const lastStepIcon = stepsIcons[stepsIcons.length - 1];
        expect(lastStepIcon).toBeDefined();

        act(() => {
            fireEvent.click(lastStepIcon!);
        });

        const submitButton = await screen.findByTestId('submit-button');

        act(() => {
            fireEvent.click(submitButton);
        });

        for (const [stepIconIndex, stepIcon] of stepsIcons.entries()) {
            const wizardGroup = WIZARD_GROUPS[stepIconIndex]!;

            await waitFor(() => {
                const stepHasError =
                    stepIcon.parentElement?.parentElement?.parentElement?.parentElement?.className.includes(
                        'ant-steps-item-error',
                    );

                expect(stepHasError).toBe(wizardGroup.required ? true : false);
            });
        }
    }, 60000);
});
