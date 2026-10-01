import { expect, test } from 'vitest';

import { countValidationErrors } from '../utils';

const fieldError = { type: 'required', message: 'Required' };

describe('countValidationErrors', () => {
    test('returns 0 for empty values', () => {
        expect(countValidationErrors(undefined)).toBe(0);
        expect(countValidationErrors(null)).toBe(0);
        expect(countValidationErrors({})).toBe(0);
    });

    test('counts a single field error', () => {
        expect(countValidationErrors(fieldError)).toBe(1);
    });

    test('counts nested field errors in objects and arrays', () => {
        expect(
            countValidationErrors({
                'first-name': [{ value: { string: fieldError } }],
                'last-name': fieldError,
                address: { items: { city: fieldError, zip: [undefined, { value: { string: fieldError } }] } },
            }),
        ).toBe(4);
    });

    test('treats a linkId named "type" as a nested path, not as an error', () => {
        expect(countValidationErrors({ type: [{ value: { string: fieldError } }] })).toBe(1);
    });
});
