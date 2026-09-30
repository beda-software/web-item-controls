import { Checkbox, Radio } from 'antd';
import styled, { css } from 'styled-components';

const optionCard = css`
    && {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        width: var(--inline-choice-option-width, 100%);
        margin: 0;
        padding: 16px;
        border: 1px solid ${({ theme }) => theme.neutral.border};
        border-radius: 8px;
        background-color: ${({ theme }) => theme.neutralPalette.gray_1};
    }

    && > .ant-radio,
    && > .ant-checkbox {
        align-self: flex-start;
        margin-top: 4px;
    }

    && > span:last-child {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        flex: 1;
        min-width: 0;
        padding-inline: 0;
    }

    &&.ant-radio-wrapper-disabled,
    &&.ant-checkbox-wrapper-disabled {
        background-color: ${({ theme }) => theme.neutralPalette.gray_2};
        cursor: not-allowed;
    }

    &&.ant-radio-wrapper-disabled img,
    &&.ant-checkbox-wrapper-disabled img {
        opacity: 0.5;
    }
`;

export const S = {
    OptionsList: styled.div<{ $colsNumber?: number; $orientation: 'horizontal' | 'vertical' }>`
        width: 100%;
        gap: 16px;
        ${({ $colsNumber, $orientation }) => {
            if ($colsNumber) {
                return css`
                    display: grid;
                    grid-template-columns: repeat(${$colsNumber}, 1fr);
                `;
            }

            if ($orientation === 'horizontal') {
                return css`
                    --inline-choice-option-width: auto;
                    display: flex;
                    flex-wrap: wrap;
                `;
            }

            return css`
                display: flex;
                flex-direction: column;
            `;
        }}
    `,
    RadioOption: styled(Radio)`
        ${optionCard}

        &&.ant-radio-wrapper-checked {
            border-color: ${({ theme }) => theme.primary};
        }
    `,
    CheckboxOption: styled(Checkbox)`
        ${optionCard}

        &&.ant-checkbox-wrapper-checked {
            border-color: ${({ theme }) => theme.primary};
        }
    `,
    Image: styled.img`
        flex-shrink: 0;
        width: 120px;
        height: 80px;
        object-fit: contain;
    `,
    Label: styled.span`
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
        min-width: 0;
        font-weight: 700;
        overflow-wrap: break-word;
    `,
};
