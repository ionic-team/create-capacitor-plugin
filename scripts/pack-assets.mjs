import { resolve } from 'path';
import tar from 'tar';

import { execute } from './lib/cli.mjs';
import { root } from './lib/repo.mjs';

execute(async () => {
  const assetsdir = resolve(root, 'assets');
  const template = resolve(assetsdir, 'plugin-template');
  const dest = resolve(assetsdir, 'plugin-template.tar.gz');

  await tar.create({ gzip: true, file: dest, cwd: template }, ['.']);
  console.log(`Assets copied to ${dest}!`);

  const wwwTemplate = resolve(assetsdir, 'www-template');
  const wwwDest = resolve(assetsdir, 'www-template.tar.gz');

  await tar.create({ gzip: true, file: wwwDest, cwd: wwwTemplate }, ['.']);
  console.log(`Assets copied to ${wwwDest}!`);
});
