import { ShellContext } from '../../context';
import * as git from 'isomorphic-git';
import http from 'isomorphic-git/http/web';

export async function gitClone(ctx: ShellContext, args: string[]) {
  if (args.length === 0) {
    ctx.write('error: repository URL required\n');
    ctx.write('usage: git clone <url> [<directory>]\n');
    return;
  }

  const url = args[0];
  
  // Extract repository name from URL if no directory specified
  let targetDir: string;
  if (args[1]) {
    targetDir = args[1];
  } else {
    // Extract repo name from URL
    // e.g., https://github.com/user/repo.git -> repo
    const urlParts = url.replace(/\.git$/, '').split('/');
    const repoName = urlParts[urlParts.length - 1];
    targetDir = repoName;
  }
  
  const dir = `${ctx.cwd}/${targetDir}`;
  
  ctx.write(`Cloning into '${targetDir}'...\n`);
  
  try {
    await git.clone({
      fs: ctx.fs,
      http,
      dir,
      url,
      corsProxy: 'https://cors.isomorphic-git.org',
      singleBranch: true,
      depth: 1
    });
    
    ctx.write('done.\n');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    ctx.write(`fatal: ${message}\n`);
  }
}
