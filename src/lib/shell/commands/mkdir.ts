import { ShellContext } from '../context';
import { resolvePath } from '../utils';

export async function mkdir(ctx: ShellContext, args: string[]) {
  for (const d of args) {
    await ctx.fs.mkdir(resolvePath(ctx.cwd, d), { recursive: true } as unknown as Parameters<typeof ctx.fs.mkdir>[1]);
  }
}
