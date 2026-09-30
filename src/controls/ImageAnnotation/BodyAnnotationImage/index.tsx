import { t } from '@lingui/macro';
import { Radio } from 'antd';
import { KeyboardEvent, useEffect, useState } from 'react';
import { populateItemKey } from 'sdc-qrf';

import { AnnotationImageProps } from 'src/contexts/image-annotation';

import { BODY_VIEW_BOX, BODY_VIEWS, BodyRegion, BodyView } from './body-regions';
import { getBodyRegionLabel } from './labels';
import { S } from './styles';
import { buildBodySiteAnswer, getBodyAnnotationDetailItems, getBodySiteCode, getBodySiteItem } from './utils';

const { width, height } = BODY_VIEW_BOX;

function findView(code: string | undefined): BodyView | undefined {
    return (['front', 'back'] as const).find((view) => BODY_VIEWS[view].regions.some((region) => region.code === code));
}

/**
 * Human body chart (front and back views) for the `image-annotation` control.
 * Every body region has a body site code: a click on a region adds an annotation that stores
 * the region code in the first child item (a choice bound to the body site value set).
 * A click on an annotated region selects its annotation instead.
 */
export function BodyAnnotationImage(props: AnnotationImageProps) {
    const { questionItem, items, activeIndex, onAdd, onSelect } = props;
    const bodySiteItem = getBodySiteItem(questionItem);
    const codes = items.map((item) => (bodySiteItem ? getBodySiteCode(item, bodySiteItem.linkId) : undefined));
    const activeCode = activeIndex === undefined ? undefined : codes[activeIndex];
    const [view, setView] = useState<BodyView>(() => findView(activeCode) ?? 'front');

    // Show the view the selected annotation belongs to
    useEffect(() => {
        const activeView = findView(activeCode);
        if (activeView && !BODY_VIEWS[view].regions.some((region) => region.code === activeCode)) {
            setView(activeView);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeCode]);

    if (!bodySiteItem) {
        return null;
    }

    const { regions, transform } = BODY_VIEWS[view];
    // Number of annotated regions in a view; regions coded the same in both views count in both
    const countAnnotations = (bodyView: BodyView) =>
        BODY_VIEWS[bodyView].regions.filter((region) => codes.includes(region.code)).length;

    const onRegionClick = (region: BodyRegion) => {
        const index = codes.indexOf(region.code);
        if (index !== -1) {
            onSelect?.(index);

            return;
        }

        onAdd?.(
            populateItemKey({
                [bodySiteItem.linkId]: buildBodySiteAnswer(region.code),
            }),
        );
    };

    const onRegionKeyDown = (event: KeyboardEvent<SVGGElement>, region: BodyRegion) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onRegionClick(region);
        }
    };

    // The patient's left side is on the right in the front view and on the left in the back view
    const [leftX, rightX] = view === 'front' ? [width - 24, 24] : [24, width - 24];

    return (
        <S.Container>
            <Radio.Group
                value={view}
                onChange={(event) => setView(event.target.value)}
                aria-label={t`Body view`}
                data-testid="body-view-select"
            >
                <Radio.Button value="front">{`${t`Front`} (${countAnnotations('front')})`}</Radio.Button>
                <Radio.Button value="back">{`${t`Back`} (${countAnnotations('back')})`}</Radio.Button>
            </Radio.Group>
            <S.Figure>
                <S.Svg
                    viewBox={`0 0 ${width} ${height}`}
                    role="group"
                    aria-label={questionItem.text}
                    data-testid="body-annotation-image"
                    data-view={view}
                >
                    <S.Side x={rightX} y={20} textAnchor="middle">{t`Right`}</S.Side>
                    <S.Side x={leftX} y={20} textAnchor="middle">{t`Left`}</S.Side>
                    <g transform={transform}>
                        {regions.map((region) => {
                            const index = codes.indexOf(region.code);
                            const selected = index !== -1;
                            const canClick = selected ? !!onSelect : !!onAdd;

                            return (
                                <S.Region
                                    key={region.key}
                                    $selected={selected}
                                    $active={selected && region.code === activeCode}
                                    $interactive={canClick}
                                    role={canClick ? 'button' : 'img'}
                                    tabIndex={canClick ? 0 : undefined}
                                    aria-label={getBodyRegionLabel(region.key)}
                                    aria-pressed={canClick ? selected : undefined}
                                    onClick={canClick ? () => onRegionClick(region) : undefined}
                                    onKeyDown={canClick ? (event) => onRegionKeyDown(event, region) : undefined}
                                    data-testid={`body-region-${region.code}`}
                                >
                                    <title>{getBodyRegionLabel(region.key)}</title>
                                    {region.paths.map((path) => (
                                        <path key={path} d={path} />
                                    ))}
                                </S.Region>
                            );
                        })}
                    </g>
                    {regions.map((region) => {
                        const index = codes.indexOf(region.code);

                        return index === -1 ? null : (
                            <S.Number
                                key={region.key}
                                x={region.label.x}
                                y={region.label.y}
                                textAnchor="middle"
                                dominantBaseline="central"
                            >
                                {index + 1}
                            </S.Number>
                        );
                    })}
                </S.Svg>
            </S.Figure>
        </S.Container>
    );
}

BodyAnnotationImage.getDetailItems = getBodyAnnotationDetailItems;
