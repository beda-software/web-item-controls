import { createContext, useContext } from 'react';
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

// Set synchronously by every ChildGroupAccordionProvider that resolves an
// 'expandGroup' event, before it flips its own active sibling. A sibling that was
// collapsed (and so mounts its own provider for the first time as a result) reads
// this on its initial render to pick the right candidate instead of defaulting to
// the first one - letting a single dispatch reveal a target nested arbitrarily deep
// through however many collapsed ancestor accordions sit above it. Deliberately
// never cleared: a stale value simply won't match any candidate in an unrelated
// subtree, since linkIds are unique per questionnaire.
let pendingExpandTarget: string | undefined;

export function getPendingExpandTarget() {
    return pendingExpandTarget;
}

export function setPendingExpandTarget(linkId: string) {
    pendingExpandTarget = linkId;
}

export const GroupAccordionModeContext = createContext(false);

export function useGroupAccordionMode() {
    return useContext(GroupAccordionModeContext);
}

export interface GroupSiblingAccordionContextProps {
    activeLinkId: string;
    setActiveLinkId: (linkId: string) => void;
}

export const GroupSiblingAccordionContext = createContext<GroupSiblingAccordionContextProps | undefined>(undefined);

export function useGroupSiblingAccordion(linkId: string) {
    const ctx = useContext(GroupSiblingAccordionContext);

    if (!ctx) {
        return undefined;
    }

    const isOpen = ctx.activeLinkId === linkId;

    return {
        isOpen,
        onToggle: () => ctx.setActiveLinkId(isOpen ? '' : linkId),
    };
}
