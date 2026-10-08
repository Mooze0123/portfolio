import { cp, mkdir, rm } from 'node:fs/promises';
import { basename } from 'node:path';

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
for (const file of ['index.html', 'styles.css', 'main.js', 'analytics.js', 'assets', 'projects']) {
  await cp(file, `dist/${file}`, {
    recursive: true,
    filter: (source) => basename(source) !== '.DS_Store',
  });
}
console.log('Portfolio, project overview and case studies built in dist/');
