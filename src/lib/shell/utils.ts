export function resolvePath(cwd: string, path: string): string {
  if (path.startsWith('/')) return normalize(path);
  return normalize(`${cwd}/${path}`);
}

function normalize(p: string): string {
  const parts: string[] = [];

  for (const part of p.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') parts.pop();
    else parts.push(part);
  }

  return '/' + parts.join('/');
}
