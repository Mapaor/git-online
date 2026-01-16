import { ShellContext } from '../../context';
import * as git from 'isomorphic-git';
import http from 'isomorphic-git/http/web';

export async function gitFetch(ctx: ShellContext, args: string[]) {
  const dir = ctx.cwd;
  const remote = args[0] || 'origin';
  
  ctx.write(`Fetching from ${remote}...\n`);
  
  try {
    await git.fetch({
      fs: ctx.fs,
      http,
      dir,
      remote,
      corsProxy: 'https://cors.isomorphic-git.org',
      prune: true
    });
    
    ctx.write('Successfully fetched\n');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    ctx.write(`error: ${message}\n`);
  }
}
