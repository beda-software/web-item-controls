import _ from 'lodash';
import { FCEQuestionnaireItem, FormItems, ItemContext, getEnabledQuestions } from 'sdc-qrf';

import { SidebarMenuNode, SidebarMenuSection } from './types';

export function getItemControlCode(item: FCEQuestionnaireItem): string | undefined {
    return item.itemControl?.coding?.[0]?.code;
}

export function isGroupVoiceItem(item: FCEQuestionnaireItem): boolean {
    return getItemControlCode(item) === 'group-voice';
}

function isGroupItem(item: FCEQuestionnaireItem): boolean {
    return item.type === 'group';
}

// group-voice items are structural wrappers used to manage voice capture, not a subgroup a user picks between,
// so they're excluded from the subgroup checks/counts below even though they're still real group items. Every
// other group - regardless of its own itemControl (gtable, grid, ...) - is walked and split into per-instance
// sidebar rows the same way, so the sidebar is the single, uniform place users navigate/add/remove entries from.
function isCountableSubgroup(item: FCEQuestionnaireItem): boolean {
    return isGroupItem(item) && !isGroupVoiceItem(item);
}

export function shouldApplySidebarDesign(questionItem: FCEQuestionnaireItem): boolean {
    const subgroups = (questionItem.item ?? []).filter(isCountableSubgroup);

    // A tree with a single entry is never useful, and without this gate the checks below over-trigger on
    // ordinary single-repeatable-child groups (e.g. an address group with one repeatable "details" child).
    if (subgroups.length < 2) {
        return false;
    }

    return (
        subgroups.length > 2 ||
        subgroups.some((subgroup) => subgroup.repeats === true) ||
        subgroups.some((subgroup) => (subgroup.item ?? []).some(isCountableSubgroup))
    );
}

function getRepeatCount(formValues: FormItems, fieldPath: string[]): number {
    const items = _.get(formValues, [...fieldPath, 'items']);

    return Array.isArray(items) ? items.length : 0;
}

function getEnabledChildren(
    item: FCEQuestionnaireItem,
    path: string[],
    formValues: FormItems,
    groupContext: ItemContext,
): FCEQuestionnaireItem[] {
    // NOTE: `groupContext` (a single ItemContext) is reused unchanged at every depth - the same tolerated
    // approximation `getAllGroupQuestionsWithAnswerStatusRecursive` relies on for nested-group enableWhen
    // evaluation. The path, unlike context, is threaded precisely so sibling-answer lookups resolve correctly.
    return getEnabledQuestions(item.item ?? [], path, formValues, groupContext).filter((child) => !child.hidden);
}

function buildNode(
    item: FCEQuestionnaireItem,
    text: string,
    path: string[],
    fieldPath: string[] | undefined,
    repeatIndex: number | undefined,
    formValues: FormItems,
    groupContext: ItemContext,
): SidebarMenuNode {
    const children = getEnabledChildren(item, path, formValues, groupContext);
    const groupChildren = children.filter(isGroupItem);
    const contentItems = children.filter((child) => !isGroupItem(child) || isGroupVoiceItem(child));

    const sections = groupChildren.map((child) => buildSection(child, path, formValues, groupContext));

    return {
        key: path.join('.'),
        text,
        item,
        path,
        fieldPath,
        repeatIndex,
        sections,
        contentItems,
    };
}

function buildSection(
    item: FCEQuestionnaireItem,
    containerPath: string[],
    formValues: FormItems,
    groupContext: ItemContext,
): SidebarMenuSection {
    const { linkId, text = linkId, repeats } = item;
    const fieldPath = [...containerPath, linkId];

    if (!repeats) {
        const path = [...fieldPath, 'items'];
        const node = buildNode(item, text, path, undefined, undefined, formValues, groupContext);

        return { key: fieldPath.join('.'), linkId, text, isRepeatable: false, fieldPath, nodes: [node] };
    }

    const count = getRepeatCount(formValues, fieldPath);
    const nodes = _.range(count).map((index) => {
        const path = [...fieldPath, 'items', index.toString()];
        const label = `${text} ${index + 1}`;

        return buildNode(item, label, path, fieldPath, index, formValues, groupContext);
    });

    return { key: fieldPath.join('.'), linkId, text, isRepeatable: true, fieldPath, nodes };
}

export function buildRootSection(
    questionItem: FCEQuestionnaireItem,
    parentPath: string[],
    formValues: FormItems,
    groupContext: ItemContext,
): SidebarMenuSection {
    return buildSection(questionItem, parentPath, formValues, groupContext);
}
