import Debug from 'debug';

import { getOptionValue } from './cli';

const debug = Debug('@capacitor/create-plugin:options');

export type Options = {
  [K in keyof OptionValues]: string | undefined;
};

export interface OptionValues {
  dir: string;
  name: string;
  'package-id': string;
  'class-name': string;
  repo?: string;
  author: string;
  license: string;
  description: string;
  'android-lang': string;
}

export type Validators = {
  [K in keyof Required<OptionValues>]: (value: any) => string | true;
};

const CLI_ARGS = ['dir'] as const;

const CLI_OPTIONS = [
  'name',
  'package-id',
  'class-name',
  'repo',
  'author',
  'license',
  'description',
  'android-lang',
] as const;

export const VALIDATORS: Validators = {
  name: (value) =>
    typeof value !== 'string' || value.trim().length === 0
      ? `Must provide a plugin name, e.g. "capacitor-plugin-example"`
      : /^(@[a-z0-9-]+\/)?[a-z0-9-]+$/.test(value)
        ? true
        : `Must be a valid npm package name (lowercase, alphanumeric, kebab-case)`,
  'package-id': (value) =>
    typeof value !== 'string' || value.trim().length === 0
      ? 'Must provide a Package ID, e.g. "com.mycompany.plugins.example"'
      : /[A-Z]/.test(value)
        ? 'Must be lowercase'
        : /^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$/.test(value)
          ? true
          : `Must be in reverse-DNS format, e.g. "com.mycompany.plugins.example"`,
  'class-name': (value) =>
    typeof value !== 'string' || value.trim().length === 0
      ? `Must provide a plugin class name, e.g. "Example"`
      : /^[A-z0-9]+$/.test(value)
        ? true
        : `Must be CamelCase, e.g. "Example"`,
  repo: (value) =>
    typeof value !== 'string' || value.trim().length === 0 || !/^https?:\/\//.test(value)
      ? `Must be a URL, e.g. "https://github.com/<user>/<repo>"`
      : true,
  author: () => true,
  license: (value) =>
    typeof value !== 'string' || value.trim().length === 0 ? `Must provide a valid license, e.g. "MIT"` : true,
  description: (value) =>
    typeof value !== 'string' || value.trim().length === 0 ? `Must provide a description` : true,
  'android-lang': (value) =>
    typeof value !== 'string' || value.trim().length === 0
      ? `Must provide a language, either "kotlin" or "java"`
      : true,
  dir: (value) =>
    typeof value !== 'string' || value.trim().length === 0
      ? `Must provide a directory, e.g. "my-plugin"`
      : /^-/.test(value)
        ? 'Directories should not start with a hyphen.'
        : true,
};

export const getOptions = (): Options => {
  const argValues = CLI_ARGS.reduce((opts, option, i) => {
    const value = process.argv[i + 2];
    const validatorResult = VALIDATORS[option](value);

    if (typeof validatorResult === 'string') {
      debug(`invalid positional arg: %s %O: %s`, option, value, validatorResult);
    }

    opts[option] = validatorResult === true ? value : undefined;

    return opts;
  }, {} as Options);

  const optionValues = CLI_OPTIONS.reduce((opts, option) => {
    const value = getOptionValue(process.argv, `--${option}`);
    const validatorResult = VALIDATORS[option](value);

    if (typeof validatorResult === 'string') {
      debug(`invalid option: --%s %O: %s`, option, value, validatorResult);
    }

    opts[option] = validatorResult === true ? value : undefined;

    return opts;
  }, {} as Options);

  return { ...argValues, ...optionValues };
};
