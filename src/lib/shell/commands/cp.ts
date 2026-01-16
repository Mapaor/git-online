import { ShellContext } from '../context';
import { resolvePath } from '../utils';

export async function cp(ctx: ShellContext, [src, dst]: string[]) {
  const a = resolvePath(ctx.cwd, src);
  const b = resolvePath(ctx.cwd, dst);
  const data = await ctx.fs.readFile(a);
  await ctx.fs.writeFile(b, data);
}
