import { ShellContext } from '../../context';
import * as git from 'isomorphic-git';
import { getCurrentBranch } from './helpers';

export async function gitCommit(ctx: ShellContext, args: string[]) {
  // Parse commit message from -m flag
  let message = '';
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-m' && i + 1 < args.length) {
      message = args[i + 1];
      break;
    }
  }

  if (!message) {
    ctx.write('error: no commit message provided (use -m "message")\n');
    return;
  }

  const dir = ctx.cwd;
  
  const sha = await git.commit({
    fs: ctx.fs,
    dir,
    message,
    author: {
      name: 'Demo User',
      email: 'demo@example.com'
    }
  });
  
  ctx.write(`[${await getCurrentBranch(ctx)} ${sha.substring(0, 7)}] ${message}\n`);
}
