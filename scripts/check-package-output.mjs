import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const requiredFiles = [
    'dist/controls/index.js',
    'dist/controls/index.d.ts',
    'dist/readonly-controls/index.js',
    'dist/readonly-controls/index.d.ts',
    'dist/style.css',
];

const forbiddenFiles = ['dist/index.js', 'dist/index.d.ts', 'dist/components/index.js', 'dist/utils/index.js'];

const entryStyleImports = [
    { filePath: 'dist/controls/index.js', importLine: 'import "../style.css";' },
    { filePath: 'dist/readonly-controls/index.js', importLine: 'import "../style.css";' },
];

const expectedExports = {
    './controls': {
        types: './dist/controls/index.d.ts',
        import: './dist/controls/index.js',
    },
    './readonly-controls': {
        types: './dist/readonly-controls/index.d.ts',
        import: './dist/readonly-controls/index.js',
    },
};

async function exists(relativePath) {
    try {
        await access(path.join(rootDir, relativePath));
        return true;
    } catch {
        return false;
    }
}

function fail(message) {
    console.error(`Package output check failed: ${message}`);
    process.exitCode = 1;
}

for (const filePath of requiredFiles) {
    if (!(await exists(filePath))) {
        fail(`missing required file ${filePath}`);
    }
}

for (const filePath of forbiddenFiles) {
    if (await exists(filePath)) {
        fail(`unexpected public artifact ${filePath}`);
    }
}

for (const { filePath, importLine } of entryStyleImports) {
    const source = await readFile(path.join(rootDir, filePath), 'utf8');

    if (!source.startsWith(`${importLine}\n`)) {
        fail(`${filePath} must start with ${importLine}`);
    }
}

const packageJson = JSON.parse(await readFile(path.join(rootDir, 'package.json'), 'utf8'));

if (JSON.stringify(packageJson.exports) !== JSON.stringify(expectedExports)) {
    fail('package.json exports must match the supported public subpaths');
}
