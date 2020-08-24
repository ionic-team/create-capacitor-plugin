import Debug from 'debug';

import { getOptionValue } from './cli';

const debug = Debug('@capacitor/create-plugin:options');

export type Options = {
  [K in keyof OptionValues]: string | undefined;
};

export interface OptionValues {
  name: string;
  'package-id': string;
  'class-name': string;
  repo?: string;
  author: string;
  license: string;
  description: string;
  dir: string;
}

export type Validators = {
  [K in keyof Required<OptionValues>]: (value: any) => string | true;
};

export const OPTIONS: (keyof OptionValues)[] = [
  'name',
  'package-id',
  'class-name',
  'repo',
  'author',
  'license',
  'description',
  'dir',
];

export const VALIDATORS: Validators = {
  name: value =>
    typeof value !== 'string' || value.trim().length === 0
      ? `Must provide a plugin name, e.g. "capacitor-plugin-example"`
      : /^(@[a-z0-9-]+\/)?[a-z0-9-]+$/.test(value)
      ? true
      : `Must be a valid npm package name (lowercase, alphanumeric, kebab-case)`,
  'package-id': value =>
    typeof value !== 'string' || value.trim().length === 0
      ? 'Must provide a Package ID, e.g. "com.mycompany.plugins.example"'
      : /[A-Z]/.test(value)
      ? 'Must be lowercase'
      : /^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$/.test(value)
      ? true
      : `Must be in reverse-DNS format, e.g. "com.mycompany.plugins.example"`,
  'class-name': value =>
    typeof value !== 'string' || value.trim().length === 0
      ? `Must provide a plugin class name, e.g. "Example"`
      : /^[A-z0-9]+$/.test(value)
      ? true
      : `Must be CamelCase, e.g. "Example"`,
  repo: value =>
    typeof value !== 'string' || value.trim().length === 0
      ? true
      : /^https?:\/\//.test(value)
      ? true
      : `Must be a URL, e.g. "https://github.com/<user>/<repo>"`,
  author: () => true,
  license: value =>
    typeof value !== 'string' || value.trim().length === 0
      ? `Must provide a valid license, e.g. "MIT"`
      : true,
  description: () => true,
  dir: value =>
    typeof value !== 'string' || value.trim().length === 0
      ? `Must provide a directory, e.g. "my-plugin"`
      : true,
};

export const getOptions = (): Options =>
  OPTIONS.reduce((opts, option) => {
    const value = getOptionValue(process.argv, `--${option}`);
    const validatorResult = VALIDATORS[option](value);

    if (typeof validatorResult === 'string') {
      debug(`invalid option: --%s %O: %s`, option, value, validatorResult);
    }

    opts[option] = validatorResult === true ? value : undefined;

    return opts;
  }, {} as Options);
