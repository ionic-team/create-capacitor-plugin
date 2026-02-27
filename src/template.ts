import { readFile, rmdir, mkdir, writeFile, unlink, readdir, rm } from 'fs/promises';
import Mustache from 'mustache';
import { dirname, join, resolve, sep } from 'path';
import { extract } from 'tar';

import type { OptionValues } from './options';

const MUSTACHE_EXTENSION = '.mustache';

export const CAPACITOR_VERSION = '8.0.0';

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
  const androidLang = details['android-lang'].toLowerCase();
  await mkdir(dir, { recursive: true });
  await extract({
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
  await deleteUnnecessaryFolders(dir, androidLang);
  await Promise.all(templateFolders.map((p) => resolve(dir, p)).map((p) => rm(p, { recursive: true })));
};

const deleteUnnecessaryFolders = async (dir: string, androidLang: string): Promise<void> => {
  const androidFolder = join(dir, 'android', 'src', 'main');
  const javaFolder = join(androidFolder, 'java');
  const kotlinFolder = join(androidFolder, 'kotlin');

  if (androidLang === 'kotlin' && await folderExists(javaFolder)) {
    await rm(javaFolder, { recursive: true });
  }

  if (androidLang === 'java' && await folderExists(kotlinFolder)) {
    await rm(kotlinFolder, { recursive: true });
  }
};

const folderExists = async (folderPath: string): Promise<boolean> => {
  try {
    const files = await readdir(folderPath);
    return files != null;
  } catch (err) {
    return false;
  }
};

export const applyTemplate = async (
  p: string,
  { name, 'package-id': packageId, 'class-name': className, repo, author, license, description, 'android-lang': androidLang }: OptionValues,
): Promise<void> => {
  const template = await readFile(p, { encoding: 'utf8' });

  const conditionalView = {
    KOTLIN: androidLang.toLowerCase() === 'kotlin',  // Set KOTLIN flag
    // Add more flags...
  }

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
    ANDROID_LANG: androidLang,
  };

  const combinedView = { ...view, ...conditionalView };
  const intermediateContents = Mustache.render(template, combinedView);
  const finalContents = Mustache.render(intermediateContents, view);
  let filePath = p.substring(0, p.length - MUSTACHE_EXTENSION.length);
  filePath = Object.entries(view).reduce(
    (acc, [key, value]) => (value ? acc.replaceAll(`__${key}__`, value.toString()) : acc),
    filePath,
  );

  await mkdir(dirname(filePath), { recursive: true });
  // take off the .mustache extension and write the file, then remove the template
  await writeFile(filePath, finalContents, { encoding: 'utf8' });

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
