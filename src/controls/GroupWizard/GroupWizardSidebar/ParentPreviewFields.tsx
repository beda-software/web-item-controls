import _ from 'lodash';
import { FCEQuestionnaireItem, FormAnswerItems, FormItems } from 'sdc-qrf';

import { getArrayDisplay } from 'src/utils/questionnaire';

import { S } from './styles';
import { SidebarMenuNode } from './types';

interface PreviewField {
    item: FCEQuestionnaireItem;
    path: string[];
}

function collectPreviewFields(items: FCEQuestionnaireItem[], path: string[]): PreviewField[] {
    return items.flatMap((item) => {
        if (item.type === 'group') {
            // group-voice (or any other stray group ending up in contentItems) is a structural wrapper here,
            // not a value of its own - descend into its own children the same way a plain, non-repeating
            // nested group is addressed elsewhere.
            return collectPreviewFields(
                (item.item ?? []).filter((child) => !child.hidden),
                [...path, item.linkId, 'items'],
            );
        }

        return [{ item, path }];
    });
}

interface ParentPreviewFieldsProps {
    ancestorNode: SidebarMenuNode;
    formValues: FormItems;
}

// A deliberately minimal, itemControl-agnostic renderer for the ancestor read-only preview: plain "label: value"
// text for every leaf field, computed straight from the live form value. No editable or readonly control
// registry is involved, so the preview can never end up interactive or duplicate a control's own presentation.
export function ParentPreviewFields(props: ParentPreviewFieldsProps) {
    const { ancestorNode, formValues } = props;
    const fields = collectPreviewFields(ancestorNode.contentItems, ancestorNode.path);

    return (
        <>
            {fields.map(({ item, path }) => {
                const fieldPath = [...path, item.linkId];
                const answer = _.get(formValues, fieldPath) as FormAnswerItems[] | undefined;
                const display = getArrayDisplay(answer);

                return (
                    <S.ParentPreviewField key={fieldPath.join('.')}>
                        <S.ParentPreviewFieldLabel>{item.text}</S.ParentPreviewFieldLabel>
                        <span>{display || '-'}</span>
                    </S.ParentPreviewField>
                );
            })}
        </>
    );
}
