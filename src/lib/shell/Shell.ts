import { parse } from './parser';
import { commands } from './commands/index';
import { ShellContext } from './context';

export class Shell {
  constructor(private ctx: ShellContext) {}

  get context() {
    return this.ctx;
  }

  async run(line: string) {
    const { cmd, args } = parse(line);
    if (!cmd) return;

    const fn: ((ctx: ShellContext, args: string[]) => Promise<void>) | undefined = commands[cmd];

    if (!fn) {
      this.ctx.write(`command not found: ${cmd}\n`);
      return;
    }

    try {
      await fn(this.ctx, args);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.ctx.write(`error: ${message}\n`);
    }
  }
}
