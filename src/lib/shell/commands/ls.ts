import { ShellContext } from '../context';
import { resolvePath } from '../utils';

export async function ls(ctx: ShellContext, [path]: string[]) {
  const p = resolvePath(ctx.cwd, path ?? '.');
  const files = await ctx.fs.readdir(p);
  ctx.write(files.join('  ') + '\n');
}
