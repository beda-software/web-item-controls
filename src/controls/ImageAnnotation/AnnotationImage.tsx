import { t } from '@lingui/macro';
import { MouseEvent } from 'react';
import { getItemKey, populateItemKey } from 'sdc-qrf';

import { AnnotationImageProps } from 'src/contexts/image-annotation';

import { S } from './styles';
import { buildCoordinateAnswer, getAnnotationDetailItems, getCoordinate, getCoordinateItems, toPercent } from './utils';

/**
 * Image (`backgroundImage` of the group) with numbered markers positioned by x/y percentages
 * stored in the first two child items. Shared by the editable and readonly views.
 */
export function AnnotationImage(props: AnnotationImageProps) {
    const { questionItem, items, activeIndex, onAdd, onSelect } = props;
    const coordinateItems = getCoordinateItems(questionItem);

    if (!coordinateItems) {
        return null;
    }

    const [xItem, yItem] = coordinateItems;

    const onImageClick = (event: MouseEvent<HTMLDivElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        if (!onAdd || !rect.width || !rect.height) {
            return;
        }

        onAdd(
            populateItemKey({
                [xItem.linkId]: buildCoordinateAnswer(toPercent(event.clientX - rect.left, rect.width)),
                [yItem.linkId]: buildCoordinateAnswer(toPercent(event.clientY - rect.top, rect.height)),
            }),
        );
    };

    return (
        <>
            {onAdd ? <S.Hint>{t`Click on the diagram to place a marker`}</S.Hint> : null}
            <S.ImageWrapper
                $clickable={!!onAdd}
                onClick={onAdd ? onImageClick : undefined}
                data-testid="image-annotation-canvas"
            >
                {questionItem.backgroundImage?.url ? (
                    <S.Image src={questionItem.backgroundImage.url} alt={questionItem.text ?? ''} draggable={false} />
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
                            disabled={!onSelect}
                            $active={index === activeIndex}
                            style={{ left: `${x}%`, top: `${y}%` }}
                            onClick={(event) => {
                                event.stopPropagation();
                                onSelect?.(index);
                            }}
                            aria-label={`${t`Annotation`} ${index + 1}`}
                            data-testid={`annotation-marker-${index}`}
                        >
                            {index + 1}
                        </S.Marker>
                    );
                })}
            </S.ImageWrapper>
        </>
    );
}

AnnotationImage.getDetailItems = getAnnotationDetailItems;
