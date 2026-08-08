import { ReactNode, useState } from 'react';
import { FCEQuestionnaireItem } from 'sdc-qrf';

import { GroupWizardBus } from 'src/controls/GroupWizard';

import {
    GroupAccordionModeContext,
    GroupSiblingAccordionContext,
    findCandidateContaining,
    getAccordionSiblingCandidates,
    getPendingExpandTarget,
    qualifiesForAccordion,
    setPendingExpandTarget,
} from './accordionContext';

interface Props {
    item: FCEQuestionnaireItem[] | undefined;
    children: ReactNode;
}

export function ChildGroupAccordionProvider(props: Props) {
    const { item, children } = props;

    const candidates = getAccordionSiblingCandidates(item);
    const qualifies = qualifiesForAccordion(candidates);

    const [activeLinkId, setActiveLinkId] = useState(() => {
        if (!qualifies) {
            return '';
        }

        const pendingCandidate = findCandidateContaining(candidates, getPendingExpandTarget() ?? '');

        return (pendingCandidate ?? candidates[0]!).linkId;
    });

    // GroupWizardBus is also used by GroupWizard/GroupTabs to jump to a step; here it
    // lets any code (e.g. a "jump to error" action) reveal a group by linkId and have
    // every ancestor accordion open along the way.
    GroupWizardBus.useBus(
        'expandGroup',
        ({ groupLinkId }) => {
            if (!qualifies) {
                return;
            }

            const candidate = findCandidateContaining(candidates, groupLinkId);

            if (!candidate) {
                return;
            }

            setPendingExpandTarget(groupLinkId);
            setActiveLinkId(candidate.linkId);
        },
        [candidates, qualifies],
    );

    if (!qualifies) {
        return <>{children}</>;
    }

    return (
        <GroupAccordionModeContext.Provider value={true}>
            <GroupSiblingAccordionContext.Provider value={{ activeLinkId, setActiveLinkId, candidates }}>
                {children}
            </GroupSiblingAccordionContext.Provider>
        </GroupAccordionModeContext.Provider>
    );
}
