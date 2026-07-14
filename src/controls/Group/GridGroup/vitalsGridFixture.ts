import { FCEQuestionnaireItem } from 'sdc-qrf';

export const VITALS_GRID_RAW: FCEQuestionnaireItem = {
    item: [
        {
            item: [
                {
                    text: 'Last result',
                    type: 'display',
                    linkId: 'clinicaldetails-observations-maingrid-height-lastresult',
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
                    linkId: 'clinicaldetails-observations-maingrid-weight-lastresult',
                },
                {
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
                    linkId: 'clinicaldetails-observations-maingrid-bmi-lastresult',
                },
                {
                    text: 'New result',
                    type: 'decimal',
                    linkId: 'clinicaldetails-observations-maingrid-bmi-newresultvalue',
                    repeats: false,
                    readOnly: true,
                    extension: [
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
                    linkId: 'clinicaldetails-observations-maingrid-waistcircumference-lastresult',
                },
                {
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
                    linkId: 'clinicaldetails-observations-maingrid-pulserate-lastresult',
                },
                {
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
                    linkId: 'clinicaldetails-observations-maingrid-pulserhythm-lastresult',
                },
                {
                    text: 'New result',
                    type: 'choice',
                    linkId: 'clinicaldetails-observations-maingrid-pulserhythm-newresultvalue',
                    repeats: false,
                    answerValueSet: '#pulse-rhythm-1',
                },
                {
                    text: 'New result date',
                    type: 'date',
                    linkId: 'clinicaldetails-observations-maingrid-pulserhythm-newresultdate',
                    repeats: false,
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
                    linkId: 'clinicaldetails-observations-maingrid-oxygensaturation-lastresult',
                },
                {
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
    linkId: 'clinicaldetails-observations-maingrid',
    repeats: false,
};
