import { ShellContext } from '../context';
import * as git from 'isomorphic-git';
import { resolvePath } from '../utils';

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

async function gitInit(ctx: ShellContext, args: string[]) {
  const dir = resolvePath(ctx.cwd, args[0] || '.');
  
  await git.init({
    fs: ctx.fs,
    dir,
    defaultBranch: 'main'
  });
  
  ctx.write(`Initialized empty Git repository in ${dir}/.git/\n`);
}

async function gitAdd(ctx: ShellContext, args: string[]) {
  if (args.length === 0) {
    ctx.write('Nothing specified, nothing added.\n');
    return;
  }

  const dir = ctx.cwd;
  
  for (const filepath of args) {
    if (filepath === '.') {
      // Add all files
      const files = await listAllFiles(ctx.fs, dir, dir);
      for (const file of files) {
        await git.add({
          fs: ctx.fs,
          dir,
          filepath: file
        });
      }
      ctx.write(`Added all files\n`);
    } else {
      await git.add({
        fs: ctx.fs,
        dir,
        filepath: filepath
      });
      ctx.write(`Added '${filepath}'\n`);
    }
  }
}

async function gitCommit(ctx: ShellContext, args: string[]) {
  // Parse commit message from -m flag
  let message = '';
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-m' && i + 1 < args.length) {
      message = args[i + 1];
      break;
    }
  }

  if (!message) {
    ctx.write('error: no commit message provided (use -m "message")\n');
    return;
  }

  const dir = ctx.cwd;
  
  const sha = await git.commit({
    fs: ctx.fs,
    dir,
    message,
    author: {
      name: 'Demo User',
      email: 'demo@example.com'
    }
  });
  
  ctx.write(`[${await getCurrentBranch(ctx)} ${sha.substring(0, 7)}] ${message}\n`);
}

async function gitStatus(ctx: ShellContext) {
  const dir = ctx.cwd;
  
  try {
    const status = await git.statusMatrix({
      fs: ctx.fs,
      dir
    });

    const branch = await getCurrentBranch(ctx);
    ctx.write(`On branch ${branch}\n`);

    const staged: string[] = [];
    const modified: string[] = [];
    const untracked: string[] = [];

    for (const [filepath, HEADStatus, workdirStatus, stageStatus] of status) {
      // Skip .git directory
      if (filepath.startsWith('.git/')) continue;

      const head = HEADStatus;
      const workdir = workdirStatus;
      const stage = stageStatus;

      if (stage === 2 && head === 1 && workdir === 2) {
        // Modified and staged
        staged.push(filepath);
      } else if (stage === 2 && head === 0) {
        // New file staged
        staged.push(filepath);
      } else if (workdir === 2 && stage === 1) {
        // Modified but not staged
        modified.push(filepath);
      } else if (workdir === 2 && head === 0 && stage === 0) {
        // Untracked
        untracked.push(filepath);
      }
    }

    if (staged.length === 0 && modified.length === 0 && untracked.length === 0) {
      ctx.write('nothing to commit, working tree clean\n');
      return;
    }

    if (staged.length > 0) {
      ctx.write('\nChanges to be committed:\n');
      for (const file of staged) {
        ctx.write(`  \x1b[32mnew file:   ${file}\x1b[0m\n`);
      }
    }

    if (modified.length > 0) {
      ctx.write('\nChanges not staged for commit:\n');
      for (const file of modified) {
        ctx.write(`  \x1b[31mmodified:   ${file}\x1b[0m\n`);
      }
    }

    if (untracked.length > 0) {
      ctx.write('\nUntracked files:\n');
      for (const file of untracked) {
        ctx.write(`  \x1b[31m${file}\x1b[0m\n`);
      }
    }
  } catch (err: unknown) {
    if (err instanceof Error && 'code' in err && (err as { code: string }).code === 'NotFoundError') {
      ctx.write('fatal: not a git repository (or any of the parent directories)\n');
    } else {
      throw err;
    }
  }
}

async function gitLog(ctx: ShellContext) {
  const dir = ctx.cwd;
  
  try {
    const commits = await git.log({
      fs: ctx.fs,
      dir,
      depth: 10
    });

    if (commits.length === 0) {
      ctx.write('No commits yet\n');
      return;
    }

    for (const commit of commits) {
      ctx.write(`\x1b[33mcommit ${commit.oid}\x1b[0m\n`);
      ctx.write(`Author: ${commit.commit.author.name} <${commit.commit.author.email}>\n`);
      ctx.write(`Date:   ${new Date(commit.commit.author.timestamp * 1000).toLocaleString()}\n`);
      ctx.write(`\n    ${commit.commit.message}\n\n`);
    }
  } catch (err: unknown) {
    if (err instanceof Error && 'code' in err && (err as { code: string }).code === 'NotFoundError') {
      ctx.write('fatal: your current branch does not have any commits yet\n');
    } else {
      throw err;
    }
  }
}

async function gitBranch(ctx: ShellContext, args: string[]) {
  const dir = ctx.cwd;
  
  if (args.length === 0) {
    // List branches
    const branches = await git.listBranches({ fs: ctx.fs, dir });
    const currentBranch = await getCurrentBranch(ctx);
    
    for (const branch of branches) {
      if (branch === currentBranch) {
        ctx.write(`* \x1b[32m${branch}\x1b[0m\n`);
      } else {
        ctx.write(`  ${branch}\n`);
      }
    }
  } else {
    // Create new branch
    const branchName = args[0];
    await git.branch({ fs: ctx.fs, dir, ref: branchName });
    ctx.write(`Created branch '${branchName}'\n`);
  }
}

async function gitCheckout(ctx: ShellContext, args: string[]) {
  if (args.length === 0) {
    ctx.write('error: branch name required\n');
    return;
  }

  const dir = ctx.cwd;
  const ref = args[0];
  
  await git.checkout({
    fs: ctx.fs,
    dir,
    ref
  });
  
  ctx.write(`Switched to branch '${ref}'\n`);
}

// Helper functions
async function getCurrentBranch(ctx: ShellContext): Promise<string> {
  try {
    return await git.currentBranch({
      fs: ctx.fs,
      dir: ctx.cwd
    }) || 'main';
  } catch {
    return 'main';
  }
}

async function listAllFiles(fs: { readdir: (path: string) => Promise<string[]>; stat: (path: string) => Promise<{ isDirectory: () => boolean }> }, dir: string, base: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await fs.readdir(dir);
  
  for (const entry of entries) {
    if (entry === '.git') continue;
    
    const fullPath = `${dir}/${entry}`;
    const stat = await fs.stat(fullPath);
    
    if (stat.isDirectory()) {
      const subFiles = await listAllFiles(fs, fullPath, base);
      files.push(...subFiles);
    } else {
      const relativePath = fullPath.substring(base.length + 1);
      files.push(relativePath);
    }
  }
  
  return files;
}
