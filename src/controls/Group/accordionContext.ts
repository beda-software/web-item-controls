import { ReactNode, createContext, useContext } from 'react';
import { FCEQuestionnaireItem } from 'sdc-qrf';

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
}

export const GroupSiblingAccordionContext = createContext<GroupSiblingAccordionContextProps | undefined>(undefined);

// A choice offered by the breadcrumb for one segment of the chain - either "which
// sibling group is active" or "which repeat instance is active".
export interface GroupAccordionAlternative {
    key: string;
    title: ReactNode;
    isActive: boolean;
    onSelect: () => void;
}

export function useGroupSiblingAccordion(linkId: string) {
    const ctx = useContext(GroupSiblingAccordionContext);

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
        isActive: candidate.linkId === ctx.activeLinkId,
        onSelect: () => ctx.setActiveLinkId(candidate.linkId),
    }));

    return {
        isOpen,
        alternatives,
    };
}
