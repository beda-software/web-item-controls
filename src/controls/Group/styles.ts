import styled, { css } from 'styled-components';

import { GroupContextProps } from './context';

export const S = {
    Group: styled.div`
        display: flex;
        flex-direction: column;
        gap: 16px;
        width: 100%;
    `,
    Header: styled.div<{ $type?: GroupContextProps['type'] }>`
        display: flex;
        flex-direction: column;
        gap: 8px;
        position: relative;

        ${({ $type }) =>
            $type &&
            $type === 'section' &&
            css`
                padding: 24px 0 16px;
            `}

        ${({ $type }) =>
            $type &&
            $type === 'section-with-divider' &&
            css`
                padding: 40px 0 16px;
                margin-top: 24px;
                border-top: 1px solid ${({ theme }) => theme.primary};
            `}
    `,
    Title: styled.div`
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
    `,
    // A `disabled` input doesn't dispatch click events at all in most browsers, so a
    // plain wrapper onClick would never fire for a click landing on the field itself -
    // this transparent, full-bleed overlay is what actually catches it (see
    // useGroupGateInfo in accordionContext.ts). The bottom border marks the field as
    // belonging to the parent, visually separating it from whichever child collection
    // is open below it while it's locked.
    GateOverlay: styled.div`
        position: relative;
        cursor: pointer;
        padding-bottom: 16px;
        border-bottom: 1px solid ${({ theme }) => theme.neutral.dividers};

        &::after {
            content: '';
            position: absolute;
            inset: 0;
        }
    `,
    GateHint: styled.div`
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: ${({ theme }) => theme.neutral.secondaryText};
    `,
};
