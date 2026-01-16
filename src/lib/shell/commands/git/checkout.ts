import { ShellContext } from '../../context';
import * as git from 'isomorphic-git';

export async function gitCheckout(ctx: ShellContext, args: string[]) {
  if (args.length === 0) {
    ctx.write('error: branch name required\n');
    return;
  }

  const dir = ctx.cwd;
  const ref = args[0];
  
  await git.checkout({
    fs: ctx.fs,
    dir,
    ref
  });
  
  ctx.write(`Switched to branch '${ref}'\n`);
}
