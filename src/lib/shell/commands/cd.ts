import { ShellContext } from '../context';
import { resolvePath } from '../utils';

export async function cd(ctx: ShellContext, [path]: string[]) {
  if (!path) return;
  const p = resolvePath(ctx.cwd, path);
  const stat = await ctx.fs.stat(p);
  if (!stat.isDirectory()) throw new Error('not a directory');
  ctx.cwd = p;
}
