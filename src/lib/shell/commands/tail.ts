import { ShellContext } from '../context';
import { resolvePath } from '../utils';

export async function tail(ctx: ShellContext, args: string[]) {
  const file = resolvePath(ctx.cwd, args.at(-1)!);
  const n = args[0] === '-n' ? parseInt(args[1]) : 10;
  const data = await ctx.fs.readFile(file, 'utf8');
  const lines = data.split('\n').slice(-n);
  ctx.write(lines.join('\n') + '\n');
}
