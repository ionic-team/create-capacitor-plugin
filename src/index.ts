import Debug from 'debug';
import kleur from 'kleur';
import { resolve } from 'path';

import { emoji, isTTY } from './cli';
import { exists } from './fs';
import * as help from './help';
import { getOptions } from './options';
import { gatherDetails } from './prompt';
import { run as runSubprocess } from './subprocess';
import { extractTemplate } from './template';

const debug = Debug('@capacitor/create-plugin');

process.on('unhandledRejection', error => {
  process.stderr.write(`ERR: ${error}\n`);
  process.exit(1);
});

export const run = async (): Promise<void> => {
  if (process.argv.find(arg => ['-h', '-?', '--help'].includes(arg))) {
    help.run();
    process.exit();
  }

  const options = getOptions();
  debug('options from command-line: %O', options);

  if (Object.values(options).includes(undefined)) {
    if (isTTY) {
      debug(`Missing/invalid options. Prompting for user input...`);
    } else {
      process.stderr.write(
        `ERR: Refusing to prompt for missing/invalid options in non-TTY environment.\n` +
          `See ${kleur.bold('--help')}. Run with ${kleur.bold(
            '--verbose',
          )} for more context.\n`,
      );
      process.exit(1);
    }
  }

  const details = await gatherDetails(options);
  const dir = resolve(process.cwd(), details.dir);

  if (await exists(dir)) {
    process.stderr.write(
      `ERR: Not overwriting existing directory: ${kleur.bold(details.dir)}`,
    );
    process.exit(1);
  }

  await extractTemplate(dir, details);

  process.stdout.write('Installing dependencies. Please wait...\n');

  const opts = { cwd: details.dir, stdio: 'inherit' } as const;

  try {
    await runSubprocess('npm', ['install'], opts);
  } catch (e) {
    process.stderr.write(
      `WARN: Could not install dependencies: ${e.message ?? e.stack ?? e}\n`,
    );
  }

  process.stdout.write('Initializing git...\n');

  try {
    await runSubprocess('git', ['init'], opts);
    await runSubprocess('git', ['checkout', '-b', 'main'], opts);
    await runSubprocess('git', ['add', '-A'], opts);
    await runSubprocess(
      'git',
      ['commit', '-m', 'Initial commit', '--no-gpg-sign'],
      opts,
    );
  } catch (e) {
    process.stderr.write(
      `WARN: Could not initialize git: ${e.message ?? e.stack ?? e}\n`,
    );
  }

  const tada = emoji('🎉', '*');

  process.stdout.write(`
${kleur.bold(`${tada} Capacitor plugin generated! ${tada}`)}

Next steps:
  - ${kleur.bold(`cd ${details.dir}/`)}
`);
};
