import { ShellContext } from '../../context';
import * as git from 'isomorphic-git';
import { getCurrentBranch } from './helpers';

export async function gitBranch(ctx: ShellContext, args: string[]) {
  const dir = ctx.cwd;
  
  if (args.length === 0) {
    // List branches
    const branches = await git.listBranches({ fs: ctx.fs, dir });
    const currentBranch = await getCurrentBranch(ctx);
    
    for (const branch of branches) {
      if (branch === currentBranch) {
        ctx.write(`* \x1b[32m${branch}\x1b[0m\n`);
      } else {
        ctx.write(`  ${branch}\n`);
      }
    }
  } else {
    // Create new branch
    const branchName = args[0];
    await git.branch({ fs: ctx.fs, dir, ref: branchName });
    ctx.write(`Created branch '${branchName}'\n`);
  }
}
