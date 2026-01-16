export interface ShellContext {
  fs: any;                // LightningFS.promises
  cwd: string;
  write: (text: string) => void;
  clear: () => void;
}
