import { Slot } from 'fhir/r4b';
import { UserInvocationTable } from 'fhirpath';

import { ensure, parseFHIRDateTime } from '@beda.software/fhir-react';

import { evaluate, initFHIRPathEvaluateOptions } from 'src/utils';

import { loadResourceOptions } from './questionnaire';

const formatDateUserInvocationTable: UserInvocationTable = {
    formatDate: {
        fn: (inputs: string[], format: string) => {
            return inputs.map((i) => parseFHIRDateTime(i).format(format));
        },
        arity: { 0: [], 1: ['String'] },
    },
};

// Hoisted so the vi.mock factory below (which vitest moves above all imports) can seed the store with it
const { slot } = vi.hoisted(() => ({
    slot: {
        resourceType: 'Slot',
        id: 'slot-1',
        status: 'free',
        schedule: {
            reference: 'Schedule/schedule-1',
        },
        start: '2024-09-20T00:00:00Z',
        end: '2024-09-20T00:30:00Z',
    } as Slot,
}));

// const startString = 'Friday • 20 Sep • 12:00 AM';
// string representation should be calculated to aviod issue with different timezones
// Formating is depends on the timezone where test is running
const startString = parseFHIRDateTime(slot.start).format('dddd • D MMM • h:mm A');

vi.mock('src/services/fhir', async () => {
    const { mockFHIRServicesModule } = await import('src/__tests__/fhir-service-mock');

    return mockFHIRServicesModule([slot]);
});

describe('Custom fhirpath invocation for reference option display', () => {
    test('Not implemented function', async () => {
        expect(() => {
            evaluate(slot, "Slot.start.formatDate('dddd • D MMM • h:mm A')");
        }).toThrow('Not implemented: formatDate');
    });
    test('Init FHIRPath evaluate options works', async () => {
        initFHIRPathEvaluateOptions(formatDateUserInvocationTable);
        const result = evaluate(slot, "Slot.start.formatDate('dddd • D MMM • h:mm A')");
        expect(result).toEqual([startString]);
    });

    test('Load options', async () => {
        const getDisplay = (slot: Slot) => {
            const result = evaluate(slot, "Slot.start.formatDate('dddd • D MMM • h:mm A')");
            if (result.length == 1) {
                return `${result[0]}`;
            } else {
                return 'Unknown';
            }
        };

        const options = ensure(await loadResourceOptions('Slot', { id: slot.id }, undefined, getDisplay));

        expect(options).toEqual([
            {
                value: {
                    Reference: {
                        display: startString,
                        reference: `Slot/${slot.id}`,
                    },
                },
            },
        ]);
    });
});

describe('Default fhirpath functions work', () => {
    test('Function toString() works correctly', async () => {
        initFHIRPathEvaluateOptions(formatDateUserInvocationTable);
        const result = evaluate({ x: 10 }, 'x.toString()');
        expect(result).toEqual(['10']);
    });
});
