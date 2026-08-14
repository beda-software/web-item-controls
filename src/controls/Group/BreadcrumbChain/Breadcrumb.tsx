import { DeleteOutlined, LockOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import { Fragment } from 'react';

import { S } from './styles';
import { BreadcrumbSegment } from './types';

interface Props {
    segments: BreadcrumbSegment[];
}

// Every alternative (and the "add" affordance) is always rendered as its own tab, so
// which sibling groups / repeat instances exist is visible at a glance without a click
// - only which one is *expanded* stays exclusive (clicking a tab switches it, closing
// whichever was open). A segment with a single alternative and no `onAdd` (e.g. one
// item with the add button hidden, see isGroupAddItemButtonHidden) has nothing to
// switch between, so it falls back to a plain static label. When `lockedHint` is set
// (see useGroupSiblingAccordion), every alternative is disabled and a lock icon plus
// the hint explain why, both on hover and inline.
export function Breadcrumb(props: Props) {
    const { segments } = props;

    // Only the deepest/last segment's remove control is ever shown, exactly as
    // before - it's "remove the item you're currently drilled into", not one button
    // per row.
    const last = segments[segments.length - 1];

    return (
        <S.Bar data-testid="breadcrumb">
            {segments.map((segment) => {
                const isSwitchable = segment.alternatives.length > 1 || !!segment.onAdd;

                return (
                    <S.Row key={segment.key}>
                        <S.RowMain>
                            {isSwitchable ? (
                                <S.Tabs>
                                    {segment.alternatives.map((alternative, index) => (
                                        <Fragment key={alternative.key}>
                                            {index > 0 && <S.Separator>/</S.Separator>}
                                            <Tooltip title={alternative.disabled ? segment.lockedHint : undefined}>
                                                <S.Tab
                                                    type="button"
                                                    disabled={alternative.disabled}
                                                    $active={alternative.isActive}
                                                    onClick={alternative.onSelect}
                                                    data-testid={`breadcrumb-segment-${alternative.key}`}
                                                >
                                                    {alternative.disabled && <LockOutlined />}
                                                    {alternative.title}
                                                    {typeof alternative.count === 'number' && (
                                                        <S.Count>({alternative.count})</S.Count>
                                                    )}
                                                </S.Tab>
                                            </Tooltip>
                                        </Fragment>
                                    ))}
                                    {segment.onAdd ? (
                                        <>
                                            <S.Separator>/</S.Separator>
                                            <S.AddTab
                                                type="button"
                                                onClick={segment.onAdd}
                                                data-testid="add-another-answer-button"
                                            >
                                                <PlusOutlined />
                                                <span>{segment.addLabel}</span>
                                            </S.AddTab>
                                        </>
                                    ) : null}
                                </S.Tabs>
                            ) : (
                                <S.StaticSegment data-testid={`breadcrumb-segment-${segment.key}`}>
                                    {segment.title}
                                    {typeof segment.count === 'number' && <S.Count>({segment.count})</S.Count>}
                                </S.StaticSegment>
                            )}
                            {segment === last && segment.onRemove ? (
                                <Button
                                    icon={<DeleteOutlined />}
                                    type="default"
                                    size="small"
                                    onClick={segment.onRemove}
                                    data-testid="remove-group-button"
                                />
                            ) : null}
                        </S.RowMain>
                        {segment.lockedHint ? (
                            <S.LockedHint>
                                <LockOutlined />
                                {segment.lockedHint}
                            </S.LockedHint>
                        ) : null}
                    </S.Row>
                );
            })}
        </S.Bar>
    );
}
