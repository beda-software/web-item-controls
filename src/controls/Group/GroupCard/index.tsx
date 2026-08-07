import { CaretDownOutlined, DeleteOutlined } from '@ant-design/icons';
import { t, Trans } from '@lingui/macro';
import { Button } from 'antd';
import _ from 'lodash';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { GroupItemProps, QuestionItems } from 'sdc-qrf';

import { Title } from 'src/components/Typography';

import { S } from './styles';
import { useGroupSiblingAccordion } from '../accordionContext';
import { AccordionSection } from '../AccordionSection';
import { ChildGroupAccordionProvider } from '../ChildGroupAccordionProvider';
import { RepeatableGroups } from '../RepeatableGroups';
import { RepeatableGroupCard } from '../RepeatableGroups/RepeatableGroupCard';
import { useScrollIntoViewOnOpen } from '../useScrollIntoViewOnOpen';

interface GroupCardProps extends GroupItemProps {
    variant?: 'main-card' | 'sub-card';
}

export function GroupCard(props: GroupCardProps) {
    const { parentPath, questionItem, context, variant = 'main-card' } = props;
    const { linkId, item, repeats, text, hidden } = questionItem;

    const { getValues } = useFormContext();
    const accordion = useGroupSiblingAccordion(linkId);

    if (hidden) {
        return null;
    }

    const renderCardContent = () => {
        return (
            item && (
                <ChildGroupAccordionProvider item={item}>
                    <QuestionItems
                        questionItems={item}
                        parentPath={[...parentPath, linkId, 'items']}
                        context={context[0]!}
                    />
                </ChildGroupAccordionProvider>
            )
        );
    };

    // TODO: display helpText
    const renderContent = () => {
        if (repeats) {
            if (variant === 'sub-card') {
                return (
                    <RepeatableGroups
                        groupItem={props}
                        renderGroup={(p) => <RepeatableGroupCard {...p} variant="sub-card" />}
                    />
                );
            }

            return <RepeatableGroups groupItem={props} />;
        }

        if (variant === 'sub-card') {
            return <GroupSubCard title={text}>{renderCardContent()}</GroupSubCard>;
        }

        return <GroupMainCard title={text}>{renderCardContent()}</GroupMainCard>;
    };

    if (accordion) {
        const count = repeats
            ? (_.get(getValues(), [...parentPath, linkId, 'items']) as unknown[] | undefined)?.length ?? 0
            : undefined;

        return (
            <AccordionSection
                linkId={linkId}
                title={text}
                count={count}
                isOpen={accordion.isOpen}
                onToggle={accordion.onToggle}
            >
                {accordion.isOpen ? renderContent() : null}
            </AccordionSection>
        );
    }

    return renderContent();
}

interface CardProps {
    children: React.ReactNode;
    title?: React.ReactNode;
    onRemove?: () => void;
    readOnly?: boolean;
    isOpen?: boolean;
    onToggle?: () => void;
    highlightActive?: boolean;
}

function CollapsibleTitle(props: { title: React.ReactNode; level: 4 | 5; isOpen?: boolean; onToggle?: () => void }) {
    const { title, level, isOpen, onToggle } = props;

    if (!onToggle) {
        return <Title level={level}>{title}</Title>;
    }

    return (
        <S.CollapsibleTitle
            role="button"
            tabIndex={0}
            onClick={onToggle}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onToggle();
                }
            }}
        >
            <S.Caret $isOpen={!!isOpen}>
                <CaretDownOutlined />
            </S.Caret>
            <Title level={level}>{title}</Title>
        </S.CollapsibleTitle>
    );
}

export function GroupMainCard(props: CardProps) {
    const {
        title = t`Group`,
        children,
        readOnly,
        onRemove: initialOnRemove,
        isOpen,
        onToggle,
        highlightActive = true,
    } = props;

    const onRemove = readOnly ? undefined : initialOnRemove;
    const collapsible = !!onToggle;
    const cardRef = useScrollIntoViewOnOpen<HTMLDivElement>(isOpen);

    return (
        <S.Card
            ref={cardRef}
            title={<CollapsibleTitle title={title} level={4} isOpen={isOpen} onToggle={onToggle} />}
            $variant={'main-card'}
            $collapsible={collapsible}
            $isOpen={!!isOpen}
            $highlightActive={highlightActive}
            extra={
                onRemove ? (
                    <Button
                        type="default"
                        onClick={onRemove}
                        size="middle"
                        icon={<DeleteOutlined />}
                        data-testid="remove-group-button"
                    >
                        {collapsible ? null : (
                            <span>
                                <Trans>Remove</Trans>
                            </span>
                        )}
                    </Button>
                ) : null
            }
        >
            {collapsible && !isOpen ? null : <S.GroupContent>{children}</S.GroupContent>}
        </S.Card>
    );
}

export function GroupSubCard(props: CardProps) {
    const {
        title = t`Group`,
        children,
        readOnly,
        onRemove: initialOnRemove,
        isOpen,
        onToggle,
        highlightActive = true,
    } = props;

    const onRemove = readOnly ? undefined : initialOnRemove;
    const collapsible = !!onToggle;
    const cardRef = useScrollIntoViewOnOpen<HTMLDivElement>(isOpen);

    return (
        <S.Card
            ref={cardRef}
            title={<CollapsibleTitle title={title} level={5} isOpen={isOpen} onToggle={onToggle} />}
            $variant={'sub-card'}
            $collapsible={collapsible}
            $isOpen={!!isOpen}
            $highlightActive={highlightActive}
            extra={
                onRemove ? <Button icon={<DeleteOutlined />} type="default" onClick={onRemove} size="middle" /> : null
            }
        >
            {collapsible && !isOpen ? null : <S.GroupContent>{children}</S.GroupContent>}
        </S.Card>
    );
}
