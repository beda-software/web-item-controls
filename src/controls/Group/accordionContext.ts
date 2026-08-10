import { ReactNode, createContext, useContext } from 'react';
import { FCEQuestionnaireItem } from 'sdc-qrf';

// Only when a group contains multiple nested groups where at least one is repeatable
// do its group-type children become a collapsible accordion (only one open at a time).
// This keeps plain groups (including groups with a single nested repeatable group)
// rendering exactly as before.
export function getAccordionSiblingCandidates(item: FCEQuestionnaireItem[] | undefined) {
    return (item ?? []).filter((child) => child.type === 'group' && !child.hidden);
}

export function qualifiesForAccordion(candidates: FCEQuestionnaireItem[]) {
    return candidates.length > 1 && candidates.some((child) => child.repeats);
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

    if (!ctx) {
        return undefined;
    }

    const isOpen = ctx.activeLinkId === linkId;

    const alternatives: GroupAccordionAlternative[] = ctx.candidates.map((candidate) => ({
        key: candidate.linkId,
        title: candidate.text,
        isActive: candidate.linkId === ctx.activeLinkId,
        onSelect: () => ctx.setActiveLinkId(candidate.linkId),
    }));

    return {
        isOpen,
        alternatives,
    };
}
