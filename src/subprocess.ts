import * as cp from 'child_process';
import kleur from 'kleur';

export const spawn = cp.spawn;

export const run = async (cmd: string, args: readonly string[], options: cp.SpawnOptions): Promise<void> => {
  process.stdout.write(
    `\n${kleur.cyan(`> ${cmd} ${args.map((arg) => (arg.includes(' ') ? `"${arg}"` : arg)).join(' ')}`)}\n`,
  );

  await wait(spawn(cmd, args, options));
};

export const wait = async (p: cp.ChildProcess): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    p.on('error', reject);

    p.on('close', (code, signal) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`bad subprocess exit (code=${code}, signal=${signal})`));
      }
    });
  });
};
