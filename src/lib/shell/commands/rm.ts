import { ShellContext } from '../context';
import { resolvePath } from '../utils';

export async function rm(ctx: ShellContext, args: string[]) {
  for (const f of args) {
    const p = resolvePath(ctx.cwd, f);
    await ctx.fs.unlink(p);
  }
}
