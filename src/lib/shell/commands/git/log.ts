import { ShellContext } from '../../context';
import * as git from 'isomorphic-git';

export async function gitLog(ctx: ShellContext) {
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
