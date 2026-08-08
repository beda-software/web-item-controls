import { DeleteOutlined } from '@ant-design/icons';
import { t, Trans } from '@lingui/macro';
import { Button } from 'antd';
import _ from 'lodash';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { GroupItemProps, QuestionItems } from 'sdc-qrf';

import { Title } from 'src/components/Typography';

import { S } from './styles';
import { useGroupSiblingAccordion } from '../accordionContext';
import { BreadcrumbSegmentBoundary } from '../BreadcrumbChain';
import { ChildGroupAccordionProvider } from '../ChildGroupAccordionProvider';
import { RepeatableGroups } from '../RepeatableGroups';
import { RepeatableGroupCard } from '../RepeatableGroups/RepeatableGroupCard';

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

    const renderRepeatable = () => {
        if (variant === 'sub-card') {
            return (
                <RepeatableGroups
                    groupItem={props}
                    renderGroup={(p) => <RepeatableGroupCard {...p} variant="sub-card" />}
                />
            );
        }

        return <RepeatableGroups groupItem={props} />;
    };

    if (accordion) {
        if (!accordion.isOpen) {
            return null;
        }

        const count = repeats
            ? (_.get(getValues(), [...parentPath, linkId, 'items']) as unknown[] | undefined)?.length ?? 0
            : undefined;

        // Already inside a breadcrumb chain - this group's title is carried by the
        // chain's combined header, so render its own repeat instances/content
        // directly instead of wrapping them in another card with its own header.
        return (
            <BreadcrumbSegmentBoundary
                segment={{ key: linkId, title: text, count, alternatives: accordion.alternatives }}
            >
                {repeats ? renderRepeatable() : renderCardContent()}
            </BreadcrumbSegmentBoundary>
        );
    }

    // TODO: display helpText
    if (repeats) {
        return renderRepeatable();
    }

    if (variant === 'sub-card') {
        return <GroupSubCard title={text}>{renderCardContent()}</GroupSubCard>;
    }

    return <GroupMainCard title={text}>{renderCardContent()}</GroupMainCard>;
}

interface CardProps {
    children: React.ReactNode;
    title?: React.ReactNode;
    onRemove?: () => void;
    readOnly?: boolean;
}

export function GroupMainCard(props: CardProps) {
    const { title = t`Group`, children, readOnly, onRemove: initialOnRemove } = props;

    const onRemove = readOnly ? undefined : initialOnRemove;

    return (
        <S.Card
            title={<Title level={4}>{title}</Title>}
            $variant={'main-card'}
            extra={
                onRemove ? (
                    <Button
                        type="default"
                        onClick={onRemove}
                        size="middle"
                        icon={<DeleteOutlined />}
                        data-testid="remove-group-button"
                    >
                        <span>
                            <Trans>Remove</Trans>
                        </span>
                    </Button>
                ) : null
            }
        >
            <S.GroupContent>{children}</S.GroupContent>
        </S.Card>
    );
}

export function GroupSubCard(props: CardProps) {
    const { title = t`Group`, children, readOnly, onRemove: initialOnRemove } = props;

    const onRemove = readOnly ? undefined : initialOnRemove;

    return (
        <S.Card
            title={<Title level={5}>{title}</Title>}
            $variant={'sub-card'}
            extra={
                onRemove ? <Button icon={<DeleteOutlined />} type="default" onClick={onRemove} size="middle" /> : null
            }
        >
            <S.GroupContent>{children}</S.GroupContent>
        </S.Card>
    );
}
