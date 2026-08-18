import { FCEQuestionnaireItem } from 'sdc-qrf';

export interface SidebarMenuNode {
    key: string;
    text: string;
    item: FCEQuestionnaireItem;
    // Path to this node's own children container - used to build/render its sections and content.
    path: string[];
    // Path to the repeatable array field itself (`fieldPath.items`), present when `item.repeats` - used for add/remove.
    fieldPath?: string[];
    repeatIndex?: number;
    sections: SidebarMenuSection[];
    contentItems: FCEQuestionnaireItem[];
}

export interface SidebarMenuSection {
    key: string;
    linkId: string;
    text: string;
    isRepeatable: boolean;
    fieldPath: string[];
    nodes: SidebarMenuNode[];
}
