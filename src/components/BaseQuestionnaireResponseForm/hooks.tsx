import { FormItemProps } from 'antd';
import classNames from 'classnames';
import { FCEQuestionnaireItem } from 'sdc-qrf';

import { useFieldController as useFieldControllerFhirQuestionnaire } from '@beda.software/fhir-questionnaire';

import { getFieldErrorMessage } from 'src/components/BaseQuestionnaireResponseForm/utils';

import s from './BaseQuestionnaireResponseForm.module.scss';
import { FieldLabel } from './FieldLabel';

export function useFieldController<T = unknown>(fieldName: Array<string | number>, questionItem: FCEQuestionnaireItem) {
    const result = useFieldControllerFhirQuestionnaire<T>(fieldName, questionItem);
    const { fieldState, name } = result;
    const { hidden, required, text } = questionItem;

    const invalidFieldMessage = getFieldErrorMessage({ name } as any, fieldState, text);

    const formItem: FormItemProps = {
        label: <FieldLabel questionItem={questionItem} />,
        hidden,
        validateStatus: fieldState?.invalid ? 'error' : 'success',
        help: invalidFieldMessage,
        required,
        className: classNames(s.field, {
            [s._hidden]: hidden,
        }),
    };

    return { ...result, formItem };
}
