import styled, { css } from 'styled-components';

import { Title } from 'src/components/Typography';

export const SIDEBAR_WIDTH = 260;
export const ROW_INDENT = 16;

export const S = {
    Container: styled.div`
        display: flex;
        align-items: stretch;
        gap: 24px;
        border: 1px solid ${({ theme }) => theme.neutralPalette.gray_4};
        border-radius: 12px;
        overflow: hidden;
    `,
    Sider: styled.div`
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: ${SIDEBAR_WIDTH}px;
        flex: 0 0 auto;
        padding: 12px 8px;
        background-color: ${({ theme }) => theme.neutralPalette.gray_2};
    `,
    Section: styled.div`
        display: flex;
        flex-direction: column;
    `,
    Row: styled.div<{ $depth: number; $selected?: boolean; $clickable?: boolean }>`
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 8px 4px ${({ $depth }) => 16 + $depth * ROW_INDENT}px;
        border-left: 2px solid transparent;
        border-radius: 0 4px 4px 0;
        cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};

        ${({ $selected }) =>
            $selected &&
            css`
                border-left-color: ${({ theme }) => theme.antdTheme?.colorPrimary};

                * {
                    color: ${({ theme }) => theme.antdTheme?.colorPrimary};
                    font-weight: 600;
                }
            `}

        ${({ $clickable, $selected }) =>
            $clickable &&
            !$selected &&
            css`
                &:hover {
                    background-color: ${({ theme }) => theme.neutralPalette.gray_3};
                }
            `}
    `,
    RowLabel: styled.span`
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 14px;
    `,
    ExpandButton: styled.button`
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        flex: 0 0 auto;
        border: none;
        background: transparent;
        cursor: pointer;
        color: ${({ theme }) => theme.neutral.secondaryText};

        &:hover {
            color: ${({ theme }) => theme.antdTheme?.colorPrimary};
        }
    `,
    AddButton: styled.button`
        display: flex;
        align-items: center;
        gap: 7px;
        border: none;
        background: transparent;
        color: ${({ theme }) => theme.antdTheme?.colorLink};
        cursor: pointer;
        font-size: 14px;
        padding: 4px 8px;
    `,
    Content: styled.div`
        flex: 1;
        min-width: 0;
        padding: 12px 12px 12px 0;
        display: flex;
        flex-direction: column;
        gap: 16px;
    `,
    ContentHeader: styled.div`
        display: flex;
        align-items: center;
        gap: 24px;
    `,
    ContentTitle: styled(Title)`
        flex: 1;
        min-width: 0;
        margin: 0 !important;
    `,
    ParentPreview: styled.div`
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px;
        border-radius: 8px;
        background-color: ${({ theme }) => theme.neutralPalette.gray_2};

        * {
            pointer-events: none;
        }
    `,
    ParentPreviewTitle: styled(Title)`
        margin: 0 !important;
        color: ${({ theme }) => theme.neutral.secondaryText} !important;
    `,
};
