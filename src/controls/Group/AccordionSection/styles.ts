import styled from 'styled-components';

export const S = {
    Section: styled.div`
        display: flex;
        flex-direction: column;
        width: 100%;
        border: 1px solid ${({ theme }) => theme.neutral.dividers};
        border-radius: 6px;
        overflow: hidden;
    `,
    Header: styled.div`
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 24px;
        background-color: ${({ theme }) => theme.neutralPalette.gray_3};
        cursor: pointer;
        user-select: none;
    `,
    Caret: styled.span<{ $isOpen: boolean }>`
        display: inline-flex;
        align-items: center;
        transform: rotate(${({ $isOpen }) => ($isOpen ? 0 : 180)}deg);
        transition: transform 0.2s ease;
    `,
    Title: styled.div`
        flex: 1;
        display: flex;
        align-items: baseline;
        gap: 8px;
    `,
    Count: styled.span`
        color: ${({ theme }) => theme.neutral.secondaryText};
    `,
    Content: styled.div`
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding: 24px;
    `,
};
