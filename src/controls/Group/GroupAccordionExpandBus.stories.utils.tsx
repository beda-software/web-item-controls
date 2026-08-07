import type { Decorator, StoryObj } from '@storybook/react';
import { Questionnaire, QuestionnaireResponse } from 'fhir/r4b';
import { FormProvider, useForm } from 'react-hook-form';
import {
    FCEQuestionnaireItem,
    FormItems,
    ItemContext,
    QuestionnaireResponseFormProvider,
    mapResponseToForm,
} from 'sdc-qrf';
import { expect, waitFor } from 'storybook/test';

import { success } from '@beda.software/remote-data';

import s from 'src/components/BaseQuestionnaireResponseForm/BaseQuestionnaireResponseForm.module.scss';
import { ValueSetExpandProvider } from 'src/contexts';
import { groupItemComponent, questionItemComponents } from 'src/controls';
import { GroupWizardBus } from 'src/controls/GroupWizard';

// Two nested accordion levels so a single 'expandGroup' dispatch has to cascade
// through more than one qualifying ancestor to reveal its target:
// bus-root
// ├── bus-section-a (repeats)      <- sibling accordion level 1
// │     └── bus-sub-a (repeats)    <- sibling accordion level 2, inside section-a's card
// │     └── bus-sub-b (repeats)
// └── bus-section-b (repeats)
export const ROOT_ITEM: FCEQuestionnaireItem = {
    linkId: 'bus-root',
    text: 'Root',
    type: 'group',
    item: [
        {
            linkId: 'bus-section-a',
            text: 'Section A',
            type: 'group',
            repeats: true,
            item: [
                {
                    linkId: 'bus-sub-a',
                    text: 'Sub A',
                    type: 'group',
                    repeats: true,
                    item: [{ linkId: 'bus-sub-a-value', text: 'Sub A value', type: 'string' }],
                },
                {
                    linkId: 'bus-sub-b',
                    text: 'Sub B',
                    type: 'group',
                    repeats: true,
                    item: [{ linkId: 'bus-sub-b-value', text: 'Sub B value', type: 'string' }],
                },
            ],
        },
        {
            linkId: 'bus-section-b',
            text: 'Section B',
            type: 'group',
            repeats: true,
            item: [{ linkId: 'bus-section-b-value', text: 'Section B value', type: 'string' }],
        },
    ],
};

export const QUESTIONNAIRE: Questionnaire = {
    resourceType: 'Questionnaire',
    status: 'active',
    item: [ROOT_ITEM],
};

export const QUESTIONNAIRE_RESPONSE: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress',
    item: [
        {
            linkId: 'bus-root',
            item: [
                {
                    linkId: 'bus-section-a',
                    item: [
                        {
                            linkId: 'bus-sub-a',
                            item: [{ linkId: 'bus-sub-a-value', answer: [{ valueString: 'sub-a value' }] }],
                        },
                        {
                            linkId: 'bus-sub-b',
                            item: [{ linkId: 'bus-sub-b-value', answer: [{ valueString: 'sub-b value' }] }],
                        },
                    ],
                },
                {
                    linkId: 'bus-section-b',
                    item: [{ linkId: 'bus-section-b-value', answer: [{ valueString: 'section-b value' }] }],
                },
            ],
        },
    ],
};

export const CONTEXT: ItemContext[] = [
    {
        questionnaire: QUESTIONNAIRE,
        resource: QUESTIONNAIRE_RESPONSE,
        context: QUESTIONNAIRE_RESPONSE,
    },
];

export const WithGroupAccordionProviderDecorator: Decorator = (Story) => {
    const methods = useForm<FormItems>({
        defaultValues: mapResponseToForm(QUESTIONNAIRE_RESPONSE, QUESTIONNAIRE),
    });

    return (
        <FormProvider {...methods}>
            <QuestionnaireResponseFormProvider
                questionItemComponents={questionItemComponents}
                groupItemComponent={groupItemComponent}
                formValues={{}}
                setFormValues={() => undefined}
                fhirService={async () => success(undefined)}
                evaluateFhirpath={() => []}
            >
                <ValueSetExpandProvider.Provider value={async () => []}>
                    <form className={s.form}>
                        <Story />
                    </form>
                </ValueSetExpandProvider.Provider>
            </QuestionnaireResponseFormProvider>
        </FormProvider>
    );
};

export function testExpandSibling() {
    const play: NonNullable<StoryObj['play']> = async ({ canvas }) => {
        // Force a known starting point instead of relying on the default-open
        // sibling, since a pending expand target from a previously-run story can
        // otherwise carry over (it's deliberately never cleared, see
        // accordionContext.ts).
        GroupWizardBus.dispatch({ type: 'expandGroup', groupLinkId: 'bus-sub-a' });
        await waitFor(() => expect(canvas.getByTestId('bus-sub-a-value')).toBeInTheDocument());
        expect(canvas.queryByTestId('bus-section-b-value')).not.toBeInTheDocument();

        GroupWizardBus.dispatch({ type: 'expandGroup', groupLinkId: 'bus-section-b' });

        await waitFor(() => expect(canvas.getByTestId('bus-section-b-value')).toBeInTheDocument());
        expect(canvas.queryByTestId('bus-sub-a-value')).not.toBeInTheDocument();
        expect(canvas.queryByTestId('bus-sub-b-value')).not.toBeInTheDocument();
    };

    return play;
}

export function testExpandCascadesThroughCollapsedAncestors() {
    const play: NonNullable<StoryObj['play']> = async ({ canvas }) => {
        // Collapse Section A (and, with it, its own sub-a/sub-b accordion) by
        // switching to Section B first.
        GroupWizardBus.dispatch({ type: 'expandGroup', groupLinkId: 'bus-section-b' });
        await waitFor(() => expect(canvas.getByTestId('bus-section-b-value')).toBeInTheDocument());
        expect(canvas.queryByTestId('bus-sub-a-value')).not.toBeInTheDocument();
        expect(canvas.queryByTestId('bus-sub-b-value')).not.toBeInTheDocument();

        // Targeting a field nested two accordion levels deep, inside the now
        // fully-collapsed (unmounted) Section A, must reveal both Section A and
        // Sub B in a single dispatch.
        GroupWizardBus.dispatch({ type: 'expandGroup', groupLinkId: 'bus-sub-b-value' });

        await waitFor(() => expect(canvas.getByTestId('bus-sub-b-value')).toBeInTheDocument());
        expect(canvas.queryByTestId('bus-sub-a-value')).not.toBeInTheDocument();
        expect(canvas.queryByTestId('bus-section-b-value')).not.toBeInTheDocument();
    };

    return play;
}
