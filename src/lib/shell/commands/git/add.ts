import { ShellContext } from '../../context';
import * as git from 'isomorphic-git';
import { listAllFiles } from './helpers';

export async function gitAdd(ctx: ShellContext, args: string[]) {
  if (args.length === 0) {
    ctx.write('Nothing specified, nothing added.\n');
    return;
  }

  const dir = ctx.cwd;
  
  for (const filepath of args) {
    if (filepath === '.') {
      // Add all files
      const files = await listAllFiles(ctx.fs, dir, dir);
      for (const file of files) {
        await git.add({
          fs: ctx.fs,
          dir,
          filepath: file
        });
      }
      ctx.write(`Added all files\n`);
    } else {
      await git.add({
        fs: ctx.fs,
        dir,
        filepath: filepath
      });
      ctx.write(`Added '${filepath}'\n`);
    }
  }
}
