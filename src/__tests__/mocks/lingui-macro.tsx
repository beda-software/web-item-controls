import type { ReactNode } from 'react';

/** Vitest-only stub when `@lingui/macro` is resolved to this file (see vite.config.ts). */
export function t(strings: TemplateStringsArray, ...values: unknown[]): string {
    return strings.reduce((acc, part, index) => acc + part + (values[index] ?? ''), '');
}

export function Trans({ children }: { children?: ReactNode }): ReactNode {
    return children ?? null;
}

interface PluralForms {
    one?: string;
    other: string;
    [key: string]: string | undefined;
}

export function plural(n: number, forms: PluralForms): string {
    const template = (n === 1 ? forms.one : forms.other) ?? forms.other;
    return template.replace(/#/g, String(n));
}
