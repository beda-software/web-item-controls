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
import { ThemeProvider } from 'src/theme';

import { Group } from '..';

// A group qualifies for the accordion UX only when it has multiple nested group
// children where at least one repeats (see accordionContext.ts). "section-a" and
// "section-b" are siblings under "root" and section-a repeats, so this fixture
// exercises both the sibling accordion (bullet 3) and the cascading per-repeat
// accordion inside section-a (bullet 2).
const ROOT_ITEM: FCEQuestionnaireItem = {
    linkId: 'root',
    text: 'Root',
    type: 'group',
    item: [
        { linkId: 'plain-field', text: 'Plain field', type: 'string' },
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

const QUESTIONNAIRE_RESPONSE: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress',
    item: [
        {
            linkId: 'root',
            item: [
                // plain-field gates section-a/section-b (see accordionContext.ts's
                // getAccordionGateFields) - answered here so these fixtures keep
                // exercising tab-switching mechanics; the gate itself is covered by
                // GroupAccordionGate.test.tsx.
                { linkId: 'plain-field', answer: [{ valueString: 'Plain value' }] },
                { linkId: 'section-a', item: [{ linkId: 'value', answer: [{ valueString: 'A1 value' }] }] },
                { linkId: 'section-a', item: [{ linkId: 'value', answer: [{ valueString: 'A2 value' }] }] },
            ],
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

// Single nested repeatable group under its parent - below the ">1 sibling group"
// threshold, so the accordion must stay off and every instance keeps rendering,
// exactly like before this feature existed.
const NON_QUALIFYING_ROOT_ITEM: FCEQuestionnaireItem = {
    linkId: 'simple-root',
    text: 'Simple root',
    type: 'group',
    item: [
        {
            linkId: 'simple-repeatable',
            text: 'Simple repeatable',
            type: 'group',
            repeats: true,
            item: [{ linkId: 'value', text: 'Value', type: 'string' }],
        },
    ],
};

const NON_QUALIFYING_QUESTIONNAIRE: Questionnaire = {
    resourceType: 'Questionnaire',
    status: 'active',
    item: [NON_QUALIFYING_ROOT_ITEM],
};

const NON_QUALIFYING_RESPONSE: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress',
    item: [
        {
            linkId: 'simple-root',
            item: [
                { linkId: 'simple-repeatable', item: [{ linkId: 'value', answer: [{ valueString: 'S1 value' }] }] },
                { linkId: 'simple-repeatable', item: [{ linkId: 'value', answer: [{ valueString: 'S2 value' }] }] },
            ],
        },
    ],
};

const NON_QUALIFYING_CONTEXT: ItemContext[] = [
    {
        questionnaire: NON_QUALIFYING_QUESTIONNAIRE,
        resource: NON_QUALIFYING_RESPONSE,
        context: NON_QUALIFYING_RESPONSE,
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

function NonQualifyingProviders({ children }: { children: ReactNode }) {
    const methods = useForm<FormItems>({
        defaultValues: mapResponseToForm(NON_QUALIFYING_RESPONSE, NON_QUALIFYING_QUESTIONNAIRE),
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

describe('Group accordion UX', () => {
    test('only qualifies when a group has multiple nested groups, at least one repeatable', () => {
        act(() => {
            i18n.activate('en');
        });

        render(
            <NonQualifyingProviders>
                <Group questionItem={NON_QUALIFYING_ROOT_ITEM} parentPath={[]} context={NON_QUALIFYING_CONTEXT} />
            </NonQualifyingProviders>,
        );

        expect(screen.queryByTestId('breadcrumb')).not.toBeInTheDocument();

        const values = screen.getAllByDisplayValue(/S1 value|S2 value/);
        expect(values).toHaveLength(2);
    });

    test('only one sibling group is open at a time, but every tab (with its count) stays visible', () => {
        act(() => {
            i18n.activate('en');
        });

        render(
            <Providers>
                <Group questionItem={ROOT_ITEM} parentPath={[]} context={CONTEXT} />
            </Providers>,
        );

        expect(screen.getByText('Plain field')).toBeInTheDocument();

        // Section A is the default-active sibling: its count shows on its tab, and
        // only its cards render. Section B's tab is visible too, even though it's
        // collapsed - the collapsed sibling's own name is never hidden.
        expect(screen.getByTestId('breadcrumb-segment-section-a')).toBeInTheDocument();
        expect(screen.getByTestId('breadcrumb-segment-section-b')).toBeInTheDocument();
        expect(screen.getByText('(2)')).toBeInTheDocument();
        expect(screen.getByDisplayValue('A2 value')).toBeInTheDocument();
        expect(screen.queryByDisplayValue('A1 value')).not.toBeInTheDocument();

        // Switch to Section B directly - no need to open anything first.
        fireEvent.click(screen.getByText('Section B'));

        expect(screen.getByTestId('breadcrumb-segment-section-a')).toBeInTheDocument();
        expect(screen.getByTestId('breadcrumb-segment-section-b')).toBeInTheDocument();
        expect(screen.queryByDisplayValue('A2 value')).not.toBeInTheDocument();
        expect(screen.queryByDisplayValue('A1 value')).not.toBeInTheDocument();
    });

    test('within an open repeatable sibling, only the last item is open by default and toggling switches it', () => {
        act(() => {
            i18n.activate('en');
        });

        render(
            <Providers>
                <Group questionItem={ROOT_ITEM} parentPath={[]} context={CONTEXT} />
            </Providers>,
        );

        expect(screen.getByDisplayValue('A2 value')).toBeInTheDocument();
        expect(screen.queryByDisplayValue('A1 value')).not.toBeInTheDocument();

        // Switch to the first item directly - its tab is already visible.
        fireEvent.click(screen.getByText('Section A 1'));

        expect(screen.getByDisplayValue('A1 value')).toBeInTheDocument();
        expect(screen.queryByDisplayValue('A2 value')).not.toBeInTheDocument();
    });
});
