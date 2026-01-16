import { ShellContext } from '../context';
import { gitInit } from './git/init';
import { gitAdd } from './git/add';
import { gitCommit } from './git/commit';
import { gitStatus } from './git/status';
import { gitLog } from './git/log';
import { gitBranch } from './git/branch';
import { gitCheckout } from './git/checkout';

export async function gitCommand(ctx: ShellContext, args: string[]) {
  if (args.length === 0) {
    ctx.write('usage: git <command> [<args>]\n');
    ctx.write('\nAvailable commands:\n');
    ctx.write('  init      - Initialize a new git repository\n');
    ctx.write('  add       - Add file contents to the index\n');
    ctx.write('  commit    - Record changes to the repository\n');
    ctx.write('  status    - Show the working tree status\n');
    ctx.write('  log       - Show commit logs\n');
    ctx.write('  branch    - List or create branches\n');
    ctx.write('  checkout  - Switch branches or restore files\n');
    return;
  }

  const subcommand = args[0];
  const subArgs = args.slice(1);

  try {
    switch (subcommand) {
      case 'init':
        await gitInit(ctx, subArgs);
        break;
      case 'add':
        await gitAdd(ctx, subArgs);
        break;
      case 'commit':
        await gitCommit(ctx, subArgs);
        break;
      case 'status':
        await gitStatus(ctx);
        break;
      case 'log':
        await gitLog(ctx);
        break;
      case 'branch':
        await gitBranch(ctx, subArgs);
        break;
      case 'checkout':
        await gitCheckout(ctx, subArgs);
        break;
      default:
        ctx.write(`git: '${subcommand}' is not a git command. See 'git' for help.\n`);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    ctx.write(`git ${subcommand}: ${message}\n`);
  }
}
