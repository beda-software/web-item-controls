import { DeleteOutlined, LeftOutlined, PlusOutlined, RightOutlined } from '@ant-design/icons';
import { t, Trans } from '@lingui/macro';
import { Alert, Button } from 'antd';
import { GroupItemProps, QuestionItems } from 'sdc-qrf';

import { ItemHelpText } from 'src/components/BaseQuestionnaireResponseForm/ItemHelpText';
import { Text, Title } from 'src/components/Typography';

import { useGroupSlider } from './hooks';
import { S } from './styles';

export { useGroupSlider } from './hooks';

export function GroupSlider(props: GroupItemProps) {
    const { parentPath, questionItem, context } = props;
    const { linkId, text, helpText, hidden, repeats, item } = questionItem;

    const { readOnly, items, currentIndex, onAdd, onRemove, goLeft, goRight, getKey } = useGroupSlider(props);

    if (hidden) {
        return null;
    }

    if (!repeats) {
        return <Alert type="error" message={t`The group-slider itemControl is designed for repeatable groups`} />;
    }

    const itemsCount = items.length;
    const currentItem = items[currentIndex];
    const itemContext = context[currentIndex] ?? context[0]!;
    const itemParentPath = [...parentPath, linkId, 'items', currentIndex.toString()];

    return (
        <S.Group>
            {text || helpText ? (
                <S.Header>
                    {text && <Title level={5}>{text}</Title>}
                    {helpText && <ItemHelpText helpText={helpText} />}
                </S.Header>
            ) : null}

            {itemsCount === 0 ? (
                <Text data-testid="group-slider-empty">
                    <Trans>No items yet</Trans>
                </Text>
            ) : (
                <S.Slide data-testid={`group-slider-item-${currentIndex}`} key={getKey(currentItem!)}>
                    <QuestionItems questionItems={item!} parentPath={itemParentPath} context={itemContext} />
                </S.Slide>
            )}

            <S.Footer>
                <S.Nav>
                    <Button
                        disabled={currentIndex <= 0}
                        onClick={goLeft}
                        icon={<LeftOutlined />}
                        data-testid="group-slider-prev-button"
                    />
                    <Text data-testid="group-slider-position">
                        {itemsCount === 0 ? t`0 of 0` : `${currentIndex + 1} of ${itemsCount}`}
                    </Text>
                    <Button
                        disabled={currentIndex >= itemsCount - 1}
                        onClick={goRight}
                        icon={<RightOutlined />}
                        data-testid="group-slider-next-button"
                    />
                </S.Nav>

                {readOnly ? null : (
                    <S.Actions>
                        {itemsCount > 0 ? (
                            <Button
                                icon={<DeleteOutlined />}
                                onClick={() => onRemove(currentIndex)}
                                data-testid="group-slider-remove-button"
                            >
                                <span>
                                    <Trans>Remove</Trans>
                                </span>
                            </Button>
                        ) : null}
                        <Button
                            type="primary"
                            ghost
                            icon={<PlusOutlined />}
                            onClick={onAdd}
                            data-testid="group-slider-add-button"
                        >
                            <span>{text ? <Trans>Add {text}</Trans> : <Trans>Add another answer</Trans>}</span>
                        </Button>
                    </S.Actions>
                )}
            </S.Footer>
        </S.Group>
    );
}
