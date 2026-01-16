import { ShellContext } from '../context';
import { resolvePath } from '../utils';

export async function echo(ctx: ShellContext, args: string[]) {
  if (args.length === 0) return;

  // Cerca redirecció: '>' o '>>'
  const redirectIndex = args.findIndex(a => a === '>' || a === '>>');
  let content: string;
  let filePath: string | null = null;
  let append = false;

  if (redirectIndex !== -1) {
    content = args.slice(0, redirectIndex).join(' ') + '\n';
    append = args[redirectIndex] === '>>';
    filePath = args[redirectIndex + 1];
    if (!filePath) {
      ctx.write('error: no file specified for redirection\n');
      return;
    }
    const path = resolvePath(ctx.cwd, filePath);
    const flag = append ? 'a' : 'w';
    await ctx.fs.writeFile(path, content, { flag } as unknown as Parameters<typeof ctx.fs.writeFile>[2]);
  } else {
    // Sense redirecció, imprimir a terminal
    content = args.join(' ') + '\n';
    ctx.write(content);
  }
}
