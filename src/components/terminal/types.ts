import type { Terminal } from '@xterm/xterm';
import type { FitAddon } from '@xterm/addon-fit';
import type FS from '@isomorphic-git/lightning-fs';
import type { Shell } from '@/lib/shell/Shell';

export interface TerminalRefs {
  terminal: Terminal | null;
  fitAddon: FitAddon | null;
  shell: Shell | null;
  fs: FS | null;
}

export interface TerminalState {
  currentLine: string;
  cwd: string;
  history: string[];
  historyIndex: number;
  isInitialized: boolean;
}
