import { act, renderHook } from '@testing-library/react';
import moment from 'moment';

import { useSearchBar } from '../hooks';
import { SearchBarColumnType } from '../types';

describe('SearchBar filters testing', () => {
    test('String one filters', () => {
        const patientReference1 = {
            value: {
                Reference: {
                    resourceType: 'Patient',
                    id: 'patient-1',
                },
            },
        };
        const patientReference2 = {
            value: {
                Reference: {
                    resourceType: 'Patient',
                    id: 'patient-2',
                },
            },
        };

        const { result } = renderHook(() =>
            useSearchBar({
                columns: [
                    {
                        id: 'patient',
                        type: SearchBarColumnType.REFERENCE,
                        placeholder: 'Search by patient',
                        expression: 'Patient',
                        path: "name.given.first() + ' ' + name.family",
                    },
                    {
                        id: 'practitioner',
                        type: SearchBarColumnType.STRING,
                        placeholder: 'Find patient',
                    },
                    {
                        id: 'date',
                        type: SearchBarColumnType.DATE,
                        placeholder: ['Start date', 'End date'],
                    },
                ],
            }),
        );

        act(() => {
            result.current.onChangeColumnFilter(patientReference1, 'patient');
        });
        act(() => {
            result.current.onChangeColumnFilter([moment('2023-01-01'), moment('2023-01-20')], 'date');
        });

        expect(result.current.columnsFilterValues.length).toEqual(3);
        expect(result.current.columnsFilterValues[0]!.value).toEqual(patientReference1);
        expect(result.current.columnsFilterValues[1]!.value).toBeUndefined();
        expect(result.current.columnsFilterValues[2]!.value).toEqual([moment('2023-01-01'), moment('2023-01-20')]);

        act(() => {
            result.current.onChangeColumnFilter('Alec', 'practitioner');
        });

        expect(result.current.columnsFilterValues.length).toEqual(3);
        expect(result.current.columnsFilterValues[0]!.value).toEqual(patientReference1);
        expect(result.current.columnsFilterValues[1]!.value).toEqual('Alec');
        expect(result.current.columnsFilterValues[2]!.value).toEqual([moment('2023-01-01'), moment('2023-01-20')]);

        act(() => {
            result.current.onChangeColumnFilter(patientReference2, 'patient');
        });

        expect(result.current.columnsFilterValues.length).toEqual(3);
        expect(result.current.columnsFilterValues[0]!.value).toEqual(patientReference2);
        expect(result.current.columnsFilterValues[1]!.value).toEqual('Alec');
        expect(result.current.columnsFilterValues[2]!.value).toEqual([moment('2023-01-01'), moment('2023-01-20')]);

        act(() => {
            result.current.onResetFilters();
        });

        expect(result.current.columnsFilterValues.length).toEqual(3);
        expect(result.current.columnsFilterValues[0]!.value).toEqual(null);
        expect(result.current.columnsFilterValues[1]!.value).toBeUndefined();
        expect(result.current.columnsFilterValues[2]!.value).toBeUndefined();
    });
});
