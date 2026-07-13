import type { Decorator, Meta, StoryObj } from '@storybook/react';
import { Questionnaire, QuestionnaireItem, QuestionnaireResponse } from 'fhir/r4b';
import { FormProvider, useForm } from 'react-hook-form';
import {
    FCEQuestionnaireItem,
    FormItems,
    ItemContext,
    QuestionnaireResponseFormProvider,
    toFirstClassExtension,
} from 'sdc-qrf';

import { success } from '@beda.software/remote-data';

import s from 'src/components/BaseQuestionnaireResponseForm/BaseQuestionnaireResponseForm.module.scss';
import { ValueSetExpandProvider } from 'src/contexts';
import { questionItemComponents } from 'src/controls';
import { withColorSchemeDecorator } from 'src/storybook/decorators';

import { GridGroup } from './index';

const GRID_ITEM: FCEQuestionnaireItem = {
    linkId: 'measurements',
    text: 'Measurements',
    type: 'group',
    item: [
        {
            linkId: 'week-1',
            text: 'Week 1',
            type: 'group',
            item: [
                { linkId: 'week-1-weight', text: 'Weight', type: 'integer' },
                { linkId: 'week-1-notes', text: 'Notes', type: 'string' },
            ],
        },
        {
            linkId: 'week-2',
            text: 'Week 2',
            type: 'group',
            item: [
                { linkId: 'week-2-weight', text: 'Weight', type: 'integer' },
                { linkId: 'week-2-notes', text: 'Notes', type: 'string' },
            ],
        },
    ],
};

const QUESTIONNAIRE: Questionnaire = {
    resourceType: 'Questionnaire',
    status: 'active',
    item: [GRID_ITEM],
};

const QUESTIONNAIRE_RESPONSE: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress',
};

const CONTEXT: ItemContext[] = [
    {
        questionnaire: QUESTIONNAIRE,
        resource: QUESTIONNAIRE_RESPONSE,
        context: QUESTIONNAIRE_RESPONSE,
    },
];

const WithGridGroupProviderDecorator: Decorator = (Story) => {
    const methods = useForm<FormItems>();

    return (
        <FormProvider {...methods}>
            <QuestionnaireResponseFormProvider
                questionItemComponents={questionItemComponents}
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

const meta: Meta<typeof GridGroup> = {
    title: 'Questionnaire / questions / group / grid',
    component: GridGroup,
    decorators: [withColorSchemeDecorator, WithGridGroupProviderDecorator],
};

export default meta;
type Story = StoryObj<typeof GridGroup>;

export const Example: Story = {
    render: () => (
        <GridGroup
            groupItem={{
                parentPath: [],
                questionItem: GRID_ITEM,
                context: CONTEXT,
            }}
        />
    ),
};

const VITALS_GRID_RAW: QuestionnaireItem = {
    item: [
        {
            item: [
                {
                    text: 'Last result',
                    type: 'display',
                    _text: {
                        extension: [
                            {
                                url: 'http://hl7.org/fhir/StructureDefinition/cqf-expression',
                                valueExpression: {
                                    language: 'text/fhirpath',
                                    expression:
                                        "iif(%ObsBodyHeightValue.exists() and %ObsBodyHeightDateFormatted.exists(), %ObsBodyHeightValue.round(0).toString() + ' cm ( ' + %ObsBodyHeightDateFormatted + ' )', 'Not available')",
                                },
                            },
                        ],
                    },
                    linkId: 'clinicaldetails-observations-maingrid-height-lastresult',
                    extension: [
                        {
                            url: 'http://hl7.org/fhir/StructureDefinition/rendering-style',
                            valueString: 'text-align: left;',
                        },
                    ],
                },
                {
                    type: 'decimal',
                    linkId: 'clinicaldetails-observations-maingrid-height-lastresultvalue',
                    repeats: false,
                    extension: [
                        {
                            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                            valueExpression: {
                                language: 'text/fhirpath',
                                expression: '%ObsBodyHeightValue.round(0)',
                            },
                        },
                        {
                            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden',
                            valueBoolean: true,
                        },
                        {
                            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
                            valueCoding: {
                                code: 'cm',
                                system: 'http://unitsofmeasure.org',
                            },
                        },
                    ],
                },
                {
                    type: 'date',
                    linkId: 'clinicaldetails-observations-maingrid-height-lastresultdate',
                    repeats: false,
                    extension: [
                        {
                            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                            valueExpression: {
                                language: 'text/fhirpath',
                                expression: '%ObsBodyHeightLatest.effective.toString().substring(0,10).toDate()',
                            },
                        },
                        {
                            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden',
                            valueBoolean: true,
                        },
                    ],
                },
                {
                    text: 'New result',
                    type: 'decimal',
                    linkId: 'clinicaldetails-observations-maingrid-height-newresultvalue',
                    repeats: false,
                    extension: [
                        {
                            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
                            valueCoding: {
                                code: 'cm',
                                system: 'http://unitsofmeasure.org',
                            },
                        },
                    ],
                },
                {
                    text: 'New result date',
                    type: 'date',
                    linkId: 'clinicaldetails-observations-maingrid-height-newresultdate',
                    repeats: false,
                    extension: [
                        {
                            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression',
                            valueExpression: {
                                language: 'text/fhirpath',
                                expression:
                                    "iif(%resource.repeat(item).where(linkId='clinicaldetails-observations-maingrid-height-newresultvalue').answer.value.exists(), today())",
                            },
                        },
                    ],
                },
            ],
            text: 'Height',
            type: 'group',
            linkId: 'clinicaldetails-observations-maingrid-height',
            repeats: false,
        },
        {
            item: [
                {
                    text: 'Last result',
                    type: 'display',
                    _text: {
                        extension: [
                            {
                                url: 'http://hl7.org/fhir/StructureDefinition/cqf-expression',
                                valueExpression: {
                                    language: 'text/fhirpath',
                                    expression:
                                        "iif(%ObsBodyWeightValue.exists() and %ObsBodyWeightDateFormatted.exists(), %ObsBodyWeightValue.round(1).toString() + ' kg ( ' + %ObsBodyWeightDateFormatted + ' )', 'Not available')",
                                },
                            },
                        ],
                    },
                    linkId: 'clinicaldetails-observations-maingrid-weight-lastresult',
                    extension: [
                        {
                            url: 'http://hl7.org/fhir/StructureDefinition/rendering-style',
                            valueString: 'text-align: left;',
                        },
                    ],
                },
                {
                    type: 'decimal',
                    linkId: 'clinicaldetails-observations-maingrid-weight-lastresultvalue',
                    repeats: false,
                    extension: [
                        {
                            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                            valueExpression: {
                                language: 'text/fhirpath',
                                expression: '%ObsBodyWeightValue.round(1)',
                            },
                        },
                        {
                            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden',
                            valueBoolean: true,
                        },
                        {
                            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
                            valueCoding: {
                                code: 'kg',
                                system: 'http://unitsofmeasure.org',
                            },
                        },
                    ],
                },
                {
                    type: 'date',
                    linkId: 'clinicaldetails-observations-maingrid-weight-lastresultdate',
                    repeats: false,
                    extension: [
                        {
                            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                            valueExpression: {
                                language: 'text/fhirpath',
                                expression: '%ObsBodyWeightLatest.effective.toString().substring(0,10).toDate()',
                            },
                        },
                        {
                            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden',
                            valueBoolean: true,
                        },
                    ],
                },
                {
                    item: [
                        {
                            text: 'kg',
                            type: 'display',
                            linkId: 'clinicaldetails-observations-maingrid-weight-newresultvalue-unit',
                            extension: [
                                {
                                    url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                                    valueCodeableConcept: {
                                        coding: [
                                            {
                                                code: 'unit',
                                                system: 'http://hl7.org/fhir/questionnaire-item-control',
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    ],
                    text: 'New result',
                    type: 'decimal',
                    linkId: 'clinicaldetails-observations-maingrid-weight-newresultvalue',
                    repeats: false,
                    extension: [
                        {
                            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
                            valueCoding: {
                                code: 'kg',
                                system: 'http://unitsofmeasure.org',
                            },
                        },
                    ],
                },
                {
                    text: 'New result date',
                    type: 'date',
                    linkId: 'clinicaldetails-observations-maingrid-weight-newresultdate',
                    repeats: false,
                    extension: [
                        {
                            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression',
                            valueExpression: {
                                language: 'text/fhirpath',
                                expression:
                                    "iif(%resource.repeat(item).where(linkId='clinicaldetails-observations-maingrid-weight-newresultvalue').answer.value.exists(), today())",
                            },
                        },
                    ],
                },
            ],
            text: 'Weight',
            type: 'group',
            linkId: 'clinicaldetails-observations-maingrid-weight',
            repeats: false,
        },
        {
            item: [
                {
                    text: 'Last result',
                    type: 'display',
                    _text: {
                        extension: [
                            {
                                url: 'http://hl7.org/fhir/StructureDefinition/cqf-expression',
                                valueExpression: {
                                    language: 'text/fhirpath',
                                    expression:
                                        "iif(%ObsBodyWeightValue.exists() and %ObsBodyHeightValue.exists() and %ObsBodyHeightValue > 0, (%ObsBodyWeightValue/((%ObsBodyHeightValue/100).power(2))).round(1).toString() + ' kg/m2', 'Not available')",
                                },
                            },
                        ],
                    },
                    linkId: 'clinicaldetails-observations-maingrid-bmi-lastresult',
                    extension: [
                        {
                            url: 'http://hl7.org/fhir/StructureDefinition/rendering-style',
                            valueString: 'text-align: left;',
                        },
                    ],
                },
                {
                    type: 'decimal',
                    linkId: 'clinicaldetails-observations-maingrid-bmi-lastresultvalue',
                    repeats: false,
                    extension: [
                        {
                            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                            valueExpression: {
                                language: 'text/fhirpath',
                                expression:
                                    'iif(%ObsBodyWeightValue.exists() and %ObsBodyHeightValue.exists() and %ObsBodyHeightValue > 0, (%ObsBodyWeightValue/((%ObsBodyHeightValue/100).power(2))).round(1), {})',
                            },
                        },
                        {
                            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden',
                            valueBoolean: true,
                        },
                        {
                            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
                            valueCoding: {
                                code: 'kg/m2',
                                system: 'http://unitsofmeasure.org',
                            },
                        },
                    ],
                },
                {
                    item: [
                        {
                            text: 'kg/m2',
                            type: 'display',
                            linkId: 'clinicaldetails-observations-maingrid-bmi-newresult-unit',
                            extension: [
                                {
                                    url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                                    valueCodeableConcept: {
                                        coding: [
                                            {
                                                code: 'unit',
                                                system: 'http://hl7.org/fhir/questionnaire-item-control',
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    ],
                    text: 'New result',
                    type: 'decimal',
                    linkId: 'clinicaldetails-observations-maingrid-bmi-newresultvalue',
                    repeats: false,
                    readOnly: true,
                    extension: [
                        {
                            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression',
                            valueExpression: {
                                language: 'text/fhirpath',
                                expression:
                                    'iif(%weight.exists() and %height.exists() and %height > 0, (%weight/((%height/100).power(2))).round(1), {})',
                                description: 'BMI calculation',
                            },
                        },
                        {
                            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
                            valueCoding: {
                                code: 'kg/m2',
                                system: 'http://unitsofmeasure.org',
                            },
                        },
                    ],
                },
            ],
            text: 'BMI (calculated)',
            type: 'group',
            linkId: 'clinicaldetails-observations-maingrid-bmi',
            repeats: false,
        },
        {
            item: [
                {
                    text: 'Last result',
                    type: 'display',
                    _text: {
                        extension: [
                            {
                                url: 'http://hl7.org/fhir/StructureDefinition/cqf-expression',
                                valueExpression: {
                                    language: 'text/fhirpath',
                                    expression:
                                        "iif(%ObsWaistCircumferenceValue.exists() and %ObsWaistCircumferenceDateFormatted.exists(), %ObsWaistCircumferenceValue.round(0).toString() + ' cm ( ' + %ObsWaistCircumferenceDateFormatted + ' )', 'Not available')",
                                },
                            },
                        ],
                    },
                    linkId: 'clinicaldetails-observations-maingrid-waistcircumference-lastresult',
                    extension: [
                        {
                            url: 'http://hl7.org/fhir/StructureDefinition/rendering-style',
                            valueString: 'text-align: left;',
                        },
                    ],
                },
                {
                    type: 'decimal',
                    linkId: 'clinicaldetails-observations-maingrid-waistcircumference-lastresultvalue',
                    repeats: false,
                    extension: [
                        {
                            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                            valueExpression: {
                                language: 'text/fhirpath',
                                expression: '%ObsWaistCircumferenceValue.round(0)',
                            },
                        },
                        {
                            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden',
                            valueBoolean: true,
                        },
                        {
                            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
                            valueCoding: {
                                code: 'cm',
                                system: 'http://unitsofmeasure.org',
                            },
                        },
                    ],
                },
                {
                    type: 'date',
                    linkId: 'clinicaldetails-observations-maingrid-waistcircumference-lastresultdate',
                    repeats: false,
                    extension: [
                        {
                            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                            valueExpression: {
                                language: 'text/fhirpath',
                                expression:
                                    '%ObsWaistCircumferenceLatest.effective.toString().substring(0,10).toDate()',
                            },
                        },
                        {
                            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden',
                            valueBoolean: true,
                        },
                    ],
                },
                {
                    item: [
                        {
                            text: 'cm',
                            type: 'display',
                            linkId: 'clinicaldetails-observations-maingrid-waistcircumference-newresultvalue-unit',
                            extension: [
                                {
                                    url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                                    valueCodeableConcept: {
                                        coding: [
                                            {
                                                code: 'unit',
                                                system: 'http://hl7.org/fhir/questionnaire-item-control',
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    ],
                    text: 'New result',
                    type: 'decimal',
                    linkId: 'clinicaldetails-observations-maingrid-waistcircumference-newresultvalue',
                    repeats: false,
                    extension: [
                        {
                            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
                            valueCoding: {
                                code: 'cm',
                                system: 'http://unitsofmeasure.org',
                            },
                        },
                    ],
                },
                {
                    text: 'New result date',
                    type: 'date',
                    linkId: 'clinicaldetails-observations-maingrid-waistcircumference-newdate',
                    repeats: false,
                    extension: [
                        {
                            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression',
                            valueExpression: {
                                language: 'text/fhirpath',
                                expression:
                                    "iif(%resource.repeat(item).where(linkId='clinicaldetails-observations-maingrid-waistcircumference-newresultvalue').answer.value.exists(), today())",
                            },
                        },
                    ],
                },
            ],
            text: 'Waist circumference',
            type: 'group',
            linkId: 'clinicaldetails-observations-maingrid-waistcircumference',
            repeats: false,
        },
        {
            item: [
                {
                    text: 'Last result',
                    type: 'display',
                    _text: {
                        extension: [
                            {
                                url: 'http://hl7.org/fhir/StructureDefinition/cqf-expression',
                                valueExpression: {
                                    language: 'text/fhirpath',
                                    expression:
                                        "iif(%ObsPulseRateValue.exists() and %ObsPulseRateDateFormatted.exists(), %ObsPulseRateValue.round(0).toString() + ' /min ( ' + %ObsPulseRateDateFormatted + ' )', 'Not available')",
                                },
                            },
                        ],
                    },
                    linkId: 'clinicaldetails-observations-maingrid-pulserate-lastresult',
                    extension: [
                        {
                            url: 'http://hl7.org/fhir/StructureDefinition/rendering-style',
                            valueString: 'text-align: left;',
                        },
                    ],
                },
                {
                    type: 'decimal',
                    linkId: 'clinicaldetails-observations-maingrid-pulserate-lastresultvalue',
                    repeats: false,
                    extension: [
                        {
                            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                            valueExpression: {
                                language: 'text/fhirpath',
                                expression: '%ObsPulseRateValue.round(0)',
                            },
                        },
                        {
                            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden',
                            valueBoolean: true,
                        },
                        {
                            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
                            valueCoding: {
                                code: '/min',
                                system: 'http://unitsofmeasure.org',
                            },
                        },
                    ],
                },
                {
                    type: 'date',
                    linkId: 'clinicaldetails-observations-maingrid-pulserate-lastresultdate',
                    repeats: false,
                    extension: [
                        {
                            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                            valueExpression: {
                                language: 'text/fhirpath',
                                expression: '%ObsPulseRateLatest.effective.toString().substring(0,10).toDate()',
                            },
                        },
                        {
                            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden',
                            valueBoolean: true,
                        },
                    ],
                },
                {
                    item: [
                        {
                            text: '/min',
                            type: 'display',
                            linkId: 'clinicaldetails-observations-maingrid-pulserate-newresultvalue-unit',
                            extension: [
                                {
                                    url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                                    valueCodeableConcept: {
                                        coding: [
                                            {
                                                code: 'unit',
                                                system: 'http://hl7.org/fhir/questionnaire-item-control',
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    ],
                    text: 'New result',
                    type: 'integer',
                    linkId: 'clinicaldetails-observations-maingrid-pulserate-newresultvalue',
                    repeats: false,
                    extension: [
                        {
                            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
                            valueCoding: {
                                code: '/min',
                                system: 'http://unitsofmeasure.org',
                            },
                        },
                    ],
                },
                {
                    text: 'New result date',
                    type: 'date',
                    linkId: 'clinicaldetails-observations-maingrid-pulserate-newresultdate',
                    repeats: false,
                    extension: [
                        {
                            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression',
                            valueExpression: {
                                language: 'text/fhirpath',
                                expression:
                                    "iif(%resource.repeat(item).where(linkId='clinicaldetails-observations-maingrid-pulserate-newresultvalue').answer.value.exists(), today())",
                            },
                        },
                    ],
                },
            ],
            text: 'Pulse rate',
            type: 'group',
            linkId: 'clinicaldetails-observations-maingrid-pulserate',
            repeats: false,
        },
        {
            item: [
                {
                    text: 'Last result',
                    type: 'display',
                    _text: {
                        extension: [
                            {
                                url: 'http://hl7.org/fhir/StructureDefinition/cqf-expression',
                                valueExpression: {
                                    language: 'text/fhirpath',
                                    expression:
                                        "iif(%ObsPulseRhythmValue.exists() and %ObsPulseRhythmDateFormatted.exists(), %ObsPulseRhythmValue.display + ' ( ' + %ObsPulseRhythmDateFormatted + ' )', 'Not available')",
                                },
                            },
                        ],
                    },
                    linkId: 'clinicaldetails-observations-maingrid-pulserhythm-lastresult',
                    extension: [
                        {
                            url: 'http://hl7.org/fhir/StructureDefinition/rendering-style',
                            valueString: 'text-align: left;',
                        },
                    ],
                },
                {
                    type: 'choice',
                    linkId: 'clinicaldetails-observations-maingrid-pulserhythm-lastresultvalue',
                    repeats: false,
                    extension: [
                        {
                            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                            valueExpression: {
                                language: 'text/fhirpath',
                                expression: '%ObsPulseRhythmValue',
                            },
                        },
                        {
                            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden',
                            valueBoolean: true,
                        },
                    ],
                    answerValueSet: '#pulse-rhythm-1',
                },
                {
                    type: 'date',
                    linkId: 'clinicaldetails-observations-maingrid-pulserhythm-lastresultdate',
                    repeats: false,
                    extension: [
                        {
                            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                            valueExpression: {
                                language: 'text/fhirpath',
                                expression: '%ObsPulseRhythmLatest.effective.toString().substring(0,10).toDate()',
                            },
                        },
                        {
                            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden',
                            valueBoolean: true,
                        },
                    ],
                },
                {
                    text: 'New result',
                    type: 'choice',
                    linkId: 'clinicaldetails-observations-maingrid-pulserhythm-newresultvalue',
                    repeats: false,
                    extension: [
                        {
                            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                            valueCodeableConcept: {
                                coding: [
                                    {
                                        code: 'drop-down',
                                        system: 'http://hl7.org/fhir/questionnaire-item-control',
                                    },
                                ],
                            },
                        },
                    ],
                    answerValueSet: '#pulse-rhythm-1',
                },
                {
                    text: 'New result date',
                    type: 'date',
                    linkId: 'clinicaldetails-observations-maingrid-pulserhythm-newresultdate',
                    repeats: false,
                    extension: [
                        {
                            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression',
                            valueExpression: {
                                language: 'text/fhirpath',
                                expression:
                                    "iif(%resource.repeat(item).where(linkId='clinicaldetails-observations-maingrid-pulserhythm-newresultvalue').answer.value.exists(), today())",
                            },
                        },
                    ],
                },
            ],
            text: 'Pulse rhythm',
            type: 'group',
            linkId: 'clinicaldetails-observations-maingrid-pulserhythm',
            repeats: false,
        },
        {
            item: [
                {
                    text: 'Last result',
                    type: 'display',
                    _text: {
                        extension: [
                            {
                                url: 'http://hl7.org/fhir/StructureDefinition/cqf-expression',
                                valueExpression: {
                                    language: 'text/fhirpath',
                                    expression:
                                        "iif(%ObsOxygenSaturationValue.exists() and %ObsOxygenSaturationDateFormatted.exists(), %ObsOxygenSaturationValue.round(0).toString() + ' % ( ' + %ObsOxygenSaturationDateFormatted + ' )', 'Not available')",
                                },
                            },
                        ],
                    },
                    linkId: 'clinicaldetails-observations-maingrid-oxygensaturation-lastresult',
                    extension: [
                        {
                            url: 'http://hl7.org/fhir/StructureDefinition/rendering-style',
                            valueString: 'text-align: left;',
                        },
                    ],
                },
                {
                    type: 'decimal',
                    linkId: 'clinicaldetails-observations-maingrid-oxygensaturation-lastresultvalue',
                    repeats: false,
                    extension: [
                        {
                            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                            valueExpression: {
                                language: 'text/fhirpath',
                                expression: '%ObsOxygenSaturationValue.round(0)',
                            },
                        },
                        {
                            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden',
                            valueBoolean: true,
                        },
                        {
                            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
                            valueCoding: {
                                code: '%',
                                system: 'http://unitsofmeasure.org',
                            },
                        },
                    ],
                },
                {
                    type: 'date',
                    linkId: 'clinicaldetails-observations-maingrid-oxygensaturation-lastresultdate',
                    repeats: false,
                    extension: [
                        {
                            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                            valueExpression: {
                                language: 'text/fhirpath',
                                expression: '%ObsOxygenSaturationLatest.effective.toString().substring(0,10).toDate()',
                            },
                        },
                        {
                            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden',
                            valueBoolean: true,
                        },
                    ],
                },
                {
                    item: [
                        {
                            text: '%',
                            type: 'display',
                            linkId: 'clinicaldetails-observations-maingrid-oxygensaturation-newresultvalue-unit',
                            extension: [
                                {
                                    url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                                    valueCodeableConcept: {
                                        coding: [
                                            {
                                                code: 'unit',
                                                system: 'http://hl7.org/fhir/questionnaire-item-control',
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    ],
                    text: 'New result',
                    type: 'integer',
                    linkId: 'clinicaldetails-observations-maingrid-oxygensaturation-newresultvalue',
                    repeats: false,
                    extension: [
                        {
                            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
                            valueCoding: {
                                code: '%',
                                system: 'http://unitsofmeasure.org',
                            },
                        },
                    ],
                },
                {
                    text: 'New result date',
                    type: 'date',
                    linkId: 'clinicaldetails-observations-maingrid-oxygensaturation-newresultdate',
                    repeats: false,
                    extension: [
                        {
                            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression',
                            valueExpression: {
                                language: 'text/fhirpath',
                                expression:
                                    "iif(%resource.repeat(item).where(linkId='clinicaldetails-observations-maingrid-oxygensaturation-newresultvalue').answer.value.exists(), today())",
                            },
                        },
                    ],
                },
            ],
            text: 'Oxygen saturation',
            type: 'group',
            linkId: 'clinicaldetails-observations-maingrid-oxygensaturation',
            repeats: false,
        },
    ],
    text: 'Observations',
    type: 'group',
    _text: {
        extension: [
            {
                url: 'https://smartforms.csiro.au/ig/StructureDefinition/QuestionnaireItemTextHidden',
                valueBoolean: true,
            },
        ],
    },
    linkId: 'clinicaldetails-observations-maingrid',
    repeats: false,
    extension: [
        {
            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
            valueCodeableConcept: {
                coding: [
                    {
                        code: 'grid',
                        system: 'http://hl7.org/fhir/questionnaire-item-control',
                    },
                ],
            },
        },
    ],
};

const VITALS_QUESTIONNAIRE = toFirstClassExtension({
    resourceType: 'Questionnaire',
    status: 'active',
    item: [VITALS_GRID_RAW],
    meta: {
        profile: ['https://emr-core.beda.software/StructureDefinition/fhir-emr-questionnaire'],
    },
});

const VITALS_GRID_ITEM = VITALS_QUESTIONNAIRE.item![0]!;

const VITALS_QUESTIONNAIRE_RESPONSE: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress',
};

const VITALS_CONTEXT: ItemContext[] = [
    {
        questionnaire: VITALS_QUESTIONNAIRE,
        resource: VITALS_QUESTIONNAIRE_RESPONSE,
        context: VITALS_QUESTIONNAIRE_RESPONSE,
    },
];

export const VitalsObservationsGrid: Story = {
    render: () => (
        <GridGroup
            groupItem={{
                parentPath: [],
                questionItem: VITALS_GRID_ITEM,
                context: VITALS_CONTEXT,
            }}
        />
    ),
};
