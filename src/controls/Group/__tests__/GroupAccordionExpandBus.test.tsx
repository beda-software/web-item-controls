import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { FormItems, QuestionnaireResponseFormProvider, mapResponseToForm } from 'sdc-qrf';
import { describe, expect, test } from 'vitest';

import { success } from '@beda.software/remote-data';

import { groupItemComponent, questionItemComponents } from 'src/controls';
import { GroupWizardBus } from 'src/controls/GroupWizard';
import { ThemeProvider } from 'src/theme';

import { CONTEXT, QUESTIONNAIRE, QUESTIONNAIRE_RESPONSE, ROOT_ITEM } from '../GroupAccordionExpandBus.stories.utils';
import { Group } from '../index';

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

describe('GroupWizardBus-driven group expansion', () => {
    test('expanding a sibling group by linkId switches which one is open', () => {
        act(() => {
            i18n.activate('en');
            GroupWizardBus.dispatch({ type: 'expandGroup', groupLinkId: 'bus-sub-a' });
        });

        render(
            <Providers>
                <Group questionItem={ROOT_ITEM} parentPath={[]} context={CONTEXT} />
            </Providers>,
        );

        expect(screen.getByTestId('bus-sub-a-value')).toBeInTheDocument();
        expect(screen.queryByTestId('bus-section-b-value')).not.toBeInTheDocument();

        act(() => {
            GroupWizardBus.dispatch({ type: 'expandGroup', groupLinkId: 'bus-section-b' });
        });

        expect(screen.getByTestId('bus-section-b-value')).toBeInTheDocument();
        expect(screen.queryByTestId('bus-sub-a-value')).not.toBeInTheDocument();
        expect(screen.queryByTestId('bus-sub-b-value')).not.toBeInTheDocument();
    });

    test('expanding a target nested two accordion levels deep reveals every collapsed ancestor', () => {
        act(() => {
            i18n.activate('en');
            // Start with Section A (and its own sub-a/sub-b accordion) collapsed.
            GroupWizardBus.dispatch({ type: 'expandGroup', groupLinkId: 'bus-section-b' });
        });

        render(
            <Providers>
                <Group questionItem={ROOT_ITEM} parentPath={[]} context={CONTEXT} />
            </Providers>,
        );

        expect(screen.getByTestId('bus-section-b-value')).toBeInTheDocument();
        expect(screen.queryByTestId('bus-sub-a-value')).not.toBeInTheDocument();
        expect(screen.queryByTestId('bus-sub-b-value')).not.toBeInTheDocument();

        act(() => {
            GroupWizardBus.dispatch({ type: 'expandGroup', groupLinkId: 'bus-sub-b-value' });
        });

        // A single dispatch reopened Section A (the collapsed ancestor) and picked
        // Sub B (not the default Sub A) as its active sibling in the same pass.
        expect(screen.getByTestId('bus-sub-b-value')).toBeInTheDocument();
        expect(screen.queryByTestId('bus-sub-a-value')).not.toBeInTheDocument();
        expect(screen.queryByTestId('bus-section-b-value')).not.toBeInTheDocument();
    });
});
