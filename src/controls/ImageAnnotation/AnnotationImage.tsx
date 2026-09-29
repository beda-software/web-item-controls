import { t } from '@lingui/macro';
import { MouseEvent } from 'react';
import { FormItems, getItemKey } from 'sdc-qrf';

import { S } from './styles';
import { getCoordinate } from './utils';

interface AnnotationImageProps {
    imageUrl?: string;
    alt?: string;
    items: FormItems[];
    xLinkId: string;
    yLinkId: string;
    activeIndex?: number;
    onImageClick?: (event: MouseEvent<HTMLDivElement>) => void;
    onMarkerClick?: (index: number) => void;
}

/** Image with numbered markers positioned by x/y percentages. Shared by the editable and readonly views. */
export function AnnotationImage(props: AnnotationImageProps) {
    const { imageUrl, alt, items, xLinkId, yLinkId, activeIndex, onImageClick, onMarkerClick } = props;

    return (
        <S.ImageWrapper $clickable={!!onImageClick} onClick={onImageClick} data-testid="image-annotation-canvas">
            {imageUrl ? <S.Image src={imageUrl} alt={alt ?? ''} draggable={false} /> : null}
            {items.map((annotation, index) => {
                const x = getCoordinate(annotation, xLinkId);
                const y = getCoordinate(annotation, yLinkId);

                if (x === undefined || y === undefined) {
                    return null;
                }

                return (
                    <S.Marker
                        key={getItemKey(annotation)}
                        type="button"
                        disabled={!onMarkerClick}
                        $active={index === activeIndex}
                        style={{ left: `${x}%`, top: `${y}%` }}
                        onClick={(event) => {
                            event.stopPropagation();
                            onMarkerClick?.(index);
                        }}
                        aria-label={`${t`Annotation`} ${index + 1}`}
                        data-testid={`annotation-marker-${index}`}
                    >
                        {index + 1}
                    </S.Marker>
                );
            })}
        </S.ImageWrapper>
    );
}
