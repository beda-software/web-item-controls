import { CaretDownOutlined } from '@ant-design/icons';
import { ReactNode } from 'react';

import { Title } from 'src/components/Typography';

import { S } from './styles';
import { useScrollIntoViewOnOpen } from '../useScrollIntoViewOnOpen';

interface Props {
    linkId: string;
    title?: ReactNode;
    count?: number;
    isOpen: boolean;
    onToggle: () => void;
    children?: ReactNode;
}

export function AccordionSection(props: Props) {
    const { linkId, title, count, isOpen, onToggle, children } = props;

    const sectionRef = useScrollIntoViewOnOpen<HTMLDivElement>(isOpen);

    return (
        <S.Section ref={sectionRef} data-testid={`accordion-section-${linkId}`}>
            <S.Header
                role="button"
                tabIndex={0}
                onClick={onToggle}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onToggle();
                    }
                }}
                data-testid={`accordion-toggle-${linkId}`}
            >
                <S.Caret $isOpen={isOpen}>
                    <CaretDownOutlined />
                </S.Caret>
                <S.Title>
                    <Title level={4}>{title}</Title>
                    {typeof count === 'number' && <S.Count>({count})</S.Count>}
                </S.Title>
            </S.Header>
            {isOpen && children ? <S.Content>{children}</S.Content> : null}
        </S.Section>
    );
}
