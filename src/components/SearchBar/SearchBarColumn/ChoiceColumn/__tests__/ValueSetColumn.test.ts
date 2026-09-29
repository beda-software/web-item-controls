import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement, ReactNode } from 'react';
import { expect, test, describe, vi } from 'vitest';

import { useSearchBar } from 'src/components/SearchBar/hooks';
import {
    ChoiceTypeColumnFilterValue,
    isChoiceColumnFilterValue,
    SearchBarChoiceColumn,
    SearchBarColumnType,
} from 'src/components/SearchBar/types';
import { ValueSetExpandProvider } from 'src/contexts';
import { ValueSetOption } from 'src/services';

import { codeSystemEncounterStatusData } from './valuesetEncounterStatus';
import { useChoiceColumn } from '../hooks';

const VALUE_SET_COLUMN_CASES: SearchBarChoiceColumn[] = [
    {
        id: 'status_valueset1',
        type: SearchBarColumnType.CHOICE,
        placeholder: 'Search by vastatus',
        valueSet: 'http://hl7.org/fhir/ValueSet/encounter-status-test',
    },
    {
        id: 'status_valueset2',
        type: SearchBarColumnType.CHOICE,
        placeholder: 'Search by vastatus',
        repeats: true,
        valueSet: 'http://hl7.org/fhir/ValueSet/encounter-status-test',
    },
];

const expandEncounterStatus = async (): Promise<ValueSetOption[]> =>
    codeSystemEncounterStatusData.concept!.map(({ code, display }) => ({
        value: { Coding: { system: codeSystemEncounterStatusData.url, code, display } },
    }));

const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(ValueSetExpandProvider.Provider, { value: expandEncounterStatus }, children);

describe('ValueSetColumn component testing', () => {
    test.each(VALUE_SET_COLUMN_CASES)(
        'It loads options correctly for valueset choice column: %s',
        async (columnCase) => {
            const { result } = renderHook(
                () => {
                    const { columnsFilterValues, onChangeColumnFilter, onResetFilters } = useSearchBar({
                        columns: [columnCase],
                    });

                    const { onSelect, isOptionSelected, getOptionLabel, debouncedLoadOptions } = useChoiceColumn({
                        columnFilterValue: columnsFilterValues[0] as ChoiceTypeColumnFilterValue,
                        onChange: onChangeColumnFilter,
                    });

                    return {
                        onSelect,
                        isOptionSelected,
                        getOptionLabel,
                        onResetFilters,
                        columnsFilterValues,
                        debouncedLoadOptions,
                    };
                },
                { wrapper },
            );

            expect(result.current.columnsFilterValues).toHaveLength(1);
            expect(isChoiceColumnFilterValue(result.current.columnsFilterValues[0]!)).toBeTruthy();

            const mockCallback = vi.fn();

            await act(async () => {
                result.current.debouncedLoadOptions('', mockCallback);
            });

            await waitFor(() => {
                expect(mockCallback).toHaveBeenCalled();
            });

            const options = mockCallback.mock.calls[0]![0];

            const valuesetEncounterStatusCodes = codeSystemEncounterStatusData.concept!.map((concept) => concept.code);

            await waitFor(() => {
                expect(options.length).toEqual(valuesetEncounterStatusCodes.length);
            });
            await waitFor(() => {
                options.forEach((option: ValueSetOption) => {
                    expect(valuesetEncounterStatusCodes).to.include(option.value.Coding.code);
                });
            });

            if (columnCase.repeats) {
                act(() => {
                    result.current.onSelect([options[0], options[1]]);
                });
                await waitFor(() => {
                    expect(result.current.columnsFilterValues[0]!.value).toEqual([options[0], options[1]]);
                });
                expect(result.current.isOptionSelected(options[0])).toBeTruthy();
                expect(result.current.isOptionSelected(options[1])).toBeTruthy();

                act(() => {
                    result.current.onResetFilters();
                });
                await waitFor(() => {
                    expect(result.current.columnsFilterValues[0]?.value).toBeNull();
                });
            } else {
                act(() => {
                    result.current.onSelect(options[0]);
                });
                await waitFor(() => {
                    expect(result.current.columnsFilterValues[0]!.value).toEqual([options[0]]);
                });
                expect(result.current.isOptionSelected(options[0])).toBeTruthy();
                expect(result.current.getOptionLabel(options[0])).toEqual(options[0].value.Coding.display);

                act(() => {
                    result.current.onResetFilters();
                });
                await waitFor(() => {
                    expect(result.current.columnsFilterValues[0]?.value).toBeNull();
                });
            }
        },
    );
});
