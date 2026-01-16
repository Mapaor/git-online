import { ShellContext } from '../../context';
import * as git from 'isomorphic-git';
import { resolvePath } from '../../utils';

export async function gitInit(ctx: ShellContext, args: string[]) {
  const dir = resolvePath(ctx.cwd, args[0] || '.');
  
  await git.init({
    fs: ctx.fs,
    dir,
    defaultBranch: 'main'
  });
  
  ctx.write(`Initialized empty Git repository in ${dir}/.git/\n`);
}
