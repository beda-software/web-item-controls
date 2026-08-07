import { Questionnaire, QuestionnaireResponse } from 'fhir/r4b';
import { FCEQuestionnaireItem, ItemContext } from 'sdc-qrf';

// Trimmed from the "Goals and tasks" item of the GP Chronic Condition Management Plan
// questionnaire (see https://github.com/beda-software/web-item-controls/issues/9).
// "plan-goalstasks" has 3 nested groups and one of them repeats, so it qualifies for
// the accordion UX: only one of Goal Settings / Interventions and Actions / Services
// and Treatments is open at a time, and Goal Settings' own repeat instances collapse
// to one-open-at-a-time in turn. answerValueSet-bound fields are swapped for static
// answerOption lists so this fixture has no external terminology dependency.
export const GOAL_SETTING_ITEM: FCEQuestionnaireItem = {
    linkId: 'plan-goalstasks-details-goalsetting',
    text: 'Goal Settings',
    type: 'group',
    repeats: true,
    item: [
        { linkId: 'plan-goalstasks-details-goalsetting-goals', text: 'Goals', type: 'text' },
        { linkId: 'plan-goalstasks-details-goalsetting-initiator', text: 'Initiator', type: 'string' },
        { linkId: 'plan-goalstasks-details-goalsetting-targetdate', text: 'Target date', type: 'date' },
        {
            linkId: 'plan-goalstasks-details-goalsetting-status',
            text: 'Status',
            type: 'choice',
            answerOption: [
                { valueCoding: { code: 'in-progress', display: 'In progress' } },
                { valueCoding: { code: 'achieved', display: 'Achieved' } },
            ],
        },
        { linkId: 'plan-goalstasks-details-goalsetting-comment', text: 'Comment', type: 'string' },
    ],
};

const INTERVENTIONS_ITEM: FCEQuestionnaireItem = {
    linkId: 'plan-goalstasks-details-interventionsactions',
    text: 'Interventions and Actions',
    type: 'group',
    repeats: true,
    extension: [
        {
            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
            valueCodeableConcept: {
                coding: [{ system: 'http://hl7.org/fhir/questionnaire-item-control', code: 'gtable' }],
            },
        },
    ],
    item: [
        {
            linkId: 'plan-goalstasks-details-interventionsactions-interventionsactions',
            text: 'Interventions/Actions',
            type: 'string',
        },
        { linkId: 'plan-goalstasks-details-interventionsactions-owner', text: 'Owner', type: 'string' },
        { linkId: 'plan-goalstasks-details-interventionsactions-targetdate', text: 'Target date', type: 'date' },
        {
            linkId: 'plan-goalstasks-details-interventionsactions-status',
            text: 'Status',
            type: 'choice',
            answerOption: [
                { valueCoding: { code: 'planned', display: 'Planned' } },
                { valueCoding: { code: 'done', display: 'Done' } },
            ],
        },
        { linkId: 'plan-goalstasks-details-interventionsactions-comment', text: 'Comment', type: 'string' },
    ],
};

const SERVICES_ITEM: FCEQuestionnaireItem = {
    linkId: 'plan-goalstasks-details-servicestreatments',
    text: 'Services and Treatments',
    type: 'group',
    repeats: true,
    extension: [
        {
            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
            valueCodeableConcept: {
                coding: [{ system: 'http://hl7.org/fhir/questionnaire-item-control', code: 'gtable' }],
            },
        },
    ],
    item: [
        {
            linkId: 'plan-goalstasks-details-servicestreatments-servicestreatments',
            text: 'Required services and treatments',
            type: 'string',
        },
        { linkId: 'plan-goalstasks-details-servicestreatments-activity', text: 'Activity', type: 'string' },
        { linkId: 'plan-goalstasks-details-servicestreatments-provider', text: 'Provider', type: 'string' },
        { linkId: 'plan-goalstasks-details-servicestreatments-comment', text: 'Comment', type: 'string' },
    ],
};

const PLAN_GOALSTASKS_ITEM: FCEQuestionnaireItem = {
    linkId: 'plan-goalstasks',
    text: 'Goals and Tasks',
    type: 'group',
    repeats: true,
    item: [
        { linkId: 'plan-goalstasks-problemneed', text: 'Problems/Needs', type: 'string' },
        GOAL_SETTING_ITEM,
        INTERVENTIONS_ITEM,
        SERVICES_ITEM,
    ],
};

export const PLAN_GOALSTASKS_TAB_ITEM: FCEQuestionnaireItem = {
    linkId: 'plan-goalstasks-tab',
    text: 'Goals and tasks',
    type: 'group',
    item: [PLAN_GOALSTASKS_ITEM],
};

export const QUESTIONNAIRE: Questionnaire = {
    resourceType: 'Questionnaire',
    status: 'active',
    item: [PLAN_GOALSTASKS_TAB_ITEM],
};

export const QUESTIONNAIRE_RESPONSE: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress',
    item: [
        {
            linkId: 'plan-goalstasks-tab',
            item: [
                {
                    linkId: 'plan-goalstasks',
                    item: [
                        {
                            linkId: 'plan-goalstasks-problemneed',
                            answer: [{ valueString: 'Hypertension management' }],
                        },
                        {
                            linkId: 'plan-goalstasks-details-goalsetting',
                            item: [
                                {
                                    linkId: 'plan-goalstasks-details-goalsetting-goals',
                                    answer: [{ valueString: 'Lower blood pressure below 140/90' }],
                                },
                                {
                                    linkId: 'plan-goalstasks-details-goalsetting-initiator',
                                    answer: [{ valueString: 'Dr. Smith' }],
                                },
                                {
                                    linkId: 'plan-goalstasks-details-goalsetting-status',
                                    answer: [{ valueCoding: { code: 'in-progress', display: 'In progress' } }],
                                },
                            ],
                        },
                        {
                            linkId: 'plan-goalstasks-details-goalsetting',
                            item: [
                                {
                                    linkId: 'plan-goalstasks-details-goalsetting-goals',
                                    answer: [{ valueString: 'Increase weekly physical activity' }],
                                },
                                {
                                    linkId: 'plan-goalstasks-details-goalsetting-initiator',
                                    answer: [{ valueString: 'Dr. Smith' }],
                                },
                                {
                                    linkId: 'plan-goalstasks-details-goalsetting-status',
                                    answer: [{ valueCoding: { code: 'achieved', display: 'Achieved' } }],
                                },
                            ],
                        },
                    ],
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
