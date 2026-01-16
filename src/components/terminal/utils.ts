import type { Terminal } from '@xterm/xterm';

export const writePrompt = (term: Terminal, cwd: string) => {
  term.write(`\x1b[38;5;75m${cwd}\x1b[0m \x1b[38;5;120m❯\x1b[0m `);
};

export const writeWelcomeMessage = (term: Terminal) => {
  term.writeln('\x1b[1;38;5;120m╭─ Welcome to Git Online Learning Terminal! ─╮\x1b[0m');
  term.writeln('\x1b[38;5;250m│ Type "help" for available commands          │\x1b[0m');
  term.writeln('\x1b[38;5;250m│ Type "git" for git commands                 │\x1b[0m');
  term.writeln('\x1b[1;38;5;120m╰──────────────────────────────────────────────╯\x1b[0m\n');
};
