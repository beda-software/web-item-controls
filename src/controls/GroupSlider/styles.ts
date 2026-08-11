import styled from 'styled-components';

export const S = {
    Group: styled.div`
        display: flex;
        flex-direction: column;
        gap: 16px;
        width: 100%;
    `,
    Header: styled.div`
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 8px;
    `,
    Slide: styled.div`
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 16px;
        border: 1px solid ${({ theme }) => theme.neutral.dividers};
        border-radius: 6px;
    `,
    Footer: styled.div`
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
    `,
    Nav: styled.div`
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 8px;
    `,
    Actions: styled.div`
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 8px;
    `,
};
