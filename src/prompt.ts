import Debug from 'debug';
import kleur from 'kleur';
import prompts from 'prompts';

import type { OptionValues, Options } from './options';
import { VALIDATORS } from './options';

const debug = Debug('@capacitor/create-plugin:prompt');

export const gatherDetails = (
  initialOptions: Options,
): Promise<OptionValues> => {
  prompts.override(initialOptions);

  return prompts(
    [
      {
        type: 'text',
        name: 'name',
        message: `What should be the npm package of your plugin?\n`,
        validate: VALIDATORS.name,
        format: value => value.trim(),
      },
      {
        type: 'text',
        name: 'dir',
        message: `What directory should be used for your plugin?\n`,
        // no TS support for initial as a function
        initial: ((prev: string) => prev.replace(/^@[^/]+\//, '')) as any,
        validate: VALIDATORS.dir,
        format: value => value.trim(),
      },
      {
        type: 'text',
        name: 'package-id',
        message:
          `What should be the Package ID for your plugin?\n\n` +
          `${kleur.reset(
            `    Package IDs are unique identifiers used in apps and plugins. For plugins,\n` +
              `    they're used as a Java namespace. They must be in reverse domain name\n` +
              `    notation, generally representing a domain name that you or your company owns.\n`,
          )}\n`,
        initial: 'com.mycompany.plugins.example',
        validate: VALIDATORS['package-id'],
        format: value => value.trim(),
      },
      {
        type: 'text',
        name: 'class-name',
        message: `What should be the class name for your plugin?\n`,
        initial: 'Example',
        validate: VALIDATORS['class-name'],
        format: value => value.trim(),
      },
      {
        type: 'text',
        name: 'repo',
        message: `What is the repository URL for your plugin?\n`,
        validate: VALIDATORS.repo,
        format: value => value.trim(),
      },
      {
        type: 'text',
        name: 'author',
        message: `${kleur.reset('(optional)')} ${kleur.bold(
          'Who is the author of this plugin?',
        )}\n`,
        validate: VALIDATORS.author,
        format: value => value.trim(),
      },
      {
        type: 'select',
        name: 'license',
        message: `What license should be used for your plugin?\n`,
        choices: [
          { title: 'MIT', value: 'MIT' },
          { title: 'ISC', value: 'ISC' },
          { title: 'Apache-2.0', value: 'Apache-2.0' },
          { title: 'other...', value: 'other' },
        ],
      },
      {
        type: prev => (prev === 'other' ? 'text' : null),
        name: 'license',
        message: `Enter a SPDX license identifier for your plugin.\n`,
        validate: VALIDATORS.license,
      },
      {
        type: 'text',
        name: 'description',
        message: `Enter a short description of plugin features.\n`,
        validate: VALIDATORS.description,
        format: value => value.trim(),
      },
    ],
    {
      onCancel: async () => {
        debug('Prompt cancelled by user.');
        process.exit(1);
      },
    },
  );
};
