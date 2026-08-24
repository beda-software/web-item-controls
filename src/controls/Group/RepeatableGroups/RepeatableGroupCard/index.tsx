import { t } from '@lingui/macro';
import { QuestionItems } from 'sdc-qrf';

import { isGroupAddItemButtonHidden } from 'src/utils/questionnaire';

import { useRepeatableGroup } from './hooks';
import { GroupMainCard, GroupSubCard } from '../../GroupCard';
import { RepeatableGroupProps } from '../types';

interface Props extends RepeatableGroupProps {
    variant?: 'main-card' | 'sub-card';
}

export function RepeatableGroupCard(props: Props) {
    const { index, groupItem, variant } = props;
    const { questionItem } = groupItem;
    const { item, text, readOnly } = questionItem;

    const { onRemove, parentPath, context } = useRepeatableGroup(props);

    const title = `${text || t`Item`} ${index + 1}`;
    const removeHandler = isGroupAddItemButtonHidden(questionItem) ? undefined : onRemove;

    if (variant === 'sub-card') {
        return (
            <GroupSubCard title={title} onRemove={removeHandler} readOnly={readOnly}>
                <QuestionItems questionItems={item!} parentPath={parentPath} context={context} />
            </GroupSubCard>
        );
    }

    return (
        <GroupMainCard title={title} onRemove={removeHandler} readOnly={readOnly}>
            <QuestionItems questionItems={item!} parentPath={parentPath} context={context} />
        </GroupMainCard>
    );
}
