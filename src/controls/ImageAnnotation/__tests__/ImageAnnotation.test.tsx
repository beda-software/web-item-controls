import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Questionnaire } from 'fhir/r4b';
import { useFormContext } from 'react-hook-form';
import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest';

import { QuestionnaireResponseForm } from '@beda.software/fhir-questionnaire';
import { FormWrapperProps, questionnaireServiceLoader } from '@beda.software/fhir-questionnaire/components';
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

const getQuestionnaire = (): Questionnaire => ({
    id: 'image-annotation-validation',
    name: 'Image annotation validation',
    title: 'Image annotation validation',
    status: 'active',
    resourceType: 'Questionnaire',
    meta: {
        profile: ['https://emr-core.beda.software/StructureDefinition/fhir-emr-questionnaire'],
    },
    item: [
        {
            linkId: 'annotations',
            type: 'group',
            text: 'Note',
            repeats: true,
            extension: [
                {
                    url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                    valueCodeableConcept: { coding: [{ code: 'image-annotation' }] },
                },
            ],
            item: [
                { linkId: 'x', type: 'decimal', text: 'X' },
                { linkId: 'y', type: 'decimal', text: 'Y' },
                { linkId: 'title', type: 'string', text: 'Title', required: true },
            ],
        },
    ],
});

// Exposes the form errors: whether a control renders a nested group error depends on the control,
// so the test checks the form state itself
function FormWrapperWithErrors(props: FormWrapperProps) {
    const { formState } = useFormContext();

    return (
        <>
            <FormWrapper {...props} />
            <span data-testid="form-errors">{Object.keys(formState.errors).length}</span>
        </>
    );
}

const getErrorsCount = () => Number(screen.getByTestId('form-errors').textContent);

let rectSpy: ReturnType<typeof vi.spyOn> | undefined;

async function renderImageAnnotationForm() {
    const fhirService = createInMemoryFHIRService();
    const onSuccess = vi.fn();

    render(
        <ThemeProvider>
            <I18nProvider i18n={i18n}>
                <QuestionnaireResponseForm
                    questionnaireLoader={questionnaireServiceLoader(() => Promise.resolve(success(getQuestionnaire())))}
                    onSuccess={onSuccess}
                    serviceProvider={{ service: fhirService.service }}
                    FormWrapper={FormWrapperWithErrors}
                    groupItemComponent={groupItemComponent}
                    questionItemComponents={questionItemComponents}
                    itemControlQuestionItemComponents={itemControlQuestionItemComponents}
                    itemControlGroupItemComponents={itemControlGroupItemComponents}
                />
            </I18nProvider>
        </ThemeProvider>,
    );

    // jsdom has no layout, so give the image a size for the click to place a marker
    rectSpy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 200,
        height: 100,
    } as DOMRect);
    await screen.findByTestId('image-annotation-canvas');

    return { onSuccess };
}

// The form may start with an empty annotation that has no marker, so markers are counted instead of looked up by index
const queryMarkers = () => screen.queryAllByTestId(/^annotation-marker-/);

async function addAnnotation() {
    const markersCount = queryMarkers().length;
    act(() => {
        fireEvent.click(screen.getByTestId('image-annotation-canvas'), {
            clientX: 20 + markersCount * 40,
            clientY: 50,
        });
    });

    await waitFor(() => expect(queryMarkers()).toHaveLength(markersCount + 1));
}

describe('ImageAnnotation validation errors', () => {
    beforeAll(() => {
        i18n.activate('en');
    });

    afterEach(() => {
        rectSpy?.mockRestore();
    });

    test('shows no errors for the details of a just added annotation before submit', async () => {
        await renderImageAnnotationForm();

        await addAnnotation();

        expect(await screen.findByTestId('title')).toBeInTheDocument();
        // The resolver runs asynchronously, so let a validation triggered by the change settle first
        await act(() => new Promise((resolve) => setTimeout(resolve, 100)));
        expect(getErrorsCount()).toBe(0);
    }, 60000);

    test('shows no errors for the remaining annotations when one is removed before submit', async () => {
        await renderImageAnnotationForm();

        await addAnnotation();
        await addAnnotation();
        act(() => {
            fireEvent.click(screen.getByTestId('remove-annotation-button'));
        });

        await waitFor(() => expect(queryMarkers()).toHaveLength(1));
        expect(getErrorsCount()).toBe(0);
    }, 60000);

    test('shows the errors for the annotation details after submit', async () => {
        const { onSuccess } = await renderImageAnnotationForm();

        await addAnnotation();
        act(() => {
            fireEvent.click(screen.getByTestId('submit-button'));
        });

        await waitFor(() => expect(getErrorsCount()).toBeGreaterThan(0));
        expect(onSuccess).not.toHaveBeenCalled();
    }, 60000);
});
