import { ReactNode } from 'react';

import { GroupAccordionAlternative } from '../accordionContext';

// One position in the combined header - either "which sibling group is active"
// or "which repeat instance is active". `onRemove` is only set for repeat-instance
// segments, since sibling groups (Goal Settings vs Interventions and Actions) aren't
// individually removable. `onAdd`/`addLabel` are also only set for repeat-instance
// segments - it appends a new item to the same repeatable group, offered as the last
// entry of the segment's dropdown instead of a separate button below the content.
export interface BreadcrumbSegment {
    key: string;
    title: ReactNode;
    count?: number;
    alternatives: GroupAccordionAlternative[];
    onRemove?: () => void;
    onAdd?: () => void;
    addLabel?: ReactNode;
}
