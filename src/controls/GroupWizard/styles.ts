import styled, { css } from 'styled-components';

import { FormFooter } from 'src/components/BaseQuestionnaireResponseForm/FormFooter';
import { WizardFooter } from 'src/components/Wizard';

export const S = {
    Group: styled.div<{ $active?: boolean; $hidden?: boolean }>`
        display: none;
        flex-direction: column;
        gap: inherit;
        flex: 1;

        ${({ $active }) =>
            $active &&
            css`
                display: flex;
            `}

        ${({ $hidden }) =>
            $hidden &&
            css`
                display: none;
            `}
    `,
    WizardFooter: styled(WizardFooter)``,
    FormFooter: styled(FormFooter)`
        padding: 0 !important;
        margin: 0 !important;
        border: 0 !important;
    `,
};
