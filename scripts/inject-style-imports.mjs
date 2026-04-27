import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distRoot = path.resolve(__dirname, '../dist');

const entryFiles = [
    { relativePath: 'index.js', importLine: 'import "./style.css";' },
    { relativePath: 'controls/index.js', importLine: 'import "../style.css";' },
    { relativePath: 'readonly-controls/index.js', importLine: 'import "../style.css";' },
];

for (const { relativePath, importLine } of entryFiles) {
    const absolutePath = path.join(distRoot, relativePath);
    const source = await readFile(absolutePath, 'utf8');

    if (!source.includes(importLine)) {
        await writeFile(absolutePath, `${importLine}\n${source}`);
    }
}
