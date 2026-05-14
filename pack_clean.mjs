import { createWriteStream, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { ZipArchive } = require('archiver');

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = __dirname;
const outFile = join(dirname(srcDir), '墨境_InkRealm_v1.2.5_纯净版.zip');

const include = [
  'dist',
  'public',
  'src',
  'InkRealm.exe',
  'server.js',
  'start.bat',
  '启动墨境.bat',
  'package.json',
  'package-lock.json',
  'index.html',
  'vite.config.ts',
  'tsconfig.json',
  'tsconfig.app.json',
  'tsconfig.node.json',
  'eslint.config.js',
  'README.md',
  'REQUIREMENTS.md',
  '.gitignore',
  '.gitattributes',
];

const output = createWriteStream(outFile);
const archive = new ZipArchive({ zlib: { level: 9 } });

output.on('close', () => {
  const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(1);
  console.log(`\nDone: ${outFile} (${sizeMB} MB)`);
});

archive.on('error', (err) => {
  console.error('Error:', err);
  process.exit(1);
});

archive.pipe(output);

for (const item of include) {
  const itemPath = join(srcDir, item);
  try {
    const stat = statSync(itemPath);
    if (stat.isDirectory()) {
      archive.directory(itemPath, item);
    } else {
      archive.file(itemPath, { name: item });
    }
    console.log(`OK: ${item}`);
  } catch {
    console.log(`SKIP: ${item}`);
  }
}

archive.finalize();
