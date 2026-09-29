import _ from 'lodash';
import { FormAnswerItems, FormItems } from 'sdc-qrf';

export function getCoordinate(item: FormItems | undefined, linkId: string): number | undefined {
    const value = (item?.[linkId] as FormAnswerItems[] | undefined)?.[0]?.value?.decimal;

    return _.isNumber(value) ? value : undefined;
}
