import { ReactNode, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { FCEQuestionnaireItem } from 'sdc-qrf';

import { GroupWizardBus } from 'src/controls/GroupWizard';

import {
    GroupAccordionModeContext,
    GroupSiblingAccordionContext,
    findCandidateContaining,
    getAccordionGateFields,
    getAccordionSiblingCandidates,
    getCandidateItemCount,
    isAccordionGateSatisfied,
    qualifiesForAccordion,
} from './accordionContext';

interface Props {
    item: FCEQuestionnaireItem[] | undefined;
    // The parent group's own linkId (e.g. "plan-goalstasks", "Goals and Tasks") -
    // distinct from any of its children's linkIds, this is what 'reactivateGateField'
    // targets on GroupWizardBus (see below).
    groupLinkId: string;
    // Same path the caller passes to its own <QuestionItems parentPath={...} /> for
    // these candidates' children - used only to pick a sensible default active
    // candidate (see below), not to resolve rendering.
    parentPath: string[];
    children: ReactNode;
}

export function ChildGroupAccordionProvider(props: Props) {
    const { item, groupLinkId, parentPath, children } = props;

    const { getValues } = useFormContext();
    // Whole-form reactive watch, same pattern GroupWizard/index.tsx uses for its own
    // step-completion status - needed so isGateSatisfied updates live as the user
    // types into a gate field, not just once at mount.
    const watchedValues = useWatch();

    const candidates = getAccordionSiblingCandidates(item);
    const qualifies = qualifiesForAccordion(candidates);
    const gateFields = getAccordionGateFields(item);
    const isGateSatisfied = isAccordionGateSatisfied(gateFields, parentPath, watchedValues);

    // Default to the first candidate that already has existing items, so opening a
    // filled-in record shows its data immediately instead of always landing on
    // whichever candidate happens to be declared first. Falls back to the first
    // candidate when none have data yet - there's always exactly one active tab.
    // Stays closed (no active tab) when the gate isn't satisfied yet at mount, even if
    // a candidate somehow already has data.
    const [activeLinkId, setActiveLinkId] = useState(() => {
        if (!qualifies || !isAccordionGateSatisfied(gateFields, parentPath, getValues())) {
            return '';
        }

        const formValues = getValues();
        const withData = candidates.find(
            (candidate) => (getCandidateItemCount(candidate, parentPath, formValues) ?? 0) > 0,
        );

        return (withData ?? candidates[0]!).linkId;
    });

    const revealLinkId = (groupLinkId: string) => {
        if (!qualifies) {
            return;
        }

        const candidate = findCandidateContaining(candidates, groupLinkId);

        if (!candidate) {
            return;
        }

        setActiveLinkId(candidate.linkId);
    };

    // GroupWizardBus is also used by GroupWizard/GroupTabs to jump to a step; here it
    // lets any code (e.g. a "jump to error" action) reveal a group by linkId and have
    // every ancestor accordion open along the way.
    GroupWizardBus.useBus('expandGroup', ({ groupLinkId }) => revealLinkId(groupLinkId), [candidates, qualifies]);

    // GroupWizard/GroupTabs resolve 'scrollTo' against their own steps/tabs; an
    // accordion's combined header is a third kind of "switch between subelements"
    // container and needs the same handling, or a target sitting behind one never
    // gets revealed when the caller only knows to dispatch 'scrollTo'.
    GroupWizardBus.useBus('scrollTo', ({ groupLinkId }) => revealLinkId(groupLinkId), [candidates, qualifies]);

    // Simulates clicking the read-only gate field's own overlay (see
    // useGroupGateInfo/GroupChildren.tsx) - targeted by this group's own linkId
    // (e.g. "plan-goalstasks"), not the gate field's, since a voice assistant or test
    // knows "which record" it's acting on, not the internal gate field linkId.
    GroupWizardBus.useBus(
        'reactivateGateField',
        (event) => {
            if (event.groupLinkId !== groupLinkId || !isGateSatisfied || activeLinkId === '') {
                return;
            }

            setActiveLinkId('');
        },
        [groupLinkId, isGateSatisfied, activeLinkId],
    );

    if (!qualifies) {
        return <>{children}</>;
    }

    return (
        <GroupAccordionModeContext.Provider value={true}>
            <GroupSiblingAccordionContext.Provider
                value={{ activeLinkId, setActiveLinkId, candidates, gateFields, isGateSatisfied }}
            >
                {children}
            </GroupSiblingAccordionContext.Provider>
        </GroupAccordionModeContext.Provider>
    );
}
