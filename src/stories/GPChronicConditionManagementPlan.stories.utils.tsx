import type { Decorator } from '@storybook/react';
import { Questionnaire, QuestionnaireItem, QuestionnaireResponse } from 'fhir/r4b';
import { FormProvider, useForm } from 'react-hook-form';
import {
    FCEQuestionnaire,
    FormItems,
    ItemContext,
    QuestionnaireResponseFormProvider,
    toFirstClassExtension,
} from 'sdc-qrf';

import { BaseQuestionnaireResponseFormPropsContext } from '@beda.software/fhir-questionnaire/contexts';
import { success } from '@beda.software/remote-data';

import s from 'src/components/BaseQuestionnaireResponseForm/BaseQuestionnaireResponseForm.module.scss';
import { ValueSetExpandProvider } from 'src/contexts';
import {
    groupItemComponent,
    itemControlGroupItemComponents,
    itemControlQuestionItemComponents,
    questionItemComponents,
} from 'src/controls';

import rawQuestionnaire from '../../GPChronicConditionManagementPlan.json';

// The 'Goals and tasks' group is repeatable but ships without a rendering itemControl;
// this override makes it navigable via GroupSlider instead of the default stacked list.
const GROUP_SLIDER_LINK_IDS = ['plan-goalstasks'];

function withGroupSliderControl(item: QuestionnaireItem): QuestionnaireItem {
    const itemWithProcessedChildren = {
        ...item,
        item: item.item?.map(withGroupSliderControl),
    };

    if (!GROUP_SLIDER_LINK_IDS.includes(item.linkId)) {
        return itemWithProcessedChildren;
    }

    return {
        ...itemWithProcessedChildren,
        extension: [
            ...(itemWithProcessedChildren.extension ?? []),
            {
                url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                valueCodeableConcept: {
                    coding: [{ system: 'http://hl7.org/fhir/questionnaire-item-control', code: 'group-slider' }],
                },
            },
        ],
    };
}

const RAW_QUESTIONNAIRE = rawQuestionnaire as unknown as Questionnaire;

export const QUESTIONNAIRE: FCEQuestionnaire = toFirstClassExtension({
    ...RAW_QUESTIONNAIRE,
    item: RAW_QUESTIONNAIRE.item?.map(withGroupSliderControl),
});

export const QUESTIONNAIRE_RESPONSE: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress',
};

export const CONTEXT: ItemContext[] = [
    {
        questionnaire: QUESTIONNAIRE,
        resource: QUESTIONNAIRE_RESPONSE,
        context: QUESTIONNAIRE_RESPONSE,
    },
];

export const WithGPChronicConditionManagementPlanProviderDecorator: Decorator = (Story) => {
    const methods = useForm<FormItems>();

    return (
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
                <ValueSetExpandProvider.Provider value={async () => []}>
                    <BaseQuestionnaireResponseFormPropsContext.Provider value={{ submitting: false }}>
                        <form className={s.form}>
                            <Story />
                        </form>
                    </BaseQuestionnaireResponseFormPropsContext.Provider>
                </ValueSetExpandProvider.Provider>
            </QuestionnaireResponseFormProvider>
        </FormProvider>
    );
};
