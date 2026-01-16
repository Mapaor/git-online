import { ShellContext } from '../context';
import { resolvePath } from '../utils';

export async function cat(ctx: ShellContext, args: string[]) {
  for (const f of args) {
    const p = resolvePath(ctx.cwd, f);
    const data = await ctx.fs.readFile(p, 'utf8');
    ctx.write(data);
  }
}
