import { DeleteOutlined } from '@ant-design/icons';
import { t } from '@lingui/macro';
import { Button } from 'antd';
import _ from 'lodash';
import { MouseEvent, useState } from 'react';
import {
    FormAnswerItems,
    FormItems,
    GroupItemProps,
    QuestionItems,
    RepeatableFormGroupItems,
    getItemKey,
    populateItemKey,
} from 'sdc-qrf';

import { useFieldController } from 'src/components/BaseQuestionnaireResponseForm/hooks';
import { Title } from 'src/components/Typography';
import { useRepeatableGroup } from 'src/controls/Group/RepeatableGroups/RepeatableGroupCard/hooks';

import { S } from './styles';

const COORDINATES_PRECISION = 2;

function toPercent(value: number, total: number) {
    return _.round(_.clamp((value / total) * 100, 0, 100), COORDINATES_PRECISION);
}

function getCoordinate(item: FormItems | undefined, linkId: string): number | undefined {
    const value = (item?.[linkId] as FormAnswerItems[] | undefined)?.[0]?.value?.decimal;

    return _.isNumber(value) ? value : undefined;
}

function buildCoordinateAnswer(value: number) {
    return [{ value: { decimal: value } }];
}

interface AnnotationDetailsProps {
    index: number;
    items: FormItems[];
    onChange: (value: RepeatableFormGroupItems) => void;
    onRemoved: (index: number) => void;
    groupItem: GroupItemProps;
}

function AnnotationDetails(props: AnnotationDetailsProps) {
    const { index, items, onChange, onRemoved, groupItem } = props;
    const { text, readOnly, item } = groupItem.questionItem;
    const { onRemove, parentPath, context } = useRepeatableGroup({ index, items, onChange, groupItem });

    // The first two children hold the marker position, only the rest are edited by the user
    const annotationItems = (item ?? []).slice(2);

    return (
        <>
            <S.DetailsHeader>
                <Title level={5}>{`${text || t`Annotation`} ${index + 1}`}</Title>
                {readOnly ? null : (
                    <Button
                        icon={<DeleteOutlined />}
                        onClick={() => {
                            onRemove();
                            onRemoved(index);
                        }}
                        aria-label={t`Remove annotation`}
                        data-testid="remove-annotation-button"
                    />
                )}
            </S.DetailsHeader>
            <S.DetailsItems>
                <QuestionItems questionItems={annotationItems} parentPath={parentPath} context={context} />
            </S.DetailsItems>
        </>
    );
}

/**
 * Repeatable group rendered on top of an image (`backgroundImage` extension).
 * The first two children must be decimals: they store the marker position as a percentage
 * of the image width (x) and height (y). All the other children describe the annotation
 * and are shown for the currently selected marker only.
 */
export function ImageAnnotation(props: GroupItemProps) {
    const { parentPath, questionItem } = props;
    const { linkId, item, readOnly, backgroundImage } = questionItem;
    const [xItem, yItem] = item ?? [];

    const fieldName = [...parentPath, linkId];
    const { value, onChange } = useFieldController<RepeatableFormGroupItems>(fieldName, questionItem);
    const [selectedIndex, setSelectedIndex] = useState(0);

    if (!xItem || !yItem || xItem.type !== 'decimal' || yItem.type !== 'decimal') {
        console.warn(`ImageAnnotation (${linkId}): the first two child items must be of type decimal`);

        return null;
    }

    if (!questionItem.repeats) {
        console.warn(`ImageAnnotation (${linkId}): the group must be repeatable`);
    }

    const items: FormItems[] = value?.items ?? [];
    const activeIndex = items[selectedIndex] ? selectedIndex : items.length - 1;

    const onImageClick = (event: MouseEvent<HTMLDivElement>) => {
        if (readOnly) {
            return;
        }

        const rect = event.currentTarget.getBoundingClientRect();
        if (!rect.width || !rect.height) {
            return;
        }

        const newItem = populateItemKey({
            [xItem.linkId]: buildCoordinateAnswer(toPercent(event.clientX - rect.left, rect.width)),
            [yItem.linkId]: buildCoordinateAnswer(toPercent(event.clientY - rect.top, rect.height)),
        });

        onChange({ ...value, items: [...items, newItem] });
        setSelectedIndex(items.length);
    };

    return (
        <S.Container data-testid={linkId} data-linkid={linkId}>
            <S.ImagePane>
                {readOnly ? null : <S.Hint>{t`Click on the diagram to place a marker`}</S.Hint>}
                <S.ImageWrapper $clickable={!readOnly} onClick={onImageClick} data-testid="image-annotation-canvas">
                    {backgroundImage?.url ? (
                        <S.Image src={backgroundImage.url} alt={questionItem.text ?? ''} draggable={false} />
                    ) : null}
                    {items.map((annotation, index) => {
                        const x = getCoordinate(annotation, xItem.linkId);
                        const y = getCoordinate(annotation, yItem.linkId);

                        if (x === undefined || y === undefined) {
                            return null;
                        }

                        return (
                            <S.Marker
                                key={getItemKey(annotation)}
                                type="button"
                                $active={index === activeIndex}
                                style={{ left: `${x}%`, top: `${y}%` }}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setSelectedIndex(index);
                                }}
                                aria-label={`${t`Annotation`} ${index + 1}`}
                                data-testid={`annotation-marker-${index}`}
                            >
                                {index + 1}
                            </S.Marker>
                        );
                    })}
                </S.ImageWrapper>
            </S.ImagePane>
            <S.Details>
                {items[activeIndex] ? (
                    <AnnotationDetails
                        key={getItemKey(items[activeIndex])}
                        index={activeIndex}
                        items={items}
                        onChange={onChange}
                        onRemoved={(removedIndex) => setSelectedIndex(Math.max(0, removedIndex - 1))}
                        groupItem={props}
                    />
                ) : (
                    <S.Empty>
                        {readOnly ? t`No annotations` : t`Place a marker on the diagram to add an annotation`}
                    </S.Empty>
                )}
            </S.Details>
        </S.Container>
    );
}
