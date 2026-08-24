import styled, { css } from 'styled-components';

export const S = {
    Chain: styled.div`
        display: flex;
        flex-direction: column;
        width: 100%;
        border: 1px solid ${({ theme }) => theme.neutral.dividers};
        border-radius: 6px;
        overflow: hidden;
    `,
    Bar: styled.div`
        display: flex;
        flex-direction: column;
        background-color: ${({ theme }) => theme.neutralPalette.gray_3};
    `,
    Row: styled.div`
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 8px 16px;

        & + & {
            border-top: 1px solid ${({ theme }) => theme.neutral.dividers};
        }
    `,
    RowMain: styled.div`
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
    `,
    LockedHint: styled.div`
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: ${({ theme }) => theme.neutral.secondaryText};
    `,
    Tabs: styled.div`
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
        min-width: 0;
    `,
    Separator: styled.span`
        color: ${({ theme }) => theme.neutral.secondaryText};
    `,
    // Plain breadcrumb-style label rather than a filled pill/button - only weight,
    // color and the "/" separators (see Separator) distinguish the tabs, matching the
    // original single-trigger look, just with every alternative always shown instead
    // of hidden behind a dropdown.
    Tab: styled.button<{ $active?: boolean }>`
        display: inline-flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;
        border: none;
        padding: 0;
        font: inherit;
        font-weight: 600;
        font-size: 14px;
        background: transparent;
        color: ${({ theme }) => theme.neutral.secondaryText};

        &:focus-visible {
            outline: 2px solid ${({ theme }) => theme.primary};
            outline-offset: 1px;
        }

        &:disabled {
            cursor: not-allowed;
            opacity: 0.5;
        }

        ${({ $active, theme }) =>
            $active
                ? css`
                      color: ${theme.neutral.title};
                  `
                : css`
                      &:not(:disabled):hover {
                          color: ${theme.primary};
                      }
                  `}
    `,
    AddTab: styled.button`
        display: inline-flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;
        border: none;
        padding: 0;
        font: inherit;
        font-weight: 600;
        font-size: 14px;
        background: transparent;
        color: ${({ theme }) => theme.primary};

        &:focus-visible {
            outline: 2px solid ${({ theme }) => theme.primary};
            outline-offset: 1px;
        }
    `,
    StaticSegment: styled.span`
        font-weight: 600;
        font-size: 14px;
        color: ${({ theme }) => theme.neutral.title};
    `,
    Count: styled.span`
        color: inherit;
        opacity: 0.8;
        font-weight: 400;
    `,
    Content: styled.div`
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding: 24px;
    `,
};
