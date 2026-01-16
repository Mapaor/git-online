import { ShellContext } from '../../context';
import * as git from 'isomorphic-git';
import http from 'isomorphic-git/http/web';
import { getCurrentBranch } from './helpers';

export async function gitPull(ctx: ShellContext, args: string[]) {
  const dir = ctx.cwd;
  
  // Parse arguments
  let remote = 'origin';
  let ref = await getCurrentBranch(ctx);
  
  if (args.length > 0) {
    remote = args[0];
  }
  if (args.length > 1) {
    ref = args[1];
  }
  
  ctx.write(`Pulling from ${remote}...\n`);
  
  try {
    await git.pull({
      fs: ctx.fs,
      http,
      dir,
      ref,
      remote,
      corsProxy: 'https://cors.isomorphic-git.org',
      author: {
        name: 'Demo User',
        email: 'demo@example.com'
      }
    });
    
    ctx.write('Successfully pulled changes\n');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    ctx.write(`error: ${message}\n`);
  }
}
