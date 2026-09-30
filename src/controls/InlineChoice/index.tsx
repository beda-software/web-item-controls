import { Checkbox, Form, Radio, Space } from 'antd';
import { QuestionnaireItemAnswerOption } from 'fhir/r4b';
import _ from 'lodash';
import { FormAnswerItems, QuestionItemProps, toAnswerValue } from 'sdc-qrf';

import { useFieldController } from 'src/components/BaseQuestionnaireResponseForm/hooks';
import { getDisplay } from 'src/utils/questionnaire';

import { S } from './styles';
import { getAnswerOptionBackgroundImage } from './utils';

export function InlineChoice(props: QuestionItemProps) {
    const { parentPath, questionItem } = props;
    const {
        linkId,
        answerOption: answerOptionList,
        repeats,
        choiceOrientation = 'vertical',
        colsNumber,
    } = questionItem;

    const fieldName = [...parentPath, linkId];

    const { value, onChange, onMultiChange, disabled, formItem } = useFieldController<FormAnswerItems[]>(
        fieldName,
        questionItem,
    );

    const formAnswers = value || [];
    const withImages = answerOptionList?.some((answerOption) => getAnswerOptionBackgroundImage(answerOption)) ?? false;

    const styles: React.CSSProperties = colsNumber
        ? {
              width: '100%',
              display: 'grid',
              gridTemplateColumns: `repeat(${colsNumber}, 1fr)`,
          }
        : {};

    const renderOption = (answerOption: QuestionnaireItemAnswerOption) => {
        const optionAnswerValue = toAnswerValue(answerOption, 'value')!;
        const display = getDisplay(optionAnswerValue);
        const key = JSON.stringify(optionAnswerValue);
        const optionProps = {
            checked: formAnswers.findIndex((v) => _.isEqual(v.value, optionAnswerValue)) !== -1,
            disabled,
            onChange: repeats
                ? () => onMultiChange({ value: optionAnswerValue })
                : () => onChange([{ value: optionAnswerValue }]),
            // TODO: use linkId + __ + code instead
            'data-testid': `inline-choice__${_.kebabCase(JSON.stringify(display))}`,
        };

        if (!withImages) {
            return repeats ? (
                <Checkbox key={key} {...optionProps}>
                    {display}
                </Checkbox>
            ) : (
                <Radio key={key} {...optionProps}>
                    {display}
                </Radio>
            );
        }

        const image = getAnswerOptionBackgroundImage(answerOption);
        const content = (
            <>
                {image?.url ? <S.Image src={image.url} alt={image.title ?? ''} /> : null}
                <S.Label>{display}</S.Label>
            </>
        );

        return repeats ? (
            <S.CheckboxOption key={key} {...optionProps}>
                {content}
            </S.CheckboxOption>
        ) : (
            <S.RadioOption key={key} {...optionProps}>
                {content}
            </S.RadioOption>
        );
    };

    return (
        <Form.Item {...formItem} data-testid={linkId} data-linkid={linkId}>
            {withImages ? (
                <S.OptionsList $colsNumber={colsNumber} $orientation={choiceOrientation}>
                    {answerOptionList?.map(renderOption)}
                </S.OptionsList>
            ) : (
                <Space direction={choiceOrientation} wrap style={styles}>
                    {answerOptionList?.map(renderOption)}
                </Space>
            )}
        </Form.Item>
    );
}
