import { PlusOutlined, RightOutlined } from '@ant-design/icons';
import { t } from '@lingui/macro';
import { Fragment } from 'react';

import { S } from './styles';
import { SidebarMenuNode, SidebarMenuSection } from './types';

export interface SidebarMenuProps {
    section: SidebarMenuSection;
    depth?: number;
    // Top-level (depth 0) rows behave as an accordion - at most one expanded at a time - so they're tracked
    // separately from deeper rows, which expand/collapse independently of one another.
    expandedRootKey: string | null;
    expandedKeys: Set<string>;
    selectedKey: string | null;
    onToggleRoot: (node: SidebarMenuNode) => void;
    onToggleExpand: (key: string) => void;
    onSelect: (node: SidebarMenuNode) => void;
    onAdd?: (section: SidebarMenuSection) => void;
}

export function SidebarMenu(props: SidebarMenuProps) {
    const {
        section,
        depth = 0,
        expandedRootKey,
        expandedKeys,
        selectedKey,
        onToggleRoot,
        onToggleExpand,
        onSelect,
        onAdd,
    } = props;

    const isRoot = depth === 0;
    const nodeDepth = isRoot || !section.isRepeatable ? depth : depth + 1;

    const nodes = section.nodes.map((node) => (
        <SidebarMenuNodeView
            key={node.key}
            node={node}
            depth={nodeDepth}
            siblingCount={section.nodes.length}
            expandedRootKey={expandedRootKey}
            expandedKeys={expandedKeys}
            selectedKey={selectedKey}
            onToggleRoot={onToggleRoot}
            onToggleExpand={onToggleExpand}
            onSelect={onSelect}
            onAdd={onAdd}
        />
    ));

    // Root level: a flat list of top-level instances with a trailing "Add {text}" line (or, with no instances
    // yet, a single unnumbered placeholder row).
    if (isRoot) {
        if (section.nodes.length === 0) {
            return (
                <S.Row $depth={depth}>
                    <S.RowLabel>{section.text}</S.RowLabel>
                    {section.isRepeatable && onAdd ? (
                        <S.ExpandButton
                            type="button"
                            aria-label={t`Add ${section.text}`}
                            data-testid={`sidebar-menu-add-${section.linkId}`}
                            onClick={() => onAdd(section)}
                        >
                            <PlusOutlined />
                        </S.ExpandButton>
                    ) : null}
                </S.Row>
            );
        }

        return (
            <S.Section>
                {nodes}
                {section.isRepeatable && onAdd ? (
                    <S.Row $depth={depth}>
                        <S.AddButton
                            type="button"
                            data-testid={`sidebar-menu-add-${section.linkId}`}
                            onClick={() => onAdd(section)}
                        >
                            <PlusOutlined />
                            {t`Add ${section.text}`}
                        </S.AddButton>
                    </S.Row>
                ) : null}
            </S.Section>
        );
    }

    // Nested repeatable section: a persistent header carrying the group name and the "+" action, with its
    // existing instances (if any) listed underneath - instead of a plain unnumbered placeholder row (when empty)
    // or a separate trailing "Add {text}" line (once instances exist).
    if (section.isRepeatable) {
        return (
            <S.Section>
                <S.Row $depth={depth}>
                    <S.RowLabel>{section.text}</S.RowLabel>
                    {onAdd ? (
                        <S.ExpandButton
                            type="button"
                            aria-label={t`Add ${section.text}`}
                            data-testid={`sidebar-menu-add-${section.linkId}`}
                            onClick={() => onAdd(section)}
                        >
                            <PlusOutlined />
                        </S.ExpandButton>
                    ) : null}
                </S.Row>
                {nodes}
            </S.Section>
        );
    }

    // Nested, non-repeatable section: always exactly one node, nothing to add - render it as-is.
    return <S.Section>{nodes}</S.Section>;
}

interface SidebarMenuNodeViewProps {
    node: SidebarMenuNode;
    depth: number;
    siblingCount: number;
    expandedRootKey: string | null;
    expandedKeys: Set<string>;
    selectedKey: string | null;
    onToggleRoot: (node: SidebarMenuNode) => void;
    onToggleExpand: (key: string) => void;
    onSelect: (node: SidebarMenuNode) => void;
    onAdd?: (section: SidebarMenuSection) => void;
}

function SidebarMenuNodeView(props: SidebarMenuNodeViewProps) {
    const {
        node,
        depth,
        siblingCount,
        expandedRootKey,
        expandedKeys,
        selectedKey,
        onToggleRoot,
        onToggleExpand,
        onSelect,
        onAdd,
    } = props;

    const isRoot = depth === 0;
    const hasChildren = node.sections.length > 0;
    const isExpanded = isRoot ? node.key === expandedRootKey : expandedKeys.has(node.key);
    // A lone top-level item has nothing to collapse into (there's no "next" one to open), so it stays expanded
    // and the toggle is hidden - collapsing only makes sense once there's another item to switch to.
    const canToggle = hasChildren && (!isRoot || siblingCount >= 2);
    const isSelected = selectedKey === node.key;

    return (
        <Fragment>
            <S.Row
                $depth={depth}
                $selected={isSelected}
                $clickable
                onClick={() => onSelect(node)}
                data-testid={`sidebar-menu-row-${node.key}`}
            >
                <S.RowLabel>{node.text}</S.RowLabel>
                {canToggle ? (
                    <S.ExpandButton
                        type="button"
                        aria-label={isExpanded ? t`Collapse` : t`Expand`}
                        data-testid={`sidebar-menu-toggle-${node.key}`}
                        onClick={(event) => {
                            event.stopPropagation();

                            if (isRoot) {
                                onToggleRoot(node);
                            } else {
                                onToggleExpand(node.key);
                            }
                        }}
                    >
                        <RightOutlined rotate={isExpanded ? 90 : 0} />
                    </S.ExpandButton>
                ) : null}
            </S.Row>
            {hasChildren && (isExpanded || (isRoot && siblingCount < 2))
                ? node.sections.map((section) => (
                      <SidebarMenu
                          key={section.key}
                          section={section}
                          depth={depth + 1}
                          expandedRootKey={expandedRootKey}
                          expandedKeys={expandedKeys}
                          selectedKey={selectedKey}
                          onToggleRoot={onToggleRoot}
                          onToggleExpand={onToggleExpand}
                          onSelect={onSelect}
                          onAdd={onAdd}
                      />
                  ))
                : null}
        </Fragment>
    );
}
