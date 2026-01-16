import { ShellContext } from '../context';

export async function pwd(ctx: ShellContext) {
  ctx.write(ctx.cwd + '\n');
}
