import { readFile, rmdir, mkdir, writeFile, unlink } from 'fs/promises';
import Mustache from 'mustache';
import { dirname, join, resolve, sep } from 'path';
import tar from 'tar';

import type { OptionValues } from './options';

const MUSTACHE_EXTENSION = '.mustache';

export const CAPACITOR_VERSION = '^6.0.0';

const TEMPLATE_PATH = resolve(__dirname, '..', 'assets', 'plugin-template.tar.gz');

const WWW_TEMPLATE_PATH = resolve(__dirname, '..', 'assets', 'www-template.tar.gz');

export const readPackageJson = async (p: string): Promise<{ [key: string]: any }> => {
  const contents = await readFile(p, { encoding: 'utf8' });
  return JSON.parse(contents);
};

export const extractTemplate = async (
  dir: string,
  details: OptionValues,
  type: 'PLUGIN_TEMPLATE' | 'WWW_TEMPLATE',
): Promise<void> => {
  const templateFiles: string[] = [];
  const templateFolders: string[] = [];
  await mkdir(dir, { recursive: true });
  await tar.extract({
    file: type === 'PLUGIN_TEMPLATE' ? TEMPLATE_PATH : WWW_TEMPLATE_PATH,
    cwd: dir,
    filter: (p) => {
      if (p.endsWith(MUSTACHE_EXTENSION)) {
        templateFiles.push(p);
      }
      if (p.endsWith('__CLASS__Plugin/') || p.endsWith('__CLASS__PluginTests/')) {
        templateFolders.push(p);
      }
      return true;
    },
  });

  await Promise.all(templateFiles.map((p) => resolve(dir, p)).map((p) => applyTemplate(p, details)));
  await Promise.all(templateFolders.map((p) => resolve(dir, p)).map((p) => rmdir(p)));
};

export const applyTemplate = async (
  p: string,
  { name, 'package-id': packageId, 'class-name': className, repo, author, license, description }: OptionValues,
): Promise<void> => {
  const template = await readFile(p, { encoding: 'utf8' });
  const view = {
    CAPACITOR_VERSION: CAPACITOR_VERSION,
    PACKAGE_NAME: name,
    PACKAGE_ID: packageId,
    NATIVE_NAME: packageNameToNative(name),
    CLASS: className,
    JAVA_PATH: join(packageId.split('.').join(sep), className),
    REPO_URL: repo ? repo.replace(/\/$/, '') : '',
    AUTHOR: author,
    LICENSE: license,
    DESCRIPTION: description,
  };

  const contents = Mustache.render(template, view);
  const filePath = Object.entries(view).reduce(
    (acc, [key, value]) => (value ? acc.replaceAll(`__${key}__`, value) : acc),
    p.substring(0, p.length - MUSTACHE_EXTENSION.length),
  );

  await mkdir(dirname(filePath), { recursive: true });
  // take off the .mustache extension and write the file, then remove the template
  await writeFile(filePath, contents, { encoding: 'utf8' });

  await unlink(p);
};

export function packageNameToNative(name: string): string {
  name = name
    .replace(/\//g, '_')
    .replace(/-/g, '_')
    .replace(/@/g, '')
    .replace(/_\w/g, (m) => m[1].toUpperCase());

  return name.charAt(0).toUpperCase() + name.slice(1);
}
