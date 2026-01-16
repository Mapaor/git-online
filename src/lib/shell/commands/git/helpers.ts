import { ShellContext } from '../../context';
import * as git from 'isomorphic-git';

export async function getCurrentBranch(ctx: ShellContext): Promise<string> {
  try {
    return await git.currentBranch({
      fs: ctx.fs,
      dir: ctx.cwd
    }) || 'main';
  } catch {
    return 'main';
  }
}

export async function listAllFiles(fs: { readdir: (path: string) => Promise<string[]>; stat: (path: string) => Promise<{ isDirectory: () => boolean }> }, dir: string, base: string): Promise<string[]> {
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
