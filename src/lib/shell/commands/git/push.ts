import { ShellContext } from '../../context';
import * as git from 'isomorphic-git';
import http from 'isomorphic-git/http/web';
import { getCurrentBranch } from './helpers';

export async function gitPush(ctx: ShellContext, args: string[]) {
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
  
  ctx.write(`Pushing to ${remote}...\n`);
  
  try {
    const result = await git.push({
      fs: ctx.fs,
      http,
      dir,
      remote,
      ref,
      corsProxy: 'https://cors.isomorphic-git.org'
    });
    
    if (result.ok) {
      ctx.write(`Successfully pushed to ${remote}/${ref}\n`);
    } else {
      ctx.write(`Push rejected\n`);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    ctx.write(`error: ${message}\n`);
  }
}
