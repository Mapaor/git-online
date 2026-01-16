import { ShellContext } from '../context';
import { resolvePath } from '../utils';

export async function mv(ctx: ShellContext, [src, dst]: string[]) {
  await ctx.fs.rename(
    resolvePath(ctx.cwd, src),
    resolvePath(ctx.cwd, dst)
  );
}
