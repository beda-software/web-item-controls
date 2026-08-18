import { Trans } from '@lingui/macro';
import { useEffect, useMemo, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { GroupItemProps, QuestionItems } from 'sdc-qrf';

import { Text } from 'src/components/Typography';
import { GroupWizardBus } from 'src/controls/GroupWizard';
import { SidebarMenu } from 'src/controls/GroupWizard/GroupWizardSidebar/SidebarMenu';
import { S } from 'src/controls/GroupWizard/GroupWizardSidebar/styles';
import { SidebarMenuNode, SidebarMenuSection } from 'src/controls/GroupWizard/GroupWizardSidebar/types';
import {
    buildRootSection,
    findSectionByLinkId,
    shouldApplySidebarDesign,
} from 'src/controls/GroupWizard/GroupWizardSidebar/utils';

interface FlatTree {
    nodesByKey: Map<string, SidebarMenuNode>;
    ancestorsByKey: Map<string, string[]>;
}

function flattenSection(section: SidebarMenuSection, ancestors: string[], acc: FlatTree): void {
    section.nodes.forEach((node) => {
        acc.nodesByKey.set(node.key, node);
        acc.ancestorsByKey.set(node.key, ancestors);
        node.sections.forEach((childSection) => flattenSection(childSection, [...ancestors, node.key], acc));
    });
}

function flattenRootSection(rootSection: SidebarMenuSection): FlatTree {
    const acc: FlatTree = { nodesByKey: new Map(), ancestorsByKey: new Map() };
    flattenSection(rootSection, [], acc);

    return acc;
}

export function GroupWizardSidebar(props: GroupItemProps) {
    const { parentPath, questionItem, context } = props;
    const { linkId, hidden } = questionItem;

    const groupContext = context[0]!;
    const formValues = useWatch();

    // Top-level rows behave as an accordion (at most one expanded at a time), tracked separately from
    // deeper rows, which can expand/collapse independently of one another.
    const [expandedRootKey, setExpandedRootKey] = useState<string | null>(null);
    const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
    const [selectedKey, setSelectedKey] = useState<string | null>(null);

    const rootSection = useMemo(
        () => buildRootSection(questionItem, parentPath, formValues, groupContext),
        [questionItem, parentPath, formValues, groupContext],
    );

    const { nodesByKey, ancestorsByKey } = useMemo(() => flattenRootSection(rootSection), [rootSection]);

    const selectedNode = selectedKey ? nodesByKey.get(selectedKey) : undefined;

    // A subgroup's content panel also shows its ancestors' own data for context - so switching to "Goal setting"
    // doesn't hide what was entered directly on "Goals and tasks 1". Everything here is already read-only.
    const ancestorNodes = (selectedKey ? ancestorsByKey.get(selectedKey) ?? [] : [])
        .map((key) => nodesByKey.get(key))
        .filter((node): node is SidebarMenuNode => !!node && node.contentItems.length > 0);

    // The top-level row currently in view - a bus command naming a nested subgroup (e.g. "Goal setting") is
    // resolved against THIS row's own subtree, since the same subgroup linkId produces a distinct section per
    // top-level repeat instance.
    const activeRootKey = selectedKey ? ancestorsByKey.get(selectedKey)?.[0] ?? selectedKey : rootSection.nodes[0]?.key;
    const activeRootNode = activeRootKey ? nodesByKey.get(activeRootKey) : undefined;

    const findTargetSection = (groupLinkId: string) =>
        activeRootNode ? findSectionByLinkId(activeRootNode.sections, groupLinkId) : undefined;

    useEffect(() => {
        if (!selectedNode && rootSection.nodes.length > 0) {
            const firstNode = rootSection.nodes[0]!;

            setSelectedKey(firstNode.key);
            setExpandedRootKey(firstNode.key);
        }
    }, [selectedNode, rootSection]);

    const selectNode = (key: string) => {
        setSelectedKey(key);

        const ancestors = ancestorsByKey.get(key) ?? [];
        const [rootAncestor, ...nestedAncestors] = ancestors;

        // A root-level node has no ancestors of its own - it's the one to expand.
        setExpandedRootKey(rootAncestor ?? key);

        if (nestedAncestors.length > 0) {
            setExpandedKeys((prev) => new Set([...prev, ...nestedAncestors]));
        }
    };

    const toggleRootExpand = (node: SidebarMenuNode) => {
        const rootKeys = rootSection.nodes.map((rootNode) => rootNode.key);

        if (rootKeys.length < 2) {
            return;
        }

        if (expandedRootKey !== node.key) {
            setExpandedRootKey(node.key);

            return;
        }

        const currentIndex = rootKeys.indexOf(node.key);
        const nextIndex = (currentIndex + 1) % rootKeys.length;

        setExpandedRootKey(rootKeys[nextIndex]!);
    };

    GroupWizardBus.useBus(
        'sidebarSelect',
        (action) => {
            if (action.type !== 'sidebarSelect' || action.groupLinkId !== linkId || !nodesByKey.has(action.key)) {
                return;
            }

            selectNode(action.key);
        },
        [linkId, nodesByKey],
    );

    GroupWizardBus.useBus(
        'sidebarGoToIndex',
        (action) => {
            if (action.type !== 'sidebarGoToIndex' || action.groupLinkId !== linkId) {
                return;
            }

            const node = rootSection.nodes[action.index];

            if (node) {
                selectNode(node.key);
            }
        },
        [linkId, rootSection],
    );

    GroupWizardBus.useBus(
        'sidebarGoToPrevious',
        ({ groupLinkId }) => {
            const section = groupLinkId === linkId ? rootSection : findTargetSection(groupLinkId)?.section;

            if (!section) {
                return;
            }

            const currentIndex = section.nodes.findIndex((node) => node.key === selectedKey);
            const previousIndex = Math.max(0, (currentIndex === -1 ? section.nodes.length : currentIndex) - 1);
            const node = section.nodes[previousIndex];

            if (node) {
                selectNode(node.key);
            }
        },
        [linkId, rootSection, activeRootNode, selectedKey],
    );

    GroupWizardBus.useBus(
        'sidebarGoToNext',
        ({ groupLinkId }) => {
            const section = groupLinkId === linkId ? rootSection : findTargetSection(groupLinkId)?.section;

            if (!section) {
                return;
            }

            const currentIndex = section.nodes.findIndex((node) => node.key === selectedKey);
            const nextIndex = Math.min(section.nodes.length - 1, currentIndex + 1);
            const node = section.nodes[nextIndex];

            if (node) {
                selectNode(node.key);
            }
        },
        [linkId, rootSection, activeRootNode, selectedKey],
    );

    if (hidden || !questionItem.item) {
        return null;
    }

    if (!shouldApplySidebarDesign(questionItem)) {
        console.error('GroupWizardSidebar was used for a group that does not match the sidebar design criteria');

        return (
            <Text>
                <Trans>The sidebar item control requires at least 2 subgroups</Trans>
            </Text>
        );
    }

    return (
        <S.Container>
            <S.Sider>
                <SidebarMenu
                    section={rootSection}
                    expandedRootKey={expandedRootKey}
                    expandedKeys={expandedKeys}
                    selectedKey={selectedKey}
                    onToggleRoot={toggleRootExpand}
                    onToggleExpand={(key) =>
                        setExpandedKeys((prev) => {
                            const next = new Set(prev);

                            if (next.has(key)) {
                                next.delete(key);
                            } else {
                                next.add(key);
                            }

                            return next;
                        })
                    }
                    onSelect={(node) =>
                        GroupWizardBus.dispatch({ type: 'sidebarSelect', groupLinkId: linkId, key: node.key })
                    }
                />
            </S.Sider>
            <S.Content>
                {selectedNode ? (
                    <>
                        {ancestorNodes.map((ancestorNode) => (
                            <S.ParentPreview key={ancestorNode.key}>
                                <S.ParentPreviewTitle level={5}>{ancestorNode.text}</S.ParentPreviewTitle>
                                <QuestionItems
                                    questionItems={ancestorNode.contentItems}
                                    parentPath={ancestorNode.path}
                                    context={groupContext}
                                />
                            </S.ParentPreview>
                        ))}
                        <S.ContentHeader>
                            <S.ContentTitle level={4}>{selectedNode.text}</S.ContentTitle>
                        </S.ContentHeader>
                        <QuestionItems
                            questionItems={selectedNode.contentItems}
                            parentPath={selectedNode.path}
                            context={groupContext}
                        />
                    </>
                ) : null}
            </S.Content>
        </S.Container>
    );
}
