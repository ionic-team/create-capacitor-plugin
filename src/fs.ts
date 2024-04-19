import fs from 'fs';
import util from 'util';

export const mkdir = util.promisify(fs.mkdir);
export const access = util.promisify(fs.access);
export const readFile = util.promisify(fs.readFile);
export const rmdir = util.promisify(fs.rmdir);
export const writeFile = util.promisify(fs.writeFile);
export const unlink = util.promisify(fs.unlink);

export const exists = async (p: string): Promise<boolean> => {
  try {
    await access(p);
  } catch (e) {
    return false;
  }

  return true;
};
