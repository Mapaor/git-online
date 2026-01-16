import { ShellContext } from '../../context';
import * as git from 'isomorphic-git';
import { getCurrentBranch } from './helpers';

export async function gitStatus(ctx: ShellContext) {
  const dir = ctx.cwd;
  
  try {
    const status = await git.statusMatrix({
      fs: ctx.fs,
      dir
    });

    const branch = await getCurrentBranch(ctx);
    ctx.write(`On branch ${branch}\n`);

    const staged: string[] = [];
    const modified: string[] = [];
    const untracked: string[] = [];

    for (const [filepath, HEADStatus, workdirStatus, stageStatus] of status) {
      // Skip .git directory
      if (filepath.startsWith('.git/')) continue;

      const head = HEADStatus;
      const workdir = workdirStatus;
      const stage = stageStatus;

      if (stage === 2 && head === 1 && workdir === 2) {
        // Modified and staged
        staged.push(filepath);
      } else if (stage === 2 && head === 0) {
        // New file staged
        staged.push(filepath);
      } else if (workdir === 2 && stage === 1) {
        // Modified but not staged
        modified.push(filepath);
      } else if (workdir === 2 && head === 0 && stage === 0) {
        // Untracked
        untracked.push(filepath);
      }
    }

    if (staged.length === 0 && modified.length === 0 && untracked.length === 0) {
      ctx.write('nothing to commit, working tree clean\n');
      return;
    }

    if (staged.length > 0) {
      ctx.write('\nChanges to be committed:\n');
      for (const file of staged) {
        ctx.write(`  \x1b[32mnew file:   ${file}\x1b[0m\n`);
      }
    }

    if (modified.length > 0) {
      ctx.write('\nChanges not staged for commit:\n');
      for (const file of modified) {
        ctx.write(`  \x1b[31mmodified:   ${file}\x1b[0m\n`);
      }
    }

    if (untracked.length > 0) {
      ctx.write('\nUntracked files:\n');
      for (const file of untracked) {
        ctx.write(`  \x1b[31m${file}\x1b[0m\n`);
      }
    }
  } catch (err: unknown) {
    if (err instanceof Error && 'code' in err && (err as { code: string }).code === 'NotFoundError') {
      ctx.write('fatal: not a git repository (or any of the parent directories)\n');
    } else {
      throw err;
    }
  }
}
