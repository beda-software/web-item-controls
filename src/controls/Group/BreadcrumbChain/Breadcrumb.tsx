import { CaretDownOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Dropdown } from 'antd';
import { Fragment } from 'react';

import { S } from './styles';
import { BreadcrumbSegment } from './types';

interface Props {
    segments: BreadcrumbSegment[];
}

const ADD_ITEM_KEY = '__add__';

export function Breadcrumb(props: Props) {
    const { segments } = props;

    const last = segments[segments.length - 1];

    return (
        <S.Bar data-testid="breadcrumb">
            <S.Segments>
                {segments.map((segment, index) => {
                    const hasDropdown = segment.alternatives.length > 1 || !!segment.onAdd;

                    return (
                        <Fragment key={segment.key}>
                            {index > 0 && <S.Separator>/</S.Separator>}
                            {hasDropdown ? (
                                <Dropdown
                                    trigger={['click']}
                                    menu={{
                                        items: [
                                            ...segment.alternatives.map((alternative) => ({
                                                key: alternative.key,
                                                label: alternative.title,
                                            })),
                                            ...(segment.onAdd
                                                ? [
                                                      { type: 'divider' as const },
                                                      {
                                                          key: ADD_ITEM_KEY,
                                                          icon: <PlusOutlined />,
                                                          label: (
                                                              <span data-testid="add-another-answer-button">
                                                                  {segment.addLabel}
                                                              </span>
                                                          ),
                                                      },
                                                  ]
                                                : []),
                                        ],
                                        selectable: true,
                                        selectedKeys: segment.alternatives
                                            .filter((alternative) => alternative.isActive)
                                            .map((alternative) => alternative.key),
                                        onClick: ({ key }) => {
                                            if (key === ADD_ITEM_KEY) {
                                                segment.onAdd?.();
                                                return;
                                            }

                                            segment.alternatives
                                                .find((alternative) => alternative.key === key)
                                                ?.onSelect();
                                        },
                                    }}
                                >
                                    <S.Segment
                                        role="button"
                                        tabIndex={0}
                                        data-testid={`breadcrumb-segment-${segment.key}`}
                                    >
                                        {segment.title}
                                        {typeof segment.count === 'number' && <S.Count>({segment.count})</S.Count>}
                                        <CaretDownOutlined />
                                    </S.Segment>
                                </Dropdown>
                            ) : (
                                <S.StaticSegment data-testid={`breadcrumb-segment-${segment.key}`}>
                                    {segment.title}
                                    {typeof segment.count === 'number' && <S.Count>({segment.count})</S.Count>}
                                </S.StaticSegment>
                            )}
                        </Fragment>
                    );
                })}
            </S.Segments>
            {last?.onRemove ? (
                <Button
                    icon={<DeleteOutlined />}
                    type="default"
                    size="small"
                    onClick={last.onRemove}
                    data-testid="remove-group-button"
                />
            ) : null}
        </S.Bar>
    );
}
