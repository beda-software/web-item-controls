import _ from 'lodash';
import { useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { FormItems, GroupItemProps, RepeatableFormGroupItems, getItemKey, populateItemKey } from 'sdc-qrf';

import { useFieldController } from 'src/components/BaseQuestionnaireResponseForm/hooks';
import { GroupWizardBus } from 'src/controls/GroupWizard';

export function useGroupSlider(props: GroupItemProps) {
    const { parentPath, questionItem } = props;
    const { linkId, readOnly } = questionItem;

    const fieldName = [...parentPath, linkId];

    const { onChange } = useFieldController<RepeatableFormGroupItems>(fieldName, questionItem);

    const { control, getValues } = useFormContext<FormItems>();

    const value = _.get(getValues(), fieldName);
    const items: FormItems[] = value?.items || [];

    const fieldArrayName = [...parentPath, linkId, 'items'].join('.');
    const { remove } = useFieldArray({ control, name: fieldArrayName });

    const [rawIndex, setCurrentIndex] = useState(0);
    const currentIndex = Math.min(rawIndex, Math.max(items.length - 1, 0));

    const onAdd = () => {
        const updatedItems = [...items, {}].map(populateItemKey);
        onChange({ ...value, items: updatedItems });
        setCurrentIndex(updatedItems.length - 1);
    };

    const onRemove = (index: number) => {
        remove(index);
        const filteredItems = items.filter((_item, itemIndex) => itemIndex !== index);
        onChange({ ...value, items: filteredItems });
        setCurrentIndex((current) => Math.min(current, Math.max(filteredItems.length - 1, 0)));
    };

    const goLeft = () => setCurrentIndex((index) => Math.max(index - 1, 0));
    const goRight = () => setCurrentIndex((index) => Math.min(index + 1, Math.max(items.length - 1, 0)));

    GroupWizardBus.useBus(
        'addItem',
        ({ groupLinkId }) => {
            if (groupLinkId === linkId) {
                onAdd();
            }
        },
        [linkId, items],
    );

    GroupWizardBus.useBus(
        'removeItem',
        ({ groupLinkId, index }) => {
            if (groupLinkId === linkId) {
                onRemove(index ?? currentIndex);
            }
        },
        [linkId, items, currentIndex],
    );

    GroupWizardBus.useBus(
        'openLeft',
        ({ groupLinkId }) => {
            if (groupLinkId === linkId) {
                goLeft();
            }
        },
        [linkId],
    );

    GroupWizardBus.useBus(
        'openRight',
        ({ groupLinkId }) => {
            if (groupLinkId === linkId) {
                goRight();
            }
        },
        [linkId, items.length],
    );

    return {
        readOnly: !!readOnly,
        items,
        currentIndex,
        setCurrentIndex,
        onAdd,
        onRemove,
        goLeft,
        goRight,
        getKey: getItemKey,
    };
}
