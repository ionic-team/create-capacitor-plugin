import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { pipe } from './fn.mjs';

export const root = pipe(fileURLToPath, ...Array(3).fill(dirname))(import.meta.url);
