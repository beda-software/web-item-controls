import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Questionnaire, QuestionnaireResponse } from 'fhir/r4b';
import { ReactNode } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import {
    FCEQuestionnaireItem,
    FormItems,
    ItemContext,
    QuestionnaireResponseFormProvider,
    mapResponseToForm,
} from 'sdc-qrf';
import { describe, expect, test } from 'vitest';

import { success } from '@beda.software/remote-data';

import {
    groupItemComponent,
    itemControlGroupItemComponents,
    itemControlQuestionItemComponents,
    questionItemComponents,
} from 'src/controls';
import { GroupWizardBus } from 'src/controls/GroupWizard';
import { ThemeProvider } from 'src/theme';

import { Group } from '..';

// "gate-field" is a direct field of the group (not a nested group), so it gates
// section-a/section-b (see getAccordionGateFields in accordionContext.ts) - the group
// still qualifies for the accordion the same way GroupAccordion.test.tsx's fixture
// does (multiple nested groups, one repeatable).
const ROOT_ITEM: FCEQuestionnaireItem = {
    linkId: 'root',
    text: 'Root',
    type: 'group',
    item: [
        { linkId: 'gate-field', text: 'Gate field', type: 'string' },
        {
            linkId: 'section-a',
            text: 'Section A',
            type: 'group',
            repeats: true,
            item: [{ linkId: 'value', text: 'Value', type: 'string' }],
        },
        {
            linkId: 'section-b',
            text: 'Section B',
            type: 'group',
            repeats: true,
            item: [{ linkId: 'value', text: 'Value', type: 'string' }],
        },
    ],
};

const QUESTIONNAIRE: Questionnaire = {
    resourceType: 'Questionnaire',
    status: 'active',
    item: [ROOT_ITEM],
};

// gate-field starts unanswered (so the gate starts unsatisfied), but section-a
// already has an item - proves the gate keeps section-a's tab closed at mount even
// though it already has data (see ChildGroupAccordionProvider.tsx).
const QUESTIONNAIRE_RESPONSE: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress',
    item: [
        {
            linkId: 'root',
            item: [{ linkId: 'section-a', item: [{ linkId: 'value', answer: [{ valueString: 'A value' }] }] }],
        },
    ],
};

const CONTEXT: ItemContext[] = [
    {
        questionnaire: QUESTIONNAIRE,
        resource: QUESTIONNAIRE_RESPONSE,
        context: QUESTIONNAIRE_RESPONSE,
    },
];

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
                        <form>{children}</form>
                    </QuestionnaireResponseFormProvider>
                </FormProvider>
            </I18nProvider>
        </ThemeProvider>
    );
}

function renderRoot() {
    act(() => {
        i18n.activate('en');
    });

    render(
        <Providers>
            <Group questionItem={ROOT_ITEM} parentPath={[]} context={CONTEXT} />
        </Providers>,
    );
}

describe('Group accordion gate', () => {
    test('candidate tabs are disabled with a hint until the gate field has a value', () => {
        renderRoot();

        const sectionATab = screen.getByText('Section A').closest('button')!;
        const sectionBTab = screen.getByText('Section B').closest('button')!;

        expect(sectionATab).toBeDisabled();
        expect(sectionBTab).toBeDisabled();
        expect(screen.getByText(/Define Gate field first/)).toBeInTheDocument();

        // section-a already has an item, but the gate still keeps it closed at mount.
        expect(screen.queryByDisplayValue('A value')).not.toBeInTheDocument();

        // Clicking a disabled tab is a no-op - nothing opens.
        fireEvent.click(sectionATab);
        expect(screen.queryByDisplayValue('A value')).not.toBeInTheDocument();
    });

    test('answering the gate field enables the tabs and clears the hint', () => {
        renderRoot();

        fireEvent.change(screen.getByTestId('gate-field').querySelector('input')!, {
            target: { value: 'Answered' },
        });

        const sectionATab = screen.getByText('Section A').closest('button')!;

        expect(sectionATab).not.toBeDisabled();
        expect(screen.queryByText(/Define Gate field first/)).not.toBeInTheDocument();
    });

    test('opening a tab makes the gate field read-only, and clicking it again closes the tab and re-enables editing', () => {
        renderRoot();

        fireEvent.change(screen.getByTestId('gate-field').querySelector('input')!, {
            target: { value: 'Answered' },
        });

        expect(screen.getByTestId('gate-field').querySelector('input')).not.toBeDisabled();

        fireEvent.click(screen.getByText('Section A').closest('button')!);

        expect(screen.getByDisplayValue('A value')).toBeInTheDocument();
        // Locked means rendered with the readonly-controls display component, not a
        // disabled edit control - no input left to query for, and its value shows as
        // plain text instead (see ReadOnlyGateField in GroupChildren.tsx).
        expect(screen.getByText('Answered')).toBeInTheDocument();
        expect(screen.queryByTestId('gate-field')).not.toBeInTheDocument();
        expect(screen.getByText(/Read-only while editing Section A/)).toBeInTheDocument();

        // Clicking the read-only gate field's overlay closes the open tab and
        // re-enables it - the tabs themselves stay enabled since the gate is still
        // satisfied.
        fireEvent.click(screen.getByTestId('gate-field-gate-field'));

        expect(screen.queryByDisplayValue('A value')).not.toBeInTheDocument();
        expect(screen.getByTestId('gate-field').querySelector('input')).not.toBeDisabled();
        expect(screen.getByText('Section A').closest('button')).not.toBeDisabled();
    });

    test("reactivateGateField on GroupWizardBus has the same effect as clicking the overlay, keyed by the parent group's own linkId", () => {
        renderRoot();

        fireEvent.change(screen.getByTestId('gate-field').querySelector('input')!, {
            target: { value: 'Answered' },
        });
        fireEvent.click(screen.getByText('Section A').closest('button')!);

        expect(screen.getByDisplayValue('A value')).toBeInTheDocument();
        expect(screen.queryByTestId('gate-field')).not.toBeInTheDocument();

        // A groupLinkId that isn't the parent group's own ("root") is a no-op.
        act(() => {
            GroupWizardBus.dispatch({ type: 'reactivateGateField', groupLinkId: 'section-a' });
        });
        expect(screen.queryByTestId('gate-field')).not.toBeInTheDocument();

        act(() => {
            GroupWizardBus.dispatch({ type: 'reactivateGateField', groupLinkId: 'root' });
        });

        expect(screen.queryByDisplayValue('A value')).not.toBeInTheDocument();
        expect(screen.getByTestId('gate-field').querySelector('input')).not.toBeDisabled();
        expect(screen.getByText('Section A').closest('button')).not.toBeDisabled();
    });
});
