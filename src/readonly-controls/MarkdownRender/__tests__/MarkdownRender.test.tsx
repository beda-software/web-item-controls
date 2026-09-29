import { render } from '@testing-library/react';
import { expect, test } from 'vitest';

import { ThemeProvider } from 'src/theme';

import { MarkdownRender } from '..';

function renderMarkdown(text: string) {
    return render(
        <ThemeProvider theme="light">
            <MarkdownRender text={text} />
        </ThemeProvider>,
    );
}

// Regression guard for CVE-2026-PENDING (stored XSS via unsanitized markdown).
test('strips dangerous raw HTML from display markdown', () => {
    const { container } = renderMarkdown(`<iframe srcdoc="<img src=x onerror=alert('hacked')>"></iframe>`);

    expect(container.querySelector('iframe')).toBeNull();
    expect(container.innerHTML).not.toContain('srcdoc');
    expect(container.innerHTML).not.toContain('onerror');
});

test('strips inline event handlers while keeping the element', () => {
    const { container } = renderMarkdown('<b onclick="alert(1)">hi</b>');

    expect(container.innerHTML).not.toContain('onclick');
    expect(container.querySelector('b')?.textContent).toBe('hi');
});

test('keeps the legitimate raw-HTML features the renderer supports', () => {
    const { container } = renderMarkdown('<u>underlined</u>\n\n:::note\nadmonition body\n:::');

    // <u> survives sanitization (rendered as an underlined span by the component override)
    expect(container.innerHTML).toContain('underlined');
    // admonition wrapper class survives so styling still applies
    expect(container.querySelector('.admonition')).not.toBeNull();
    expect(container.querySelector('.admonition-content')?.textContent).toContain('admonition body');
});

test('renders ordinary markdown', () => {
    const { container } = renderMarkdown('**bold** and [link](https://example.com)');

    expect(container.querySelector('strong')?.textContent).toBe('bold');
    const link = container.querySelector('a');
    expect(link?.getAttribute('href')).toBe('https://example.com');
});
