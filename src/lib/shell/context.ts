import type FS from '@isomorphic-git/lightning-fs';

export interface ShellContext {
  fs: FS['promises'];
  cwd: string;
  write: (text: string) => void;
  clear: () => void;
}
