import { t } from '@lingui/macro';
import _ from 'lodash';
import { ReactNode, createContext, useContext } from 'react';
import { useFormContext } from 'react-hook-form';
import { FCEQuestionnaireItem, FormAnswerItems, cleanFormAnswerItems } from 'sdc-qrf';

// A `group-voice` group exists purely to give a voice assistant a stable target for the
// single item it wraps (see e.g. plan-goalstasks-details-goalsetting-voice in the GP
// Chronic Condition Management Plan questionnaire) - it carries neither the wrapped
// item's `type`/`repeats` nor its display text. See through that one layer wherever
// accordion qualification needs the real content rather than the wrapper shell, so a
// voice-wrapped repeatable group still counts, and a voice-wrapped single leaf field
// (e.g. "Problems/Needs") doesn't get mistaken for one.
export function unwrapVoiceGroup(item: FCEQuestionnaireItem): FCEQuestionnaireItem {
    const isVoiceWrapper = item.itemControl?.coding?.[0]?.code === 'group-voice';

    return isVoiceWrapper && item.item?.length === 1 ? unwrapVoiceGroup(item.item[0]!) : item;
}

// Only when a group contains multiple nested groups where at least one is repeatable
// do its group-type children become a collapsible accordion (only one open at a time).
// This keeps plain groups (including groups with a single nested repeatable group)
// rendering exactly as before.
export function getAccordionSiblingCandidates(item: FCEQuestionnaireItem[] | undefined) {
    return (item ?? []).filter((child) => unwrapVoiceGroup(child).type === 'group' && !child.hidden);
}

export function qualifiesForAccordion(candidates: FCEQuestionnaireItem[]) {
    return candidates.length > 1 && candidates.some((child) => unwrapVoiceGroup(child).repeats);
}

// The complement of getAccordionSiblingCandidates: a qualifying group's own direct
// fields (e.g. "Problems/Needs") rather than its nested collections. These gate the
// candidates - see isAccordionGateSatisfied - so a plain field that belongs to the
// group itself can't be mistaken for part of whichever collection happens to be open.
export function getAccordionGateFields(item: FCEQuestionnaireItem[] | undefined) {
    return (item ?? []).filter((child) => {
        const wrapped = unwrapVoiceGroup(child);

        return !child.hidden && wrapped.type !== 'group' && wrapped.type !== 'display';
    });
}

// Same voice-wrapper-aware value path a plain leaf field resolves to when rendered
// directly (see Flex in Group/index.tsx) - `[gateField.linkId]` for an unwrapped leaf,
// one level deeper through the wrapper's own linkId otherwise.
export function isGateFieldAnswered(gateField: FCEQuestionnaireItem, parentPath: string[], formValues: unknown) {
    const wrapped = unwrapVoiceGroup(gateField);
    const valuePath = wrapped === gateField ? [gateField.linkId] : [gateField.linkId, 'items', wrapped.linkId];

    const answers = _.get(formValues, [...parentPath, ...valuePath]) as (FormAnswerItems | undefined)[] | undefined;

    return cleanFormAnswerItems(answers ?? []).length > 0;
}

export function isAccordionGateSatisfied(
    gateFields: FCEQuestionnaireItem[],
    parentPath: string[],
    formValues: unknown,
) {
    return gateFields.every((gateField) => isGateFieldAnswered(gateField, parentPath, formValues));
}

// Number of existing repeat instances a candidate already has, resolved through the
// same voice-wrapper-aware path as its own rendering (see Flex in Group/index.tsx) -
// `undefined` for a non-repeating candidate, since a count badge/tab doesn't apply to
// it. `parentPath` must be the same path the candidate's own children are rendered at
// (i.e. what the caller passes to its own <QuestionItems parentPath={...} />).
export function getCandidateItemCount(
    candidate: FCEQuestionnaireItem,
    parentPath: string[],
    formValues: unknown,
): number | undefined {
    const wrapped = unwrapVoiceGroup(candidate);

    if (!wrapped.repeats) {
        return undefined;
    }

    const countPath =
        wrapped === candidate ? [candidate.linkId, 'items'] : [candidate.linkId, 'items', wrapped.linkId, 'items'];

    return (_.get(formValues, [...parentPath, ...countPath]) as unknown[] | undefined)?.length ?? 0;
}

// True when `linkId` is this item itself or appears anywhere in its nested items -
// used to resolve which sibling leads to a target that GroupWizardBus's
// 'expandGroup' event should reveal.
export function containsLinkId(item: FCEQuestionnaireItem, linkId: string): boolean {
    if (item.linkId === linkId) {
        return true;
    }

    return (item.item ?? []).some((child) => containsLinkId(child, linkId));
}

export function findCandidateContaining(candidates: FCEQuestionnaireItem[], linkId: string) {
    return candidates.find((candidate) => containsLinkId(candidate, linkId));
}

export const GroupAccordionModeContext = createContext(false);

export function useGroupAccordionMode() {
    return useContext(GroupAccordionModeContext);
}

export interface GroupSiblingAccordionContextProps {
    activeLinkId: string;
    setActiveLinkId: (linkId: string) => void;
    candidates: FCEQuestionnaireItem[];
    // The group's own direct fields that gate the candidates (see
    // getAccordionGateFields) and whether they currently all have an answer.
    gateFields: FCEQuestionnaireItem[];
    isGateSatisfied: boolean;
}

export const GroupSiblingAccordionContext = createContext<GroupSiblingAccordionContextProps | undefined>(undefined);

// A choice offered by the breadcrumb for one segment of the chain - either "which
// sibling group is active" or "which repeat instance is active". `count` is only
// populated for sibling-group alternatives (see useGroupSiblingAccordion) - it's what
// lets the always-visible tab strip show "Interventions and Actions (2)" for a
// collection that isn't the currently open one.
export interface GroupAccordionAlternative {
    key: string;
    title: ReactNode;
    count?: number;
    isActive: boolean;
    disabled?: boolean;
    onSelect: () => void;
}

// `parentPath` must be the same path the caller passes to its own
// <QuestionItems parentPath={...} /> for these candidates' children - it's only used
// to resolve each alternative's item count, not to change which one is active.
export function useGroupSiblingAccordion(linkId: string, parentPath: string[]) {
    const ctx = useContext(GroupSiblingAccordionContext);
    const { getValues } = useFormContext();

    // A group-voice wrapper around a single leaf field (e.g. "Problems/Needs") is a
    // `group`-typed sibling that never made it into `candidates` (see
    // getAccordionSiblingCandidates) - it must render unconditionally rather than being
    // hidden just because some other candidate is active.
    if (!ctx || !ctx.candidates.some((candidate) => candidate.linkId === linkId)) {
        return undefined;
    }

    const isOpen = ctx.activeLinkId === linkId;

    const alternatives: GroupAccordionAlternative[] = ctx.candidates.map((candidate) => ({
        key: candidate.linkId,
        title: unwrapVoiceGroup(candidate).text,
        count: getCandidateItemCount(candidate, parentPath, getValues()),
        isActive: candidate.linkId === ctx.activeLinkId,
        disabled: !ctx.isGateSatisfied,
        onSelect: () => ctx.setActiveLinkId(candidate.linkId),
    }));

    const lockedHint = ctx.isGateSatisfied
        ? undefined
        : t`Define ${ctx.gateFields.map((gateField) => unwrapVoiceGroup(gateField).text).join(', ')} first`;

    // While the gate isn't satisfied, `activeLinkId` is '' and no candidate is open -
    // without a designated host, the shared tab row would never render at all. Only
    // while NOTHING is open does the first candidate (stable regardless of which one
    // is actually open otherwise) stand in to host it; the moment any candidate is
    // open, that one alone owns the whole chain again, exactly as before gating
    // existed - `isAnchor` must never be true for more than one candidate at a time,
    // or two competing chains render side by side.
    const isAnchor = ctx.activeLinkId === '' && ctx.candidates[0]!.linkId === linkId;

    return {
        isOpen,
        isAnchor,
        alternatives,
        lockedHint,
    };
}

export interface GroupGateInfo {
    isGateField: (linkId: string) => boolean;
    // Whether gate fields should currently render read-only - true exactly while
    // satisfied and some sibling collection is open (see the state-machine note in
    // ChildGroupAccordionProvider.tsx).
    isReadOnly: boolean;
    activeTitle?: ReactNode;
    onReactivate: () => void;
}

// One snapshot for the whole set of gate fields under this group, rather than a
// per-linkId hook - letting the caller decide per-child whether to wrap it (see
// FlexContent in Group/index.tsx) without calling a hook inside a loop.
export function useGroupGateInfo(): GroupGateInfo | undefined {
    const ctx = useContext(GroupSiblingAccordionContext);

    if (!ctx || ctx.gateFields.length === 0) {
        return undefined;
    }

    const activeCandidate = ctx.candidates.find((candidate) => candidate.linkId === ctx.activeLinkId);

    return {
        isGateField: (linkId) => ctx.gateFields.some((gateField) => gateField.linkId === linkId),
        isReadOnly: ctx.isGateSatisfied && ctx.activeLinkId !== '',
        activeTitle: activeCandidate ? unwrapVoiceGroup(activeCandidate).text : undefined,
        onReactivate: () => ctx.setActiveLinkId(''),
    };
}
