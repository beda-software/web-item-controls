import _ from 'lodash';
import { useFormContext, useFieldArray } from 'react-hook-form';

import { RepeatableGroupProps } from '../types';

export function useRepeatableGroup(props: RepeatableGroupProps) {
    const { index, items, onChange, groupItem } = props;
    const { parentPath, questionItem, context } = groupItem;
    const { linkId } = questionItem;

    const { control } = useFormContext();

    const fieldArrayName = [...parentPath, linkId, 'items'].join('.');

    const { remove } = useFieldArray({
        control,
        name: fieldArrayName,
    });

    const onRemove = () => {
        remove(index);
        const filteredArray = _.filter(items, (_val, valIndex: number) => valIndex !== index);
        onChange({
            items: [...filteredArray],
        });
    };

    if (!context[index]) {
        // TODO: it should be impossible, but to be backward compatible - let's see how it works in real life
        console.error(
            '[SDC-QRF] Failed to get context for item index=',
            index,
            'linkid=',
            linkId,
            JSON.stringify(context),
        );
    }

    return {
        onRemove,
        parentPath: [...parentPath, linkId, 'items', index.toString()],
        context: (context[index] ?? context[0])!,
    };
}
