import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react';
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

import { groupItemComponent, questionItemComponents } from 'src/controls';
import { GroupWizardBus } from 'src/controls/GroupWizard';
import { ThemeProvider } from 'src/theme';

import { Group } from '../index';

// bus-control-items has a qualifying sibling (bus-control-items-sibling), so its
// parent turns it into an accordion (see accordionContext.ts) and GroupWizardBus
// navigation/removal has something to act on.
const ROOT_ITEM: FCEQuestionnaireItem = {
    linkId: 'bus-control-root',
    text: 'Root',
    type: 'group',
    item: [
        {
            linkId: 'bus-control-items',
            text: 'Items',
            type: 'group',
            repeats: true,
            item: [{ linkId: 'value', text: 'Value', type: 'string' }],
        },
        {
            linkId: 'bus-control-items-sibling',
            text: 'Sibling',
            type: 'group',
            repeats: true,
            item: [{ linkId: 'sibling-value', text: 'Sibling value', type: 'string' }],
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
            linkId: 'bus-control-root',
            item: [
                { linkId: 'bus-control-items', item: [{ linkId: 'value', answer: [{ valueString: 'Item 1 value' }] }] },
                { linkId: 'bus-control-items', item: [{ linkId: 'value', answer: [{ valueString: 'Item 2 value' }] }] },
                {
                    linkId: 'bus-control-items-sibling',
                    item: [{ linkId: 'sibling-value', answer: [{ valueString: 'Sibling value' }] }],
                },
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

// A plain repeatable group with no qualifying sibling - GroupWizardBus item
// commands must be a no-op here, exactly as if this feature didn't exist.
const PLAIN_ROOT_ITEM: FCEQuestionnaireItem = {
    linkId: 'plain-bus-control-root',
    text: 'Root',
    type: 'group',
    item: [
        {
            linkId: 'plain-bus-control-items',
            text: 'Items',
            type: 'group',
            repeats: true,
            item: [{ linkId: 'value', text: 'Value', type: 'string' }],
        },
    ],
};

const PLAIN_QUESTIONNAIRE: Questionnaire = {
    resourceType: 'Questionnaire',
    status: 'active',
    item: [PLAIN_ROOT_ITEM],
};

const PLAIN_QUESTIONNAIRE_RESPONSE: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress',
    item: [
        {
            linkId: 'plain-bus-control-root',
            item: [
                {
                    linkId: 'plain-bus-control-items',
                    item: [{ linkId: 'value', answer: [{ valueString: 'Item 1 value' }] }],
                },
                {
                    linkId: 'plain-bus-control-items',
                    item: [{ linkId: 'value', answer: [{ valueString: 'Item 2 value' }] }],
                },
            ],
        },
    ],
};

const PLAIN_CONTEXT: ItemContext[] = [
    {
        questionnaire: PLAIN_QUESTIONNAIRE,
        resource: PLAIN_QUESTIONNAIRE_RESPONSE,
        context: PLAIN_QUESTIONNAIRE_RESPONSE,
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

function PlainProviders({ children }: { children: ReactNode }) {
    const methods = useForm<FormItems>({
        defaultValues: mapResponseToForm(PLAIN_QUESTIONNAIRE_RESPONSE, PLAIN_QUESTIONNAIRE),
    });

    return (
        <ThemeProvider>
            <I18nProvider i18n={i18n}>
                <FormProvider {...methods}>
                    <QuestionnaireResponseFormProvider
                        questionItemComponents={questionItemComponents}
                        groupItemComponent={groupItemComponent}
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

function renderPlainRoot() {
    act(() => {
        i18n.activate('en');
    });

    render(
        <PlainProviders>
            <Group questionItem={PLAIN_ROOT_ITEM} parentPath={[]} context={PLAIN_CONTEXT} />
        </PlainProviders>,
    );
}

describe('GroupWizardBus control over a plain (non-accordion) repeatable group', () => {
    test('addItem/openNextItem/openPreviousItem/removeItem are all no-ops', async () => {
        renderPlainRoot();

        expect(screen.getAllByDisplayValue(/Item 1 value|Item 2 value/)).toHaveLength(2);

        act(() => {
            GroupWizardBus.dispatch({ type: 'addItem', groupLinkId: 'plain-bus-control-items' });
            GroupWizardBus.dispatch({ type: 'openNextItem', groupLinkId: 'plain-bus-control-items' });
            GroupWizardBus.dispatch({ type: 'openPreviousItem', groupLinkId: 'plain-bus-control-items' });
        });

        // addItem still appends (it's a plain array mutation either way), but
        // nothing collapses since this group never qualified for the accordion.
        expect(screen.getAllByTestId('value')).toHaveLength(3);

        act(() => {
            GroupWizardBus.dispatch({ type: 'removeItem', groupLinkId: 'plain-bus-control-items' });
        });

        // No "current" item to target outside accordion mode, so no confirmation
        // dialog and nothing removed.
        await waitFor(() => {
            expect(screen.queryByText('Are you sure you want to delete this item?')).not.toBeInTheDocument();
        });
        expect(screen.getAllByTestId('value')).toHaveLength(3);
    });
});

describe('GroupWizardBus control over an accordion-mode repeatable group', () => {
    test('the group starts collapsed to its default-open item', () => {
        renderRoot();

        expect(screen.getByDisplayValue('Item 2 value')).toBeInTheDocument();
        expect(screen.queryByDisplayValue('Item 1 value')).not.toBeInTheDocument();
    });

    test('addItem appends a new item and opens only that one', () => {
        renderRoot();

        act(() => {
            GroupWizardBus.dispatch({ type: 'addItem', groupLinkId: 'bus-control-items' });
        });

        expect(screen.queryByDisplayValue('Item 1 value')).not.toBeInTheDocument();
        expect(screen.queryByDisplayValue('Item 2 value')).not.toBeInTheDocument();
        expect(screen.getAllByTestId('value')).toHaveLength(1);
    });

    test('openNextItem/openPreviousItem move which existing item is open', () => {
        renderRoot();

        expect(screen.getByDisplayValue('Item 2 value')).toBeInTheDocument();

        act(() => {
            GroupWizardBus.dispatch({ type: 'openPreviousItem', groupLinkId: 'bus-control-items' });
        });

        expect(screen.getByDisplayValue('Item 1 value')).toBeInTheDocument();
        expect(screen.queryByDisplayValue('Item 2 value')).not.toBeInTheDocument();

        // Already at the first item: no wraparound.
        act(() => {
            GroupWizardBus.dispatch({ type: 'openPreviousItem', groupLinkId: 'bus-control-items' });
        });
        expect(screen.getByDisplayValue('Item 1 value')).toBeInTheDocument();

        act(() => {
            GroupWizardBus.dispatch({ type: 'openNextItem', groupLinkId: 'bus-control-items' });
        });

        expect(screen.queryByDisplayValue('Item 1 value')).not.toBeInTheDocument();
        expect(screen.getByDisplayValue('Item 2 value')).toBeInTheDocument();
    });

    test('removeItem asks for confirmation before removing', async () => {
        renderRoot();

        act(() => {
            GroupWizardBus.dispatch({ type: 'openPreviousItem', groupLinkId: 'bus-control-items' });
        });
        expect(screen.getByDisplayValue('Item 1 value')).toBeInTheDocument();

        act(() => {
            GroupWizardBus.dispatch({ type: 'removeItem', groupLinkId: 'bus-control-items' });
        });

        await waitFor(() => expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument());
        // The item is still there until the dialog is confirmed.
        expect(screen.getByDisplayValue('Item 1 value')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

        await waitFor(() => expect(screen.queryByDisplayValue('Item 1 value')).not.toBeInTheDocument());
    });

    test('removeItem does nothing if the confirmation is cancelled', async () => {
        renderRoot();

        act(() => {
            GroupWizardBus.dispatch({ type: 'openPreviousItem', groupLinkId: 'bus-control-items' });
        });
        expect(screen.getByDisplayValue('Item 1 value')).toBeInTheDocument();

        act(() => {
            GroupWizardBus.dispatch({ type: 'removeItem', groupLinkId: 'bus-control-items' });
        });

        await waitFor(() => expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument());

        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

        await waitFor(() =>
            expect(screen.queryByText('Are you sure you want to delete this item?')).not.toBeInTheDocument(),
        );
        expect(screen.getByDisplayValue('Item 1 value')).toBeInTheDocument();
    });
});
