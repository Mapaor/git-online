import { ShellContext } from '../../context';
import * as git from 'isomorphic-git';

export async function gitReset(ctx: ShellContext, args: string[]) {
  const dir = ctx.cwd;
  
  // Parse mode
  let mode: 'hard' | 'soft' | 'mixed' = 'mixed';
  let ref = 'HEAD';
  
  for (const arg of args) {
    if (arg === '--hard') {
      mode = 'hard';
    } else if (arg === '--soft') {
      mode = 'soft';
    } else if (arg === '--mixed') {
      mode = 'mixed';
    } else if (!arg.startsWith('--')) {
      ref = arg;
    }
  }
  
  try {
    // For now, we'll use resetIndex which is available in isomorphic-git
    // Full reset with --hard would need additional file system operations
    if (mode === 'hard') {
      ctx.write('warning: --hard reset not fully supported, performing index reset only\n');
    }
    
    // resetIndex requires a filepath; reset all files in the working dir's index
    const files = await git.listFiles({ fs: ctx.fs, dir });
    for (const filepath of files) {
      await git.resetIndex({
        fs: ctx.fs,
        dir,
        filepath,
        ref
      });
    }
    
    ctx.write(`Reset to ${ref}\n`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    ctx.write(`error: ${message}\n`);
  }
}
