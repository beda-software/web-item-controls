import { DeleteOutlined } from '@ant-design/icons';
import { t } from '@lingui/macro';
import { Button } from 'antd';
import { useState } from 'react';
import {
    FCEQuestionnaireItem,
    FormItems,
    GroupItemProps,
    QuestionItems,
    RepeatableFormGroupItems,
    getItemKey,
} from 'sdc-qrf';

import { useFieldController } from 'src/components/BaseQuestionnaireResponseForm/hooks';
import { Title } from 'src/components/Typography';
import { useRepeatableGroup } from 'src/controls/Group/RepeatableGroups/RepeatableGroupCard/hooks';

import { AnnotationImage } from './AnnotationImage';
import { S } from './styles';
import { getAnnotationDetailItems } from './utils';

interface AnnotationDetailsProps {
    index: number;
    items: FormItems[];
    onChange: (value: RepeatableFormGroupItems) => void;
    onRemoved: (index: number) => void;
    groupItem: GroupItemProps;
    detailItems: FCEQuestionnaireItem[];
}

function AnnotationDetails(props: AnnotationDetailsProps) {
    const { index, items, onChange, onRemoved, groupItem, detailItems } = props;
    const { text, readOnly } = groupItem.questionItem;
    const { onRemove, parentPath, context } = useRepeatableGroup({ index, items, onChange, groupItem });

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
                <QuestionItems questionItems={detailItems} parentPath={parentPath} context={context} />
            </S.DetailsItems>
        </>
    );
}

/**
 * Repeatable group rendered on top of an image (`backgroundImage` extension).
 * The image interaction and marker positions are handled by `AnnotationImage`;
 * the details of the currently selected annotation are shown next to it.
 */
export function ImageAnnotation(props: GroupItemProps) {
    const { parentPath, questionItem } = props;
    const { linkId, readOnly } = questionItem;

    const fieldName = [...parentPath, linkId];
    const { value, onChange } = useFieldController<RepeatableFormGroupItems>(fieldName, questionItem);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const detailItems = getAnnotationDetailItems(questionItem);
    if (!detailItems) {
        return null;
    }

    const items: FormItems[] = value?.items ?? [];
    const activeIndex = items[selectedIndex] ? selectedIndex : items.length - 1;

    const onAdd = (newItem: FormItems) => {
        onChange({ ...value, items: [...items, newItem] });
        setSelectedIndex(items.length);
    };

    return (
        <S.Container data-testid={linkId} data-linkid={linkId}>
            <S.ImagePane>
                <AnnotationImage
                    questionItem={questionItem}
                    items={items}
                    activeIndex={activeIndex}
                    onAdd={readOnly ? undefined : onAdd}
                    onSelect={setSelectedIndex}
                />
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
                        detailItems={detailItems}
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
