import { t } from '@lingui/macro';
import { QuestionItems } from 'sdc-qrf';

import { useRepeatableGroup } from './hooks';
import { getAccordionSiblingCandidates, qualifiesForAccordion } from '../../accordionContext';
import { ChildGroupAccordionProvider } from '../../ChildGroupAccordionProvider';
import { GroupMainCard, GroupSubCard } from '../../GroupCard';
import { RepeatableGroupProps } from '../types';

interface Props extends RepeatableGroupProps {
    variant?: 'main-card' | 'sub-card';
}

export function RepeatableGroupCard(props: Props) {
    const { index, groupItem, variant, isOpen, onToggle } = props;
    const { questionItem } = groupItem;
    const { item, text, readOnly } = questionItem;

    const { onRemove, parentPath, context } = useRepeatableGroup(props);

    const title = `${text || t`Item`} ${index + 1}`;

    // When this instance's own content gates a further nested accordion (e.g. it
    // contains its own repeatable sibling groups), defer the "active" highlight to
    // that inner level instead of also spotlighting this outer card - otherwise the
    // active path lights up at every nesting level instead of just the deepest one.
    const highlightActive = !qualifiesForAccordion(getAccordionSiblingCandidates(item));

    const content = (
        <ChildGroupAccordionProvider item={item}>
            <QuestionItems questionItems={item!} parentPath={parentPath} context={context} />
        </ChildGroupAccordionProvider>
    );

    if (variant === 'sub-card') {
        return (
            <GroupSubCard
                title={title}
                onRemove={onRemove}
                readOnly={readOnly}
                isOpen={isOpen}
                onToggle={onToggle}
                highlightActive={highlightActive}
            >
                {content}
            </GroupSubCard>
        );
    }

    return (
        <GroupMainCard
            title={title}
            onRemove={onRemove}
            readOnly={readOnly}
            isOpen={isOpen}
            onToggle={onToggle}
            highlightActive={highlightActive}
        >
            {content}
        </GroupMainCard>
    );
}
