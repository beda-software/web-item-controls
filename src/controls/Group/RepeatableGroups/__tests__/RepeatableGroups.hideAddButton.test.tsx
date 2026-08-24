import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { FCEQuestionnaireItem, FormItems, ItemContext, QuestionnaireResponseFormProvider } from 'sdc-qrf';
import { describe, expect, test } from 'vitest';

import { success } from '@beda.software/remote-data';

import { groupItemComponent, questionItemComponents } from 'src/controls';
import { ThemeProvider } from 'src/theme';

import { Group } from '../../index';

const GROUP_ITEM: FCEQuestionnaireItem = {
    linkId: 'repeatable-example',
    text: 'Contact',
    type: 'group',
    repeats: true,
    item: [{ linkId: 'contact-name', text: 'Name', type: 'string' }],
};

const CONTEXT: ItemContext[] = [
    {
        questionnaire: { resourceType: 'Questionnaire', status: 'active', item: [GROUP_ITEM] },
        resource: { resourceType: 'QuestionnaireResponse', status: 'in-progress' },
        context: { resourceType: 'QuestionnaireResponse', status: 'in-progress' },
    },
];

function Providers({ children }: { children: ReactNode }) {
    const methods = useForm<FormItems>({ defaultValues: {} });

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

describe('GroupHideAddItemButton extension', () => {
    test('add button is shown by default for a repeating group', () => {
        act(() => {
            i18n.activate('en');
        });

        render(
            <Providers>
                <Group questionItem={GROUP_ITEM} parentPath={[]} context={CONTEXT} />
            </Providers>,
        );

        expect(screen.getByTestId('add-another-answer-button')).toBeInTheDocument();
    });

    test('add button is hidden when GroupHideAddItemButton extension is set to true', () => {
        act(() => {
            i18n.activate('en');
        });

        const hiddenAddButtonItem: FCEQuestionnaireItem = {
            ...GROUP_ITEM,
            extension: [
                {
                    url: 'https://smartforms.csiro.au/ig/StructureDefinition/GroupHideAddItemButton',
                    valueBoolean: true,
                },
            ],
        };

        render(
            <Providers>
                <Group questionItem={hiddenAddButtonItem} parentPath={[]} context={CONTEXT} />
            </Providers>,
        );

        expect(screen.queryByTestId('add-another-answer-button')).not.toBeInTheDocument();
    });
});
