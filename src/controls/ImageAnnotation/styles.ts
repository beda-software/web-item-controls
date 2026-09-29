import styled from 'styled-components';

export const S = {
    Container: styled.div`
        display: flex;
        flex-direction: row;
        width: 100%;
        min-height: 320px;
        border: 1px solid ${({ theme }) => theme.neutral.dividers};
        border-radius: 8px;
        overflow: hidden;
    `,
    ImagePane: styled.div`
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        flex: 1 1 50%;
        min-width: 0;
        padding: 20px 24px;
        background-color: ${({ theme }) => theme.neutralPalette.gray_2};
    `,
    Hint: styled.div`
        text-align: center;
        color: ${({ theme }) => theme.neutral.primaryText};
    `,
    ImageWrapper: styled.div<{ $clickable: boolean }>`
        position: relative;
        display: inline-block;
        max-width: 100%;
        line-height: 0;
        cursor: ${({ $clickable }) => ($clickable ? 'crosshair' : 'default')};
        user-select: none;
    `,
    Image: styled.img`
        display: block;
        max-width: 100%;
        height: auto;
        -webkit-user-drag: none;
    `,
    Marker: styled.button<{ $active: boolean }>`
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        padding: 0;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        border: 1px solid ${({ theme, $active }) => ($active ? theme.error : 'transparent')};
        background-color: ${({ theme }) => `${theme.error}40`};
        color: ${({ theme }) => theme.error};
        font-size: 16px;
        font-weight: 600;
        line-height: 1;
        cursor: pointer;
        box-shadow: ${({ theme, $active }) => ($active ? `0 0 0 4px ${theme.error}33` : 'none')};
    `,
    Details: styled.div`
        display: flex;
        flex-direction: column;
        gap: 16px;
        flex: 1 1 50%;
        min-width: 0;
        padding: 20px 24px;
    `,
    DetailsHeader: styled.div`
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
    `,
    DetailsItems: styled.div`
        display: flex;
        flex-direction: column;
        gap: 16px;
    `,
    Empty: styled.div`
        color: ${({ theme }) => theme.neutral.secondaryText};
    `,
};
