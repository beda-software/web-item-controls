import { QuestionnaireResponse } from 'fhir/r4b';
import { FCEQuestionnaire, FCEQuestionnaireItem, ItemContext, mapResponseToForm } from 'sdc-qrf';

import { buildRootSection, shouldApplySidebarDesign } from '../utils';

function questionFactory(linkId: string, extra?: Partial<FCEQuestionnaireItem>): FCEQuestionnaireItem {
    return {
        linkId,
        text: linkId,
        type: 'string',
        ...(extra ?? {}),
    };
}

function groupFactory(
    linkId: string,
    items: FCEQuestionnaireItem[],
    extra?: Partial<FCEQuestionnaireItem>,
): FCEQuestionnaireItem {
    return {
        linkId,
        text: linkId,
        type: 'group',
        item: items,
        ...(extra ?? {}),
    };
}

function controlledGroupFactory(
    linkId: string,
    code: string,
    items: FCEQuestionnaireItem[],
    extra?: Partial<FCEQuestionnaireItem>,
): FCEQuestionnaireItem {
    return groupFactory(linkId, items, { itemControl: { coding: [{ code }] }, ...(extra ?? {}) });
}

function questionnaireFactory(items: FCEQuestionnaireItem[]): FCEQuestionnaire {
    return {
        resourceType: 'Questionnaire',
        status: 'active',
        item: items,
    };
}

function buildContext(questionnaire: FCEQuestionnaire, qr: QuestionnaireResponse) {
    const formValues = mapResponseToForm(qr, questionnaire);
    const context: ItemContext = {
        resource: qr,
        questionnaire,
        context: qr,
        qitem: questionnaire.item![0]!,
    };

    return { formValues, context };
}

describe('shouldApplySidebarDesign', () => {
    it('returns false with fewer than 2 subgroups', () => {
        const root = groupFactory('root', [
            questionFactory('q1'),
            groupFactory('g1', [questionFactory('g1-q1')], { repeats: true }),
        ]);

        expect(shouldApplySidebarDesign(root)).toBe(false);
    });

    it('returns true with more than 2 subgroups', () => {
        const root = groupFactory('root', [
            groupFactory('g1', [questionFactory('g1-q1')]),
            groupFactory('g2', [questionFactory('g2-q1')]),
            groupFactory('g3', [questionFactory('g3-q1')]),
        ]);

        expect(shouldApplySidebarDesign(root)).toBe(true);
    });

    it('returns false with exactly 2 non-repeating, non-nested subgroups', () => {
        const root = groupFactory('root', [
            groupFactory('g1', [questionFactory('g1-q1')]),
            groupFactory('g2', [questionFactory('g2-q1')]),
        ]);

        expect(shouldApplySidebarDesign(root)).toBe(false);
    });

    it('returns true with exactly 2 subgroups when one is repeatable', () => {
        const root = groupFactory('root', [
            groupFactory('g1', [questionFactory('g1-q1')], { repeats: true }),
            groupFactory('g2', [questionFactory('g2-q1')]),
        ]);

        expect(shouldApplySidebarDesign(root)).toBe(true);
    });

    it('returns true with exactly 2 subgroups when one has its own nested subgroup', () => {
        const root = groupFactory('root', [
            groupFactory('g1', [groupFactory('g1-g1', [questionFactory('g1-g1-q1')])]),
            groupFactory('g2', [questionFactory('g2-q1')]),
        ]);

        expect(shouldApplySidebarDesign(root)).toBe(true);
    });

    it('excludes group-voice items from the subgroup count', () => {
        const root = groupFactory('root', [
            groupFactory('g1', [questionFactory('g1-q1')], { repeats: true }),
            controlledGroupFactory('voice', 'group-voice', [questionFactory('voice-q1')]),
        ]);

        expect(shouldApplySidebarDesign(root)).toBe(false);
    });
});

describe('buildRootSection', () => {
    it('enumerates existing repeat instances from form values', () => {
        const rootItem = groupFactory(
            'root',
            [
                groupFactory('g1', [questionFactory('g1-q1')], { repeats: true }),
                groupFactory('g2', [questionFactory('g2-q1')]),
                groupFactory('g3', [questionFactory('g3-q1')]),
            ],
            { repeats: true },
        );
        const questionnaire = questionnaireFactory([rootItem]);
        const qr: QuestionnaireResponse = { resourceType: 'QuestionnaireResponse', status: 'completed' };
        const { context } = buildContext(questionnaire, qr);
        const formValues = { root: { items: [{}, {}] } };

        const section = buildRootSection(rootItem, [], formValues, context);

        expect(section.isRepeatable).toBe(true);
        expect(section.nodes).toHaveLength(2);
        expect(section.nodes[0]!.text).toBe('root 1');
        expect(section.nodes[1]!.text).toBe('root 2');
        expect(section.nodes[0]!.sections.map((s) => s.linkId)).toEqual(['g1', 'g2', 'g3']);
    });

    it('shows an empty repeatable subgroup as a single non-numbered placeholder with no nodes', () => {
        const questionnaire = questionnaireFactory([
            groupFactory('root', [
                groupFactory('g1', [questionFactory('g1-q1')], { repeats: true }),
                groupFactory('g2', [questionFactory('g2-q1')]),
                groupFactory('g3', [questionFactory('g3-q1')]),
            ]),
        ]);
        const qr: QuestionnaireResponse = {
            resourceType: 'QuestionnaireResponse',
            status: 'completed',
            item: [{ linkId: 'root', item: [] }],
        };

        const { formValues, context } = buildContext(questionnaire, qr);
        const rootItem = questionnaire.item![0]!;
        const section = buildRootSection(rootItem, [], formValues, context);
        const node = section.nodes[0]!;
        const g1Section = node.sections.find((s) => s.linkId === 'g1')!;

        expect(g1Section.isRepeatable).toBe(true);
        expect(g1Section.nodes).toHaveLength(0);
    });

    it('walks and splits a repeatable group into per-instance rows regardless of its own itemControl (e.g. gtable)', () => {
        const questionnaire = questionnaireFactory([
            groupFactory('root', [
                controlledGroupFactory('g1', 'gtable', [questionFactory('g1-q1')], { repeats: true }),
                groupFactory('g2', [questionFactory('g2-q1')]),
                groupFactory('g3', [questionFactory('g3-q1')]),
            ]),
        ]);
        const qr: QuestionnaireResponse = {
            resourceType: 'QuestionnaireResponse',
            status: 'completed',
            item: [{ linkId: 'root', item: [] }],
        };

        const { formValues, context } = buildContext(questionnaire, qr);
        const rootItem = questionnaire.item![0]!;
        const section = buildRootSection(rootItem, [], formValues, context);
        const node = section.nodes[0]!;
        const g1Section = node.sections.find((s) => s.linkId === 'g1')!;

        expect(g1Section.isRepeatable).toBe(true);
        expect(g1Section.nodes).toHaveLength(0);

        const withInstances = { root: { items: { g1: { items: [{}, {}] } } } };
        const sectionWithInstances = buildRootSection(rootItem, [], withInstances, context);
        const nodeWithInstances = sectionWithInstances.nodes[0]!;
        const g1SectionWithInstances = nodeWithInstances.sections.find((s) => s.linkId === 'g1')!;

        expect(g1SectionWithInstances.nodes).toHaveLength(2);
        expect(g1SectionWithInstances.nodes[0]!.text).toBe('g1 1');
        expect(g1SectionWithInstances.nodes[1]!.text).toBe('g1 2');
        expect(g1SectionWithInstances.nodes[0]!.contentItems.map((i) => i.linkId)).toEqual(['g1-q1']);
    });

    it('excludes a leaf-only group-voice item from sections but keeps it in content', () => {
        const questionnaire = questionnaireFactory([
            groupFactory('root', [
                groupFactory('g1', [questionFactory('g1-q1')], { repeats: true }),
                groupFactory('g2', [questionFactory('g2-q1')]),
                controlledGroupFactory('voice', 'group-voice', [questionFactory('voice-q1')]),
            ]),
        ]);
        const qr: QuestionnaireResponse = {
            resourceType: 'QuestionnaireResponse',
            status: 'completed',
            item: [{ linkId: 'root', item: [] }],
        };

        const { formValues, context } = buildContext(questionnaire, qr);
        const rootItem = questionnaire.item![0]!;
        const section = buildRootSection(rootItem, [], formValues, context);
        const node = section.nodes[0]!;

        expect(node.sections.map((s) => s.linkId)).toEqual(['g1', 'g2']);
        expect(node.contentItems.map((i) => i.linkId)).toEqual(['voice']);
    });

    it('still gives a group-voice item its own section when it wraps a real subgroup', () => {
        const questionnaire = questionnaireFactory([
            groupFactory('root', [
                groupFactory('g1', [questionFactory('g1-q1')], { repeats: true }),
                groupFactory('g2', [questionFactory('g2-q1')]),
                controlledGroupFactory('voice', 'group-voice', [
                    groupFactory('nested-table', [questionFactory('nested-q1')], { repeats: true }),
                ]),
            ]),
        ]);
        const qr: QuestionnaireResponse = {
            resourceType: 'QuestionnaireResponse',
            status: 'completed',
            item: [{ linkId: 'root', item: [] }],
        };

        const { formValues, context } = buildContext(questionnaire, qr);
        const rootItem = questionnaire.item![0]!;
        const section = buildRootSection(rootItem, [], formValues, context);
        const node = section.nodes[0]!;

        expect(node.sections.map((s) => s.linkId)).toEqual(['g1', 'g2', 'voice']);
    });
});
