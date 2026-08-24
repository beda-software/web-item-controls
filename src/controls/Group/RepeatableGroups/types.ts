import { ReactNode } from 'react';
import { GroupItemProps } from 'sdc-qrf';

import { GroupAccordionAlternative } from '../accordionContext';

export interface RepeatableGroupProps {
    index: number;
    items: any;
    onChange: (event: any) => void;
    groupItem: GroupItemProps;
    isOpen?: boolean;
    // Present only when this repeatable group is part of an accordion chain - the
    // full list of items as breadcrumb choices, shared identically across every
    // item so whichever one is active can offer the others to switch to.
    alternatives?: GroupAccordionAlternative[];
    // Also only present in accordion mode - appends a new item, offered as the last
    // entry of the active item's breadcrumb dropdown instead of a separate button.
    onAdd?: () => void;
    addLabel?: ReactNode;
}
