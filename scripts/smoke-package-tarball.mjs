import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cacheDir = path.join(rootDir, 'node_modules/.cache');
await mkdir(cacheDir, { recursive: true });
const tempRoot = await mkdtemp(path.join(cacheDir, 'web-item-controls-smoke-'));
const packageInstallDir = path.join(tempRoot, 'node_modules/@beda.software/web-item-controls');
const viteBin = path.join(rootDir, 'node_modules/vite/bin/vite.js');
const tscBin = path.join(rootDir, 'node_modules/typescript/bin/tsc');

async function run(command, args, options = {}) {
    try {
        await execFileAsync(command, args, {
            cwd: rootDir,
            maxBuffer: 1024 * 1024 * 10,
            ...options,
        });
    } catch (error) {
        const output = [error.stdout, error.stderr].filter(Boolean).join('\n');
        throw new Error(`${command} ${args.join(' ')} failed\n${output}`);
    }
}

try {
    await mkdir(packageInstallDir, { recursive: true });

    const { stdout } = await execFileAsync('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', tempRoot], {
        cwd: rootDir,
    });
    const [{ filename }] = JSON.parse(stdout);
    const tarballPath = path.join(tempRoot, filename);

    await run('tar', ['-xzf', tarballPath, '-C', packageInstallDir, '--strip-components=1']);

    await writeFile(
        path.join(tempRoot, 'package.json'),
        JSON.stringify({ private: true, type: 'module' }, null, 2),
    );
    await writeFile(
        path.join(tempRoot, 'tsconfig.json'),
        JSON.stringify(
            {
                compilerOptions: {
                    target: 'ES2020',
                    module: 'ESNext',
                    moduleResolution: 'bundler',
                    jsx: 'react-jsx',
                    strict: true,
                    skipLibCheck: true,
                    noEmit: true,
                },
                include: ['src/**/*'],
            },
            null,
            2,
        ),
    );
    await writeFile(
        path.join(tempRoot, 'index.html'),
        '<div id="root"></div><script type="module" src="/src/main.tsx"></script>\n',
    );
    await mkdir(path.join(tempRoot, 'src'), { recursive: true });
    await writeFile(
        path.join(tempRoot, 'src/main.tsx'),
        [
            "import { QuestionBoolean } from '@beda.software/web-item-controls/controls';",
            "import { QuestionBoolean as ReadonlyQuestionBoolean } from '@beda.software/web-item-controls/readonly-controls';",
            '',
            'console.log(QuestionBoolean, ReadonlyQuestionBoolean);',
            '',
        ].join('\n'),
    );

    await run(process.execPath, [tscBin, '--project', 'tsconfig.json'], { cwd: tempRoot });
    await run(process.execPath, [viteBin, 'build', '--logLevel', 'warn'], { cwd: tempRoot });
} finally {
    await rm(tempRoot, { recursive: true, force: true });
}
