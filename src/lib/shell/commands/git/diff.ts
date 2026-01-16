import { ShellContext } from '../../context';
import * as git from 'isomorphic-git';

export async function gitDiff(ctx: ShellContext, args: string[]) {
  const dir = ctx.cwd;
  
  try {
    // Check for --name-status flag
    const nameStatus = args.includes('--name-status');
    const commitArgs = args.filter(arg => !arg.startsWith('--'));
    
    let commitHash1 = 'HEAD';
    let commitHash2: string | undefined;
    
    if (commitArgs.length >= 1) {
      commitHash1 = commitArgs[0];
    }
    if (commitArgs.length >= 2) {
      commitHash2 = commitArgs[1];
    }
    
    // If two commits specified, compare them
    if (commitHash2) {
      await diffCommits(ctx, dir, commitHash1, commitHash2, nameStatus);
    } else {
      // Compare commit to working directory
      await diffCommitToWorkdir(ctx, dir, commitHash1, nameStatus);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    ctx.write(`error: ${message}\n`);
  }
}

async function diffCommits(
  ctx: ShellContext, 
  dir: string, 
  commitHash1: string, 
  commitHash2: string,
  nameStatus: boolean
) {
  const changes = await git.walk({
    fs: ctx.fs,
    dir,
    trees: [git.TREE({ ref: commitHash1 }), git.TREE({ ref: commitHash2 })],
    map: async function(filepath, [A, B]) {
      // ignore directories
      if (filepath === '.') {
        return;
      }
      if ((await A?.type()) === 'tree' || (await B?.type()) === 'tree') {
        return;
      }

      // generate ids
      const Aoid = await A?.oid();
      const Boid = await B?.oid();

      // determine modification type
      let type = 'equal';
      if (Aoid !== Boid) {
        type = 'modify';
      }
      if (Aoid === undefined) {
        type = 'add';
      }
      if (Boid === undefined) {
        type = 'remove';
      }

      if (type === 'equal') {
        return;
      }

      return {
        path: filepath,
        type: type,
      };
    },
  });

  const filtered = changes.filter(Boolean);
  
  if (filtered.length === 0) {
    return;
  }

  for (const change of filtered) {
    if (!change) continue;
    
    if (nameStatus) {
      let status = 'M';
      if (change.type === 'add') status = 'A';
      if (change.type === 'remove') status = 'D';
      ctx.write(`${status}\t${change.path}\n`);
    } else {
      ctx.write(`\x1b[1mdiff --git a/${change.path} b/${change.path}\x1b[0m\n`);
      
      if (change.type === 'add') {
        ctx.write(`\x1b[32m+++ b/${change.path}\x1b[0m\n`);
        ctx.write(`\x1b[32m(new file)\x1b[0m\n`);
      } else if (change.type === 'remove') {
        ctx.write(`\x1b[31m--- a/${change.path}\x1b[0m\n`);
        ctx.write(`\x1b[31m(deleted)\x1b[0m\n`);
      } else {
        ctx.write(`\x1b[1m--- a/${change.path}\x1b[0m\n`);
        ctx.write(`\x1b[1m+++ b/${change.path}\x1b[0m\n`);
        ctx.write(`(modified)\n`);
      }
      ctx.write('\n');
    }
  }
}

async function diffCommitToWorkdir(
  ctx: ShellContext,
  dir: string,
  commitHash: string,
  nameStatus: boolean
) {
  // Use statusMatrix to compare HEAD with working directory
  const status = await git.statusMatrix({
    fs: ctx.fs,
    dir
  });
  
  let foundChanges = false;
  
  for (const [filepath, HEADStatus, workdirStatus, stageStatus] of status) {
    if (filepath.startsWith('.git/')) continue;
    
    const head = HEADStatus;
    const workdir = workdirStatus;
    
    // Determine change type
    let type: string | null = null;
    if (head === 0 && workdir === 2) {
      type = 'add';
    } else if (head === 1 && workdir === 0) {
      type = 'remove';
    } else if (head === 1 && workdir === 2) {
      type = 'modify';
    }
    
    if (!type) continue;
    
    foundChanges = true;
    
    if (nameStatus) {
      let status = 'M';
      if (type === 'add') status = 'A';
      if (type === 'remove') status = 'D';
      ctx.write(`${status}\t${filepath}\n`);
    } else {
      ctx.write(`\x1b[1mdiff --git a/${filepath} b/${filepath}\x1b[0m\n`);
      
      if (type === 'add') {
        ctx.write(`\x1b[32m+++ b/${filepath}\x1b[0m\n`);
        ctx.write(`\x1b[32m(new file)\x1b[0m\n`);
      } else if (type === 'remove') {
        ctx.write(`\x1b[31m--- a/${filepath}\x1b[0m\n`);
        ctx.write(`\x1b[31m(deleted)\x1b[0m\n`);
      } else {
        ctx.write(`\x1b[1m--- a/${filepath}\x1b[0m\n`);
        ctx.write(`\x1b[1m+++ b/${filepath}\x1b[0m\n`);
        ctx.write(`(modified)\n`);
      }
      ctx.write('\n');
    }
  }
}
