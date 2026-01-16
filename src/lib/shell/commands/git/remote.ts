import { ShellContext } from '../../context';
import * as git from 'isomorphic-git';

export async function gitRemote(ctx: ShellContext, args: string[]) {
  const dir = ctx.cwd;
  
  if (args.length === 0 || args[0] === '-v') {
    // List remotes
    try {
      const remotes = await git.listRemotes({ fs: ctx.fs, dir });
      
      if (remotes.length === 0) {
        return;
      }
      
      const verbose = args[0] === '-v';
      for (const remote of remotes) {
        if (verbose) {
          ctx.write(`${remote.remote}\t${remote.url} (fetch)\n`);
          ctx.write(`${remote.remote}\t${remote.url} (push)\n`);
        } else {
          ctx.write(`${remote.remote}\n`);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      ctx.write(`error: ${message}\n`);
    }
  } else if (args[0] === 'add' && args.length >= 3) {
    // Add remote
    const remoteName = args[1];
    const remoteUrl = args[2];
    
    try {
      await git.addRemote({
        fs: ctx.fs,
        dir,
        remote: remoteName,
        url: remoteUrl
      });
      ctx.write(`Added remote '${remoteName}'\n`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      ctx.write(`error: ${message}\n`);
    }
  } else if (args[0] === 'remove' && args.length >= 2) {
    // Remove remote
    const remoteName = args[1];
    
    try {
      await git.deleteRemote({
        fs: ctx.fs,
        dir,
        remote: remoteName
      });
      ctx.write(`Removed remote '${remoteName}'\n`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      ctx.write(`error: ${message}\n`);
    }
  } else {
    ctx.write('usage: git remote [-v | add <name> <url> | remove <name>]\n');
  }
}
