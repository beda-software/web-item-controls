import { DeleteOutlined } from '@ant-design/icons';
import { t, Trans } from '@lingui/macro';
import { Button, Popconfirm } from 'antd';
import _ from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import {
    GroupItemProps,
    QuestionItems,
    QuestionnaireResponseFormProvider,
    populateItemKey,
    useQuestionnaireResponseFormContext,
} from 'sdc-qrf';

import { Text } from 'src/components/Typography';
import { GroupWizardBus } from 'src/controls/GroupWizard';

import { SidebarMenu } from './SidebarMenu';
import { S } from './styles';
import { SidebarMenuNode, SidebarMenuSection } from './types';
import { buildRootSection, shouldApplySidebarDesign } from './utils';

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
    const { linkId, hidden, readOnly } = questionItem;

    const groupContext = context[0]!;
    const formValues = useWatch();
    const { getValues, setValue } = useFormContext();
    const qrfContext = useQuestionnaireResponseFormContext();

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

    // A subgroup's content panel also shows its ancestors' own data, read-only, for context - so switching to
    // "Goal setting" doesn't hide what was entered directly on "Goals and tasks 1".
    const ancestorNodes = (selectedKey ? ancestorsByKey.get(selectedKey) ?? [] : [])
        .map((key) => nodesByKey.get(key))
        .filter((node): node is SidebarMenuNode => !!node && node.contentItems.length > 0);

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

    const addInstance = (section: SidebarMenuSection) => {
        const current = _.get(getValues(), section.fieldPath);
        const items = current?.items ?? [];
        const populated = [...items, {}].map(populateItemKey);
        const newKey = [...section.fieldPath, 'items', items.length.toString()].join('.');

        setValue(section.fieldPath.join('.'), { ...current, items: populated }, { shouldDirty: true });
        setSelectedKey(newKey);

        // The new key doesn't exist in the (pre-add) tree yet, so its ancestors can't be looked up. Adding to
        // the root section always means a new top-level (accordion) entry; adding to a nested section relies on
        // its ancestors already being expanded, since that's how its "+" became visible in the first place.
        if (section === rootSection) {
            setExpandedRootKey(newKey);
        }
    };

    const removeInstance = (node: SidebarMenuNode) => {
        if (node.repeatIndex === undefined || !node.fieldPath) {
            return;
        }

        const current = _.get(getValues(), node.fieldPath);
        const items = current?.items ?? [];
        const filtered = items.filter((_item: unknown, index: number) => index !== node.repeatIndex);

        setValue(node.fieldPath.join('.'), { ...current, items: filtered }, { shouldDirty: true });
        setSelectedKey(null);
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
            if (groupLinkId !== linkId) {
                return;
            }

            const currentIndex = rootSection.nodes.findIndex((node) => node.key === selectedKey);
            const previousIndex = Math.max(0, (currentIndex === -1 ? rootSection.nodes.length : currentIndex) - 1);
            const node = rootSection.nodes[previousIndex];

            if (node) {
                selectNode(node.key);
            }
        },
        [linkId, rootSection, selectedKey],
    );

    GroupWizardBus.useBus(
        'sidebarAddElement',
        ({ groupLinkId }) => {
            if (groupLinkId !== linkId) {
                return;
            }

            addInstance(rootSection);
        },
        [linkId, rootSection],
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
                    onAdd={readOnly ? undefined : addInstance}
                />
            </S.Sider>
            <S.Content>
                {selectedNode ? (
                    <>
                        {ancestorNodes.length > 0 ? (
                            <QuestionnaireResponseFormProvider {...qrfContext} readOnly>
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
                            </QuestionnaireResponseFormProvider>
                        ) : null}
                        <S.ContentHeader>
                            <S.ContentTitle level={4}>{selectedNode.text}</S.ContentTitle>
                            {!readOnly && selectedNode.repeatIndex !== undefined ? (
                                <Popconfirm
                                    title={t`Are you sure you want to delete this item?`}
                                    onConfirm={() => removeInstance(selectedNode)}
                                >
                                    <Button
                                        danger
                                        icon={<DeleteOutlined />}
                                        data-testid={`sidebar-menu-remove-${selectedNode.key}`}
                                    />
                                </Popconfirm>
                            ) : null}
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

export { shouldApplySidebarDesign } from './utils';
export type { SidebarMenuNode, SidebarMenuSection } from './types';
