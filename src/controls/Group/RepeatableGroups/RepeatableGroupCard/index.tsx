import { t } from '@lingui/macro';
import { QuestionItems } from 'sdc-qrf';

import { useRepeatableGroup } from './hooks';
import { BreadcrumbSegmentBoundary } from '../../BreadcrumbChain';
import { ChildGroupAccordionProvider } from '../../ChildGroupAccordionProvider';
import { GroupMainCard, GroupSubCard } from '../../GroupCard';
import { RepeatableGroupProps } from '../types';

interface Props extends RepeatableGroupProps {
    variant?: 'main-card' | 'sub-card';
}

export function RepeatableGroupCard(props: Props) {
    const { index, groupItem, variant, isOpen, alternatives, onAdd, addLabel } = props;
    const { questionItem } = groupItem;
    const { item, text, readOnly } = questionItem;

    const { onRemove, parentPath, context } = useRepeatableGroup(props);

    const title = `${text || t`Item`} ${index + 1}`;

    const content = (
        <ChildGroupAccordionProvider item={item}>
            <QuestionItems questionItems={item!} parentPath={parentPath} context={context} />
        </ChildGroupAccordionProvider>
    );

    if (!alternatives) {
        // Not part of an accordion chain - render as a normal, always-expanded card.
        const Card = variant === 'sub-card' ? GroupSubCard : GroupMainCard;

        return (
            <Card title={title} onRemove={onRemove} readOnly={readOnly}>
                {content}
            </Card>
        );
    }

    if (!isOpen) {
        return null;
    }

    return (
        <BreadcrumbSegmentBoundary
            segment={{
                key: alternatives[index]!.key,
                title,
                alternatives,
                onRemove: readOnly ? undefined : onRemove,
                onAdd,
                addLabel,
            }}
        >
            {content}
        </BreadcrumbSegmentBoundary>
    );
}
