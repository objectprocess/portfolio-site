import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('src/data/projects');
const order = [
  'vision-tools',
  'losing-my-hands',
  'hiring-MLEs',
  'year-of-LLMs',
  'data-flywheels',
  'needs-evals',
  'levis-icd',
  'announcing-Indexify',
  'cold-stranger-things',
  'cold-archive',
  'cold-puma',
  'cpcompany-50th',
  'wondershare-filmora',
  'filmora-trendbook',
  'my-clothing-archive',
  'vision-otf',
  'archive-process',
  'shellzine-shenzhen',
  'intel-from-seoul',
];

for (const dir of order) {
  const t = fs.readFileSync(path.join(root, dir, 'project.ts'), 'utf8');
  const id = t.match(/id:\s*"([^"]+)"/)?.[1];
  const title = t.match(/title:\s*"([^"]+)"/)?.[1];
  const type = t.match(/type:\s*"([^"]+)"/)?.[1];
  const tagsRaw = t.match(/tags:\s*\[([^\]]+)\]/)?.[1] ?? '';
  const tags = [...tagsRaw.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  console.log(JSON.stringify({ dir, id, title, type, tags }));
}
