import _ from 'lodash';
import { useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { FormItems, GroupItemProps, RepeatableFormGroupItems, getItemKey, populateItemKey } from 'sdc-qrf';

import { useFieldController } from 'src/components/BaseQuestionnaireResponseForm/hooks';

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

    return {
        readOnly: !!readOnly,
        items,
        currentIndex,
        setCurrentIndex,
        onAdd,
        onRemove,
        getKey: getItemKey,
    };
}
