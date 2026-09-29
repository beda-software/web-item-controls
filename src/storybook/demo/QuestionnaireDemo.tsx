import { QuestionnaireResponse } from 'fhir/r4b';
import r4Model from 'fhirpath/fhir-context/r4';
import { useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import {
    calcInitialContext,
    EvaluateFhirpath,
    FCEQuestionnaire,
    FormItems,
    QuestionItems,
    QuestionnaireResponseFormProvider,
} from 'sdc-qrf';

import { success } from '@beda.software/remote-data';

import s from 'src/components/BaseQuestionnaireResponseForm/BaseQuestionnaireResponseForm.module.scss';
import { ValueSetExpandProvider } from 'src/contexts';
import {
    groupItemComponent,
    itemControlGroupItemComponents,
    itemControlQuestionItemComponents,
    questionItemComponents,
} from 'src/controls';
import { evaluate } from 'src/utils/fhirpath';

// sdc-qrf falls back to plain `fhirpath.evaluate` when no evaluateFhirpath is given, which
// bypasses the custom invocation table (e.g. `formatDate`) registered via initFHIRPathEvaluateOptions
// in .storybook/preview.tsx - route through our wrapper so those functions resolve here too.
const evaluateFhirpath: EvaluateFhirpath = (context, path, env) =>
    evaluate(context, path, env, r4Model, { async: false } as Parameters<typeof evaluate>[4]);

const EMPTY_QUESTIONNAIRE_RESPONSE: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress',
};

export interface QuestionnaireDemoProps {
    questionnaire: FCEQuestionnaire;
}

export function QuestionnaireDemo({ questionnaire }: QuestionnaireDemoProps) {
    const methods = useForm<FormItems>({ defaultValues: {} });
    const formValues = methods.watch();

    const context = useMemo(
        () =>
            calcInitialContext(
                {
                    fceQuestionnaire: questionnaire,
                    questionnaire,
                    questionnaireResponse: EMPTY_QUESTIONNAIRE_RESPONSE,
                    launchContextParameters: [],
                },
                formValues,
            ),
        [questionnaire, formValues],
    );

    return (
        <FormProvider {...methods}>
            <QuestionnaireResponseFormProvider
                formValues={formValues}
                setFormValues={(_values, fieldPath, value) => methods.setValue(fieldPath.join('.'), value)}
                fhirService={async () => success(undefined)}
                questionItemComponents={questionItemComponents}
                groupItemComponent={groupItemComponent}
                itemControlQuestionItemComponents={itemControlQuestionItemComponents}
                itemControlGroupItemComponents={itemControlGroupItemComponents}
                evaluateFhirpath={evaluateFhirpath}
            >
                <ValueSetExpandProvider.Provider value={async () => []}>
                    <form className={s.form}>
                        <QuestionItems questionItems={questionnaire.item ?? []} context={context} parentPath={[]} />
                    </form>
                </ValueSetExpandProvider.Provider>
            </QuestionnaireResponseFormProvider>
        </FormProvider>
    );
}
