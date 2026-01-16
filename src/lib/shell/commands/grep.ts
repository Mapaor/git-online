import { ShellContext } from '../context';
import { resolvePath } from '../utils';

export async function grep(ctx: ShellContext, [pattern, file]: string[]) {
  const re = new RegExp(pattern);
  const data = await ctx.fs.readFile(resolvePath(ctx.cwd, file), 'utf8');
  for (const line of data.split('\n')) {
    if (re.test(line)) ctx.write(line + '\n');
  }
}
