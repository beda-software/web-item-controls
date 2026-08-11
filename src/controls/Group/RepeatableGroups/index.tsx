import { PlusOutlined } from '@ant-design/icons';
import { Trans, t } from '@lingui/macro';
import { Button, Modal } from 'antd';
import _ from 'lodash';
import React, { ReactNode, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { GroupItemProps, RepeatableFormGroupItems, getItemKey, populateItemKey } from 'sdc-qrf';

import { useFieldController } from 'src/components/BaseQuestionnaireResponseForm/hooks';
import { GroupWizardBus } from 'src/controls/GroupWizard';
import { isGroupAddItemButtonHidden } from 'src/utils/questionnaire';

import {
    GroupAccordionAlternative,
    getAccordionSiblingCandidates,
    qualifiesForAccordion,
    useGroupAccordionMode,
} from '../accordionContext';
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

    const { getValues, control } = useFormContext();

    const { remove } = useFieldArray({ control, name: [...parentPath, linkId, 'items'].join('.') });

    const value = _.get(getValues(), fieldName);

    const populateValue = (exisingItems: Array<any>) => (buildValue(exisingItems) || []).map(populateItemKey);

    const items = value?.items || [];

    // Enabled either because a qualifying ancestor group turned this subtree into an
    // accordion (see accordionContext.tsx), or because this group's own content
    // already qualifies on its own - e.g. "Goals and Tasks" is the sole child of its
    // parent (so no sibling ever turns it into an accordion from above), but each of
    // its own instances contains multiple nested groups, one repeatable, which is
    // exactly the condition that makes a group's own instances collapse. Otherwise
    // every item stays expanded, exactly as before this feature existed.
    // GroupWizardBus navigation/removal is only meaningful once there's a single
    // "current" item, so it's a no-op outside this mode too.
    const ambientAccordionMode = useGroupAccordionMode();
    const selfQualifiesForAccordion = qualifiesForAccordion(getAccordionSiblingCandidates(questionItem.item));
    const accordionMode = ambientAccordionMode || selfQualifiesForAccordion;

    const [openKey, setOpenKey] = useState<string | null>(() =>
        accordionMode && items.length ? getItemKey(items[items.length - 1]) : null,
    );
    const resolvedOpenKey =
        accordionMode && items.length
            ? _.some(items, (existingItem) => getItemKey(existingItem) === openKey)
                ? openKey
                : getItemKey(items[items.length - 1])
            : null;

    const [modal, modalContextHolder] = Modal.useModal();

    const performAddItem = () => {
        const newItems = populateValue(items ?? []);
        onChange({ ...value, items: newItems });

        if (accordionMode && newItems.length) {
            setOpenKey(getItemKey(newItems[newItems.length - 1]));
        }
    };

    const openItemAt = (offset: 1 | -1) => {
        if (!accordionMode) {
            return;
        }

        const currentIndex = _.map(items, getItemKey).indexOf(resolvedOpenKey);
        const nextIndex = currentIndex + offset;

        if (nextIndex < 0 || nextIndex >= items.length) {
            return;
        }

        setOpenKey(getItemKey(items[nextIndex]));
    };

    const removeOpenItem = () => {
        const targetIndex = _.map(items, getItemKey).indexOf(resolvedOpenKey);

        if (targetIndex === -1) {
            return;
        }

        remove(targetIndex);
        onChange({
            ...value,
            items: [...items.slice(0, targetIndex), ...items.slice(targetIndex + 1)],
        });
    };

    // GroupWizardBus lets external controls (e.g. a voice assistant) add, navigate
    // between, or remove items of this repeatable group by linkId. Every handler
    // also re-dispatches 'expandGroup' for this group so any collapsed ancestor
    // accordion opens up to reveal it - see ChildGroupAccordionProvider.tsx.
    GroupWizardBus.useBus(
        'addItem',
        ({ groupLinkId }) => {
            if (groupLinkId !== linkId) {
                return;
            }

            GroupWizardBus.dispatch({ type: 'expandGroup', groupLinkId: linkId });
            performAddItem();
        },
        [linkId, items, value, onChange, accordionMode],
    );

    GroupWizardBus.useBus(
        'openNextItem',
        ({ groupLinkId }) => {
            if (groupLinkId !== linkId) {
                return;
            }

            GroupWizardBus.dispatch({ type: 'expandGroup', groupLinkId: linkId });
            openItemAt(1);
        },
        [linkId, items, resolvedOpenKey],
    );

    GroupWizardBus.useBus(
        'openPreviousItem',
        ({ groupLinkId }) => {
            if (groupLinkId !== linkId) {
                return;
            }

            GroupWizardBus.dispatch({ type: 'expandGroup', groupLinkId: linkId });
            openItemAt(-1);
        },
        [linkId, items, resolvedOpenKey],
    );

    GroupWizardBus.useBus(
        'removeItem',
        ({ groupLinkId }) => {
            // Outside accordion mode there's no single "current" item to remove.
            if (groupLinkId !== linkId || !accordionMode) {
                return;
            }

            GroupWizardBus.dispatch({ type: 'expandGroup', groupLinkId: linkId });

            modal.confirm({
                title: t`Are you sure you want to delete this item?`,
                okText: t`Delete`,
                okButtonProps: { danger: true },
                cancelText: t`Cancel`,
                onOk: removeOpenItem,
            });
        },
        [linkId, accordionMode, items, resolvedOpenKey, value, onChange, modal],
    );

    // One breadcrumb alternative per item, shared across every card so each active
    // card's segment can offer the full list to switch between - see
    // RepeatableGroupCard.
    const alternatives: GroupAccordionAlternative[] = accordionMode
        ? _.map(items, (item, index: number) => {
              const key = getItemKey(item);

              return {
                  key,
                  title: `${text || t`Item`} ${index + 1}`,
                  isActive: key === resolvedOpenKey,
                  onSelect: () => setOpenKey(key),
              };
          })
        : [];

    const addLabel = text ? <Trans>Add {text}</Trans> : <Trans>Add another answer</Trans>;
    const readOnly = groupItem.questionItem.readOnly;
    const hideAddButton = readOnly || isGroupAddItemButtonHidden(groupItem.questionItem);

    return (
        <>
            {modalContextHolder}
            <S.Group>
                {_.map(items, (item, index: number) => {
                    if (!items[index]) {
                        return null;
                    }

                    const key = getItemKey(item);
                    const isOpen = accordionMode ? key === resolvedOpenKey : undefined;

                    return renderGroup ? (
                        <React.Fragment key={key}>
                            {renderGroup({
                                index,
                                items,
                                onChange,
                                groupItem,
                                isOpen,
                                alternatives: accordionMode ? alternatives : undefined,
                                onAdd: accordionMode && !hideAddButton ? performAddItem : undefined,
                                addLabel,
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
                            alternatives={accordionMode ? alternatives : undefined}
                            onAdd={accordionMode && !hideAddButton ? performAddItem : undefined}
                            addLabel={addLabel}
                        />
                    );
                })}
                {/* In accordion mode, adding a new item is offered as the last entry
                    of the active item's breadcrumb dropdown instead of here - except
                    with zero items, where there's no active card to host that dropdown. */}
                {(!accordionMode || items.length === 0) && !hideAddButton ? (
                    <S.Footer>
                        <Button
                            icon={<PlusOutlined />}
                            type="primary"
                            ghost
                            onClick={performAddItem}
                            size="middle"
                            data-testid="add-another-answer-button"
                        >
                            <span>{addLabel}</span>
                        </Button>
                    </S.Footer>
                ) : null}
            </S.Group>
        </>
    );
}
