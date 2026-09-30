import _ from 'lodash';
import { FCEQuestionnaireItem, FormAnswerItems, FormItems } from 'sdc-qrf';

const COORDINATES_PRECISION = 2;

export function getCoordinate(item: FormItems | undefined, linkId: string): number | undefined {
    const value = (item?.[linkId] as FormAnswerItems[] | undefined)?.[0]?.value?.decimal;

    return _.isNumber(value) ? value : undefined;
}

export function toPercent(value: number, total: number) {
    return _.round(_.clamp((value / total) * 100, 0, 100), COORDINATES_PRECISION);
}

export function buildCoordinateAnswer(value: number) {
    return [{ value: { decimal: value } }];
}

/** The first two children of an image annotation group are decimals holding the marker position (x, y) */
export function getCoordinateItems(questionItem: FCEQuestionnaireItem) {
    const [xItem, yItem] = questionItem.item ?? [];

    if (!xItem || !yItem || xItem.type !== 'decimal' || yItem.type !== 'decimal') {
        return undefined;
    }

    return [xItem, yItem] as const;
}

/**
 * Child items describing an annotation, i.e. everything except the coordinate items.
 * Returns undefined when the group is misconfigured.
 */
export function getAnnotationDetailItems(questionItem: FCEQuestionnaireItem): FCEQuestionnaireItem[] | undefined {
    const { linkId, item, repeats } = questionItem;

    if (!getCoordinateItems(questionItem)) {
        console.warn(`ImageAnnotation (${linkId}): the first two child items must be of type decimal`);

        return undefined;
    }

    if (!repeats) {
        console.warn(`ImageAnnotation (${linkId}): the group must be repeatable`);
    }

    return (item ?? []).slice(2);
}
