import { ShellContext } from '../context';
import { gitInit } from './git/init';
import { gitAdd } from './git/add';
import { gitCommit } from './git/commit';
import { gitStatus } from './git/status';
import { gitLog } from './git/log';
import { gitBranch } from './git/branch';
import { gitCheckout } from './git/checkout';
import { gitClone } from './git/clone';
import { gitPush } from './git/push';
import { gitPull } from './git/pull';
import { gitFetch } from './git/fetch';
import { gitMerge } from './git/merge';
import { gitTag } from './git/tag';
import { gitRemote } from './git/remote';
import { gitReset } from './git/reset';
import { gitDiff } from './git/diff';

export async function gitCommand(ctx: ShellContext, args: string[]) {
  if (args.length === 0) {
    ctx.write('usage: git <command> [<args>]\n');
    ctx.write('\nAvailable commands:\n');
    ctx.write('  init      - Initialize a new git repository\n');
    ctx.write('  clone     - Clone a repository into a new directory\n');
    ctx.write('  add       - Add file contents to the index\n');
    ctx.write('  commit    - Record changes to the repository\n');
    ctx.write('  status    - Show the working tree status\n');
    ctx.write('  log       - Show commit logs\n');
    ctx.write('  diff      - Show changes between commits, commit and working tree, etc\n');
    ctx.write('  branch    - List or create branches\n');
    ctx.write('  checkout  - Switch branches or restore files\n');
    ctx.write('  merge     - Join two or more development histories together\n');
    ctx.write('  tag       - Create, list, or delete tags\n');
    ctx.write('  remote    - Manage set of tracked repositories\n');
    ctx.write('  fetch     - Download objects and refs from another repository\n');
    ctx.write('  pull      - Fetch from and integrate with another repository or branch\n');
    ctx.write('  push      - Update remote refs along with associated objects\n');
    ctx.write('  reset     - Reset current HEAD to the specified state\n');
    return;
  }

  const subcommand = args[0];
  const subArgs = args.slice(1);

  try {
    switch (subcommand) {
      case 'init':
        await gitInit(ctx, subArgs);
        break;
      case 'clone':
        await gitClone(ctx, subArgs);
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
      case 'diff':
        await gitDiff(ctx, subArgs);
        break;
      case 'branch':
        await gitBranch(ctx, subArgs);
        break;
      case 'checkout':
        await gitCheckout(ctx, subArgs);
        break;
      case 'merge':
        await gitMerge(ctx, subArgs);
        break;
      case 'tag':
        await gitTag(ctx, subArgs);
        break;
      case 'remote':
        await gitRemote(ctx, subArgs);
        break;
      case 'fetch':
        await gitFetch(ctx, subArgs);
        break;
      case 'pull':
        await gitPull(ctx, subArgs);
        break;
      case 'push':
        await gitPush(ctx, subArgs);
        break;
      case 'reset':
        await gitReset(ctx, subArgs);
        break;
      default:
        ctx.write(`git: '${subcommand}' is not a git command. See 'git' for help.\n`);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    ctx.write(`git ${subcommand}: ${message}\n`);
  }
}
