import { FCEQuestionnaireItem, FormAnswerItems, FormItems } from 'sdc-qrf';

/** The first child of a body annotation group is a choice holding the body site code of the annotation */
export function getBodySiteItem(questionItem: FCEQuestionnaireItem) {
    const [bodySiteItem] = questionItem.item ?? [];

    return bodySiteItem?.type === 'choice' ? bodySiteItem : undefined;
}

/**
 * Child items describing a body annotation, i.e. everything except the body site item.
 * Returns undefined when the group is misconfigured.
 */
export function getBodyAnnotationDetailItems(questionItem: FCEQuestionnaireItem): FCEQuestionnaireItem[] | undefined {
    const { linkId, item, repeats } = questionItem;

    if (!getBodySiteItem(questionItem)) {
        console.warn(`BodyAnnotationImage (${linkId}): the first child item must be of type choice`);

        return undefined;
    }

    if (!repeats) {
        console.warn(`BodyAnnotationImage (${linkId}): the group must be repeatable`);
    }

    return (item ?? []).slice(1);
}

export function getBodySiteCode(item: FormItems | undefined, linkId: string): string | undefined {
    return (item?.[linkId] as FormAnswerItems[] | undefined)?.[0]?.value?.Coding?.code;
}

export function buildBodySiteAnswer(code: string) {
    return [{ value: { Coding: { code } } }];
}
