import styled from 'styled-components';

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
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 8px 16px;
        background-color: ${({ theme }) => theme.neutralPalette.gray_3};
    `,
    Segments: styled.div`
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
        min-width: 0;
    `,
    Segment: styled.span`
        display: inline-flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;
        font-weight: 600;
        font-size: 14px;
        color: ${({ theme }) => theme.neutral.title};

        &:hover {
            color: ${({ theme }) => theme.primary};
        }
    `,
    StaticSegment: styled.span`
        font-weight: 600;
        font-size: 14px;
        color: ${({ theme }) => theme.neutral.title};
    `,
    Separator: styled.span`
        color: ${({ theme }) => theme.neutral.secondaryText};
    `,
    Count: styled.span`
        color: ${({ theme }) => theme.neutral.secondaryText};
        font-weight: 400;
    `,
    Content: styled.div`
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding: 24px;
    `,
};
