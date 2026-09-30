import styled, { css } from 'styled-components';

export const S = {
    Container: styled.div`
        display: flex;
        flex-direction: column;
        gap: 24px;
        width: 100%;
    `,
    Figure: styled.div`
        position: relative;
        width: 100%;
        max-width: 289px;
        margin: 0 auto;
    `,
    Svg: styled.svg`
        display: block;
        width: 100%;
        height: auto;
        overflow: visible;
    `,
    Region: styled.g<{ $selected: boolean; $active: boolean; $interactive: boolean }>`
        fill: ${({ theme, $selected }) => ($selected ? theme.primary : theme.neutralPalette.gray_5)};
        stroke: ${({ theme, $active }) => ($active ? theme.primaryPalette.bcp_8 : 'none')};
        stroke-width: 2px;
        outline: none;
        transition: fill 0.2s;

        ${({ $interactive, $selected, theme }) =>
            $interactive &&
            css`
                cursor: pointer;

                &:hover,
                &:focus-visible {
                    fill: ${$selected ? theme.primaryPalette.bcp_7 : theme.primaryPalette.bcp_5};
                }
            `}
    `,
    Side: styled.text`
        fill: ${({ theme }) => theme.neutral.primaryText};
        font-size: 14px;
    `,
    Number: styled.text`
        fill: #ffffff;
        font-size: 12px;
        font-weight: 600;
        pointer-events: none;
    `,
};
