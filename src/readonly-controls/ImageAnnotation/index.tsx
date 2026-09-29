import { t } from '@lingui/macro';
import { FormItems, GroupItemProps, QuestionItems, RepeatableFormGroupItems, getItemKey } from 'sdc-qrf';

import { useFieldController } from 'src/components/BaseQuestionnaireResponseForm/hooks';
import { Title } from 'src/components/Typography';
import { AnnotationImage } from 'src/controls/ImageAnnotation/AnnotationImage';
import { S } from 'src/controls/ImageAnnotation/styles';

/** Readonly counterpart of the `image-annotation` control: image with markers and all the annotations listed. */
export function ImageAnnotation(props: GroupItemProps) {
    const { parentPath, questionItem, context } = props;
    const { linkId, item, text, hidden, backgroundImage } = questionItem;
    const [xItem, yItem] = item ?? [];

    const { value } = useFieldController<RepeatableFormGroupItems>([...parentPath, linkId], questionItem);
    const items: FormItems[] = value?.items ?? [];

    if (hidden || !xItem || !yItem) {
        return null;
    }

    const annotationItems = (item ?? []).slice(2);

    return (
        <S.Container data-testid={linkId} data-linkid={linkId}>
            <S.ImagePane>
                <AnnotationImage
                    imageUrl={backgroundImage?.url}
                    alt={text}
                    items={items}
                    xLinkId={xItem.linkId}
                    yLinkId={yItem.linkId}
                />
            </S.ImagePane>
            <S.Details>
                {items.length ? (
                    items.map((annotation, index) => (
                        <S.DetailsItems key={getItemKey(annotation)}>
                            <Title level={5}>{`${text || t`Annotation`} ${index + 1}`}</Title>
                            <QuestionItems
                                questionItems={annotationItems}
                                parentPath={[...parentPath, linkId, 'items', index.toString()]}
                                context={(context[index] ?? context[0])!}
                            />
                        </S.DetailsItems>
                    ))
                ) : (
                    <S.Empty>{t`No annotations`}</S.Empty>
                )}
            </S.Details>
        </S.Container>
    );
}
