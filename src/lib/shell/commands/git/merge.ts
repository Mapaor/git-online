import { ShellContext } from '../../context';
import * as git from 'isomorphic-git';

export async function gitMerge(ctx: ShellContext, args: string[]) {
  if (args.length === 0) {
    ctx.write('error: branch name required\n');
    ctx.write('usage: git merge <branch>\n');
    return;
  }

  const dir = ctx.cwd;
  const theirBranch = args[0];
  
  try {
    const result = await git.merge({
      fs: ctx.fs,
      dir,
      ours: await git.currentBranch({ fs: ctx.fs, dir }) || 'main',
      theirs: theirBranch,
      author: {
        name: 'Demo User',
        email: 'demo@example.com'
      }
    });
    
    if (result.alreadyMerged) {
      ctx.write('Already up to date.\n');
    } else {
      ctx.write(`Merge made by the 'recursive' strategy.\n`);
      ctx.write(`${result.oid?.substring(0, 7) || ''}\n`);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('conflict')) {
      ctx.write(`CONFLICT: Merge conflict detected\n`);
      ctx.write(`Automatic merge failed; fix conflicts and then commit the result.\n`);
    } else {
      ctx.write(`error: ${message}\n`);
    }
  }
}
