import { ShellContext } from '../../context';
import * as git from 'isomorphic-git';

export async function gitTag(ctx: ShellContext, args: string[]) {
  const dir = ctx.cwd;
  
  if (args.length === 0) {
    // List tags
    try {
      const tags = await git.listTags({ fs: ctx.fs, dir });
      
      if (tags.length === 0) {
        return;
      }
      
      for (const tag of tags) {
        ctx.write(`${tag}\n`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      ctx.write(`error: ${message}\n`);
    }
  } else if (args[0] === '-d' && args.length > 1) {
    // Delete tag
    const tagName = args[1];
    try {
      await git.deleteTag({ fs: ctx.fs, dir, ref: tagName });
      ctx.write(`Deleted tag '${tagName}'\n`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      ctx.write(`error: ${message}\n`);
    }
  } else {
    // Create tag
    const tagName = args[0];
    let message = '';
    
    // Check for -m flag
    for (let i = 1; i < args.length; i++) {
      if (args[i] === '-m' && i + 1 < args.length) {
        message = args[i + 1];
        break;
      }
    }
    
    try {
      if (message) {
        // Annotated tag
        await git.annotatedTag({
          fs: ctx.fs,
          dir,
          ref: tagName,
          message,
          tagger: {
            name: 'Demo User',
            email: 'demo@example.com'
          }
        });
      } else {
        // Lightweight tag
        await git.tag({
          fs: ctx.fs,
          dir,
          ref: tagName
        });
      }
      ctx.write(`Created tag '${tagName}'\n`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      ctx.write(`error: ${message}\n`);
    }
  }
}
