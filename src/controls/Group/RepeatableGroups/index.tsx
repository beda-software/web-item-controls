import { PlusOutlined } from '@ant-design/icons';
import { Trans } from '@lingui/macro';
import { Button } from 'antd';
import _ from 'lodash';
import React, { ReactNode, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { GroupItemProps, RepeatableFormGroupItems, getItemKey, populateItemKey } from 'sdc-qrf';

import { useFieldController } from 'src/components/BaseQuestionnaireResponseForm/hooks';

import { useGroupAccordionMode } from '../accordionContext';
import { RepeatableGroupCard } from './RepeatableGroupCard';
import { RepeatableGroupRow } from './RepeatableGroupRow';
import { S } from './styles';
import { RepeatableGroupProps } from './types';

export { RepeatableGroupCard, RepeatableGroupRow };

interface RepeatableGroupsProps {
    groupItem: GroupItemProps;
    renderGroup?: (props: RepeatableGroupProps) => ReactNode;
    buildValue?: (existingItems: Array<any>) => any;
}

function defaultBuildValue(exisingItems: Array<any>) {
    return [...exisingItems, {}];
}

export function RepeatableGroups(props: RepeatableGroupsProps) {
    const { groupItem, renderGroup, buildValue = defaultBuildValue } = props;
    const { parentPath, questionItem } = groupItem;
    const { linkId, text } = questionItem;

    const fieldName = [...parentPath, linkId];

    const { onChange } = useFieldController<RepeatableFormGroupItems>(fieldName, questionItem);

    const { getValues } = useFormContext();

    const value = _.get(getValues(), fieldName);

    const populateValue = (exisingItems: Array<any>) => (buildValue(exisingItems) || []).map(populateItemKey);

    const items = value?.items || [];

    // Only enabled when a qualifying ancestor group turned this subtree into an
    // accordion (see accordionContext.tsx) - otherwise every item stays expanded,
    // exactly as before.
    const accordionMode = useGroupAccordionMode();
    const [openKey, setOpenKey] = useState<string | null>(() =>
        accordionMode && items.length ? getItemKey(items[items.length - 1]) : null,
    );
    const resolvedOpenKey =
        accordionMode && items.length
            ? _.some(items, (existingItem) => getItemKey(existingItem) === openKey)
                ? openKey
                : getItemKey(items[items.length - 1])
            : null;

    return (
        <S.Group>
            {_.map(items, (item, index: number) => {
                if (!items[index]) {
                    return null;
                }

                const key = getItemKey(item);
                const isOpen = accordionMode ? key === resolvedOpenKey : undefined;
                const onToggle = accordionMode
                    ? () => setOpenKey((current) => (current === key ? null : key))
                    : undefined;

                return renderGroup ? (
                    <React.Fragment key={key}>
                        {renderGroup({
                            index,
                            items,
                            onChange,
                            groupItem,
                            isOpen,
                            onToggle,
                        })}
                    </React.Fragment>
                ) : (
                    <RepeatableGroupCard
                        key={key}
                        index={index}
                        items={items}
                        onChange={onChange}
                        groupItem={groupItem}
                        variant="main-card"
                        isOpen={isOpen}
                        onToggle={onToggle}
                    />
                );
            })}
            {groupItem.questionItem.readOnly ? null : (
                <S.Footer>
                    <Button
                        icon={<PlusOutlined />}
                        type="primary"
                        ghost
                        onClick={() => {
                            const newItems = populateValue(items ?? []);
                            const updatedInput = { ...value, items: newItems };
                            onChange(updatedInput);

                            if (accordionMode && newItems.length) {
                                setOpenKey(getItemKey(newItems[newItems.length - 1]));
                            }
                        }}
                        size="middle"
                        data-testid="add-another-answer-button"
                    >
                        <span>{text ? <Trans>Add {text}</Trans> : <Trans>Add another answer</Trans>}</span>
                    </Button>
                </S.Footer>
            )}
        </S.Group>
    );
}
