import { ShellContext } from '../context';

export async function exit(ctx: ShellContext) {
  ctx.write('bye\n');
  // Restarts xterm terminal?
}
