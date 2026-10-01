import _ from 'lodash';

function isFieldError(value: unknown): boolean {
    return _.isPlainObject(value) && typeof (value as { type?: unknown }).type === 'string';
}

/**
 * Recursively counts leaf validation errors in a (nested) react-hook-form errors object.
 *
 * @param errors - A react-hook-form errors subtree (object, array or a single field error)
 * @returns Number of field errors found in the subtree
 */
export function countValidationErrors(errors: unknown): number {
    if (isFieldError(errors)) {
        return 1;
    }

    if (!_.isObjectLike(errors)) {
        return 0;
    }

    return Object.values(errors as object).reduce((acc, value) => acc + countValidationErrors(value), 0);
}
