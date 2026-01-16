import { ShellContext } from '../context';

export type CommandFunction = (ctx: ShellContext, args: string[]) => Promise<void>;
export interface CommandMap {
  [name: string]: CommandFunction;
}
