import { Card } from 'antd';
import styled, { css } from 'styled-components';

export const S = {
    Card: styled(Card)<{
        $variant: 'main-card' | 'sub-card';
        $collapsible?: boolean;
        $isOpen?: boolean;
        $highlightActive?: boolean;
    }>`
        .ant-card-head {
            background-color: ${({ theme }) => theme.neutralPalette.gray_3};
        }

        ${({ $variant }) =>
            $variant === 'sub-card' &&
            css`
                .ant-card-head {
                    background-color: ${({ theme }) => theme.neutralPalette.gray_2};
                }
            `}

        ${({ $collapsible, $isOpen, $highlightActive, theme }) => {
            if (!$collapsible) {
                return null;
            }

            // Only the deepest open card in a nested accordion chain gets the
            // "active" tint - an outer card that itself gates a further nested
            // accordion (highlightActive: false) stays neutral so the active path
            // doesn't light up at every level (see RepeatableGroupCard).
            const isHighlighted = $isOpen && $highlightActive;

            return css`
                border-left: 4px solid ${isHighlighted ? theme.primaryPalette.bcp_3 : 'transparent'};

                .ant-card-head {
                    background-color: ${isHighlighted ? theme.primaryPalette.bcp_1 : theme.neutralPalette.gray_2};
                }
            `;
        }}
    `,
    CollapsibleTitle: styled.div`
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        user-select: none;
    `,
    Caret: styled.span<{ $isOpen: boolean }>`
        display: inline-flex;
        align-items: center;
        transform: rotate(${({ $isOpen }) => ($isOpen ? 0 : 180)}deg);
        transition: transform 0.2s ease;
    `,
    GroupContent: styled.div`
        display: flex;
        flex-direction: column;
        gap: 16px;
        width: 100%;
    `,
};
