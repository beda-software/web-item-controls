import styled, { css } from 'styled-components';

import { Text } from 'src/components/Typography';

interface GridContainerProps {
    columns?: number;
}

export const S = {
    Widget: styled.div`
        width: 100%;
        background-color: ${({ theme }) => theme.neutralPalette.gray_1};
        border: 1px solid ${({ theme }) => theme.neutralPalette.gray_4};
        border-radius: 10px;
        overflow: hidden;
    `,

    Header: styled.div`
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px;
        background-color: ${({ theme }) => theme.neutralPalette.gray_3};
        border-bottom: 1px solid ${({ theme }) => theme.neutralPalette.gray_4};
        color: ${({ theme }) => theme.antdTheme?.colorText};
    `,

    Column: styled.div`
        width: 100%;
    `,

    Text: styled(Text)``,

    GridContainer: styled.div<GridContainerProps>`
        display: grid;
        grid-template-columns: ${({ columns }) => `repeat(${columns || 'auto-fit'}, minmax(100px, 1fr))`};
        align-items: stretch;
    `,

    GridHeaderCell: styled.div`
        display: flex;
        align-items: center;
        min-height: 44px;
        padding: 12px 8px 13px;
        background-color: ${({ theme }) => theme.neutralPalette.gray_2};
        border-bottom: 1px solid ${({ theme }) => theme.neutralPalette.gray_4};
        color: ${({ theme }) => theme.antdTheme?.colorText};
        font-size: 14px;
        line-height: 22px;
        font-weight: 600;
    `,

    GridRowLabel: styled.div`
        display: flex;
        align-items: center;
        color: ${({ theme }) => theme.antdTheme?.colorText};
        font-size: 16px;
        font-weight: 600;
    `,

    GridItem: styled.div<{ $bold?: boolean }>`
        display: flex;
        align-items: center;
        min-height: 56px;
        padding: 12px;
        background-color: ${({ theme }) => theme.neutralPalette.gray_1};
        border-bottom: 1px solid ${({ theme }) => theme.neutralPalette.gray_4};
        color: ${({ theme }) => theme.antdTheme?.colorText};
        font-size: 14px;
        line-height: 22px;

        ${({ $bold }) =>
            $bold &&
            css`
                font-weight: 600;
            `}
    `,
};
