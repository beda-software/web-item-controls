import classNames from 'classnames';
import { useFormContext } from 'react-hook-form';
import { GroupItemProps } from 'sdc-qrf';

import { ItemHelpText } from 'src/components/BaseQuestionnaireResponseForm/ItemHelpText';
import { Title } from 'src/components/Typography';

import { getCandidateItemCount, unwrapVoiceGroup, useGroupSiblingAccordion } from './accordionContext';
import { BreadcrumbSegmentBoundary } from './BreadcrumbChain';
import { ChildGroupAccordionProvider } from './ChildGroupAccordionProvider';
import { GroupContext, GroupContextProps } from './context';
import { GridGroup } from './GridGroup';
import s from './group.module.scss';
import { GroupCard } from './GroupCard';
import { GroupChildren } from './GroupChildren';
import { GTable } from './GTable';
import { RepeatableGroupRow, RepeatableGroups } from './RepeatableGroups';
import { S } from './styles';

function FlexContent(props: GroupItemProps & { type?: GroupContextProps['type'] }) {
    const { parentPath, questionItem, context, type = 'col' } = props;
    const { linkId, item, repeats, text, helpText } = questionItem;

    const renderRepeatableGroup = () => {
        if (type === 'gtable') {
            return <GTable groupItem={props} />;
        }

        if (type === 'row') {
            return <RepeatableGroups groupItem={props} renderGroup={(p) => <RepeatableGroupRow {...p} />} />;
        }

        return <RepeatableGroups groupItem={props} />;
    };

    if (type === 'grid') {
        return <GridGroup groupItem={props} />;
    }

    if (repeats) {
        return <GroupContext.Provider value={{ type }}>{renderRepeatableGroup()}</GroupContext.Provider>;
    }

    const isSection = type === 'section' || type === 'section-with-divider';

    return (
        <S.Group>
            {text || helpText ? (
                <S.Header $type={type}>
                    <S.Title>
                        {text && <Title level={isSection ? 4 : 5}>{text}</Title>}
                        {helpText && <ItemHelpText helpText={helpText} />}
                    </S.Title>
                </S.Header>
            ) : null}
            {item && (
                <div
                    className={classNames({
                        [s.row as string]: type === 'row',
                        [s.col as string]: !type || type === 'col',
                    })}
                >
                    <ChildGroupAccordionProvider
                        item={item}
                        groupLinkId={linkId}
                        parentPath={[...parentPath, linkId, 'items']}
                    >
                        <GroupChildren
                            item={item}
                            parentPath={[...parentPath, linkId, 'items']}
                            context={context[0]!}
                        />
                    </ChildGroupAccordionProvider>
                </div>
            )}
        </S.Group>
    );
}

// A group only becomes an accordion sibling when its parent has multiple nested
// groups, at least one repeatable (see accordionContext.tsx). Everywhere else this
// is a no-op and Flex renders exactly as it always has.
function Flex(props: GroupItemProps & { type?: GroupContextProps['type'] }) {
    const { parentPath, questionItem } = props;
    const { linkId, text, hidden } = questionItem;

    const { getValues } = useFormContext();
    const accordion = useGroupSiblingAccordion(linkId, parentPath);

    if (hidden) {
        return null;
    }

    if (accordion) {
        if (!accordion.isOpen && !accordion.isAnchor) {
            return null;
        }

        const wrapped = unwrapVoiceGroup(questionItem);
        const count = getCandidateItemCount(questionItem, parentPath, getValues());

        return (
            <BreadcrumbSegmentBoundary
                segment={{
                    key: linkId,
                    title: text ?? wrapped.text,
                    count,
                    alternatives: accordion.alternatives,
                    lockedHint: accordion.lockedHint,
                }}
            >
                {accordion.isOpen ? <FlexContent {...props} /> : null}
            </BreadcrumbSegmentBoundary>
        );
    }

    return <FlexContent {...props} />;
}

export function Group(props: GroupItemProps) {
    return <Flex {...props} />;
}

export function Col(props: GroupItemProps) {
    return <Flex {...props} type="col" />;
}

export function Row(props: GroupItemProps) {
    return <Flex {...props} type="row" />;
}

export function Gtable(props: GroupItemProps) {
    return <Flex {...props} type="gtable" />;
}

export function Grid(props: GroupItemProps) {
    return <Flex {...props} type="grid" />;
}

export function Section(props: GroupItemProps) {
    return <Flex {...props} type="section" />;
}

export function SectionWithDivider(props: GroupItemProps) {
    return <Flex {...props} type="section-with-divider" />;
}

export function MainCard(props: GroupItemProps) {
    return <GroupCard {...props} variant="main-card" />;
}

export function SubCard(props: GroupItemProps) {
    return <GroupCard {...props} variant="sub-card" />;
}
