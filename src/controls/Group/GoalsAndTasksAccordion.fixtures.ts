import { Questionnaire, QuestionnaireResponse } from 'fhir/r4b';
import { FCEQuestionnaireItem, ItemContext } from 'sdc-qrf';

// Based on the "Goals and tasks" item of the GP Chronic Condition Management Plan
// questionnaire (see https://github.com/beda-software/web-item-controls/issues/9), kept
// in sync with the structure of GPChronicConditionManagementPlan.json's plan-goalstasks
// subtree, with a few deliberate deviations:
//
// - Each sub-group is really wrapped there in its own `group-voice` group (a stable
//   target for a voice assistant to address, e.g. plan-goalstasks-details-goalsetting-
//   voice wrapping plan-goalstasks-details-goalsetting) - that nesting is reproduced
//   here as-is, and accordionContext.ts's unwrapVoiceGroup sees through it so
//   "plan-goalstasks" still qualifies for the accordion despite the extra layer.
// - Goal setting / Interventions and actions / Services and treatments carry itemControl
//   `group-table` in the real questionnaire, which maps to the unrelated GroupTable
//   spreadsheet+modal component (src/controls/GroupTable) and never touches the
//   accordion machinery. This fixture leaves them itemControl-free instead (same as
//   before), so they fall back to the default groupItemComponent and actually render
//   through RepeatableGroupCard, exercising the accordion. Note `gtable` isn't a safe
//   substitute either despite the similar name - it's a real, mapped itemControl
//   (src/controls/controls.tsx) that routes to the GTable grid component and bypasses
//   RepeatableGroupCard/breadcrumbs entirely, same problem as `group-table`.
// - Problems/Needs and the Interventions/Actions field are `open-choice` +
//   `autocomplete` in the real questionnaire; they stay plain `string` here so the
//   accompanying tests (GoalsAndTasksAccordion.stories.test.tsx) can keep asserting
//   against them with getByDisplayValue.
// - answerValueSet-bound fields are swapped for static answerOption lists so this
//   fixture has no external terminology dependency.
//
// itemControl (and other first-class extensions like width) must be set via the FCE
// convenience properties (`itemControl`, `columnWidth`, ...) rather than a raw FHIR
// `extension` array - sdc-qrf's renderer reads `questionItem.itemControl` directly and
// never re-derives it from `extension` (see node_modules/sdc-qrf/dist/components.js).
// Setting itemControl this correctly matters: an itemControl code that IS mapped (like
// `gtable`) now actually takes effect and swaps the rendered component, whereas
// mis-set/unset itemControl silently falls back to the default and was never applied.
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

const GOAL_SETTING_VOICE_ITEM: FCEQuestionnaireItem = {
    linkId: 'plan-goalstasks-details-goalsetting-voice',
    type: 'group',
    itemControl: { coding: [{ code: 'group-voice' }] },
    item: [GOAL_SETTING_ITEM],
};

const INTERVENTIONS_ITEM: FCEQuestionnaireItem = {
    linkId: 'plan-goalstasks-details-interventionsactions',
    text: 'Interventions and Actions',
    type: 'group',
    repeats: true,
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

const INTERVENTIONS_VOICE_ITEM: FCEQuestionnaireItem = {
    linkId: 'plan-goalstasks-details-interventionsactions-voice',
    type: 'group',
    itemControl: { coding: [{ code: 'group-voice' }] },
    item: [INTERVENTIONS_ITEM],
};

const SERVICES_ITEM: FCEQuestionnaireItem = {
    linkId: 'plan-goalstasks-details-servicestreatments',
    text: 'Services and Treatments',
    type: 'group',
    repeats: true,
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

const SERVICES_VOICE_ITEM: FCEQuestionnaireItem = {
    linkId: 'plan-goalstasks-details-servicestreatments-voice',
    type: 'group',
    itemControl: { coding: [{ code: 'group-voice' }] },
    item: [SERVICES_ITEM],
};

const PROBLEM_NEED_VOICE_ITEM: FCEQuestionnaireItem = {
    linkId: 'plan-goalstasks-problemneed-voice',
    type: 'group',
    itemControl: { coding: [{ code: 'group-voice' }] },
    item: [{ linkId: 'plan-goalstasks-problemneed', text: 'Problems/Needs', type: 'string' }],
};

const PLAN_GOALSTASKS_ITEM: FCEQuestionnaireItem = {
    linkId: 'plan-goalstasks',
    text: 'Goals and Tasks',
    type: 'group',
    repeats: true,
    item: [PROBLEM_NEED_VOICE_ITEM, GOAL_SETTING_VOICE_ITEM, INTERVENTIONS_VOICE_ITEM, SERVICES_VOICE_ITEM],
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
                            linkId: 'plan-goalstasks-problemneed-voice',
                            item: [
                                {
                                    linkId: 'plan-goalstasks-problemneed',
                                    answer: [{ valueString: 'Hypertension management' }],
                                },
                            ],
                        },
                        {
                            linkId: 'plan-goalstasks-details-goalsetting-voice',
                            item: [
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
                        // Seeded with one entry each (rather than the 0 shown in the
                        // Figma reference) so this story's static context always has
                        // a context[0] to fall back to - without a live backend to
                        // recompute it, adding a first item to a group with zero
                        // existing ones has nothing to fall back to and crashes.
                        {
                            linkId: 'plan-goalstasks-details-interventionsactions-voice',
                            item: [
                                {
                                    linkId: 'plan-goalstasks-details-interventionsactions',
                                    item: [
                                        {
                                            linkId: 'plan-goalstasks-details-interventionsactions-interventionsactions',
                                            answer: [{ valueString: 'Home blood pressure monitoring' }],
                                        },
                                        {
                                            linkId: 'plan-goalstasks-details-interventionsactions-owner',
                                            answer: [{ valueString: 'Dr. Smith' }],
                                        },
                                        {
                                            linkId: 'plan-goalstasks-details-interventionsactions-status',
                                            answer: [{ valueCoding: { code: 'planned', display: 'Planned' } }],
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            linkId: 'plan-goalstasks-details-servicestreatments-voice',
                            item: [
                                {
                                    linkId: 'plan-goalstasks-details-servicestreatments',
                                    item: [
                                        {
                                            linkId: 'plan-goalstasks-details-servicestreatments-servicestreatments',
                                            answer: [{ valueString: 'Nutrition counseling' }],
                                        },
                                        {
                                            linkId: 'plan-goalstasks-details-servicestreatments-provider',
                                            answer: [{ valueString: 'Dietitian clinic' }],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
                // A second "Goals and Tasks" entry - plan-goalstasks is the sole
                // child of plan-goalstasks-tab, so no sibling ever turns it into an
                // accordion from above (see RepeatableGroups.tsx's
                // selfQualifiesForAccordion). It qualifies on its own instead: each
                // instance contains multiple nested groups, one repeatable, which is
                // exactly the condition that makes a group's own instances collapse.
                {
                    linkId: 'plan-goalstasks',
                    item: [
                        {
                            linkId: 'plan-goalstasks-problemneed-voice',
                            item: [
                                {
                                    linkId: 'plan-goalstasks-problemneed',
                                    answer: [{ valueString: 'Type 2 diabetes management' }],
                                },
                            ],
                        },
                        {
                            linkId: 'plan-goalstasks-details-goalsetting-voice',
                            item: [
                                {
                                    linkId: 'plan-goalstasks-details-goalsetting',
                                    item: [
                                        {
                                            linkId: 'plan-goalstasks-details-goalsetting-goals',
                                            answer: [{ valueString: 'Keep HbA1c below 7%' }],
                                        },
                                        {
                                            linkId: 'plan-goalstasks-details-goalsetting-initiator',
                                            answer: [{ valueString: 'Dr. Lee' }],
                                        },
                                        {
                                            linkId: 'plan-goalstasks-details-goalsetting-status',
                                            answer: [{ valueCoding: { code: 'in-progress', display: 'In progress' } }],
                                        },
                                    ],
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
