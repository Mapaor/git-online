import { MutableRefObject } from 'react';
import type { Terminal } from '@xterm/xterm';
import type { Shell } from '@/lib/shell/Shell';
import { writePrompt } from './utils';

interface InputHandlerParams {
  term: Terminal;
  shell: Shell;
  cwdRef: MutableRefObject<string>;
  currentLineRef: MutableRefObject<string>;
  historyRef: MutableRefObject<string[]>;
  historyIndexRef: MutableRefObject<number>;
  isInitializedRef: MutableRefObject<boolean>;
}

export const createInputHandler = (params: InputHandlerParams) => {
  const { term, shell, cwdRef, currentLineRef, historyRef, historyIndexRef, isInitializedRef } = params;
  let currentLine = '';

  return (data: string) => {
    if (!isInitializedRef.current) {
      return;
    }
    
    const code = data.charCodeAt(0);

    // Handle Enter
    if (code === 13) {
      term.write('\r\n');
      const line = currentLine.trim();
      
      if (line) {
        historyRef.current.push(line);
        historyIndexRef.current = historyRef.current.length;
        
        shell.context.cwd = cwdRef.current;
        
        shell.run(line).then(() => {
          cwdRef.current = shell.context.cwd;
          writePrompt(term, cwdRef.current);
        }).catch((err: Error) => {
          term.writeln(`Error: ${err.message}`);
          writePrompt(term, cwdRef.current);
        });
      } else {
        writePrompt(term, cwdRef.current);
      }
      
      currentLine = '';
      currentLineRef.current = '';
    }
    // Handle Backspace
    else if (code === 127) {
      if (currentLine.length > 0) {
        currentLine = currentLine.slice(0, -1);
        currentLineRef.current = currentLine;
        term.write('\b \b');
      }
    }
    // Handle Ctrl+C
    else if (code === 3) {
      term.write('^C\r\n');
      currentLine = '';
      currentLineRef.current = '';
      writePrompt(term, cwdRef.current);
    }
    // Handle Ctrl+L (clear screen)
    else if (code === 12) {
      term.clear();
      writePrompt(term, cwdRef.current);
    }
    // Handle Up Arrow (history)
    else if (data === '\x1b[A') {
      if (historyRef.current.length > 0 && historyIndexRef.current > 0) {
        term.write('\r\x1b[K');
        writePrompt(term, cwdRef.current);
        
        historyIndexRef.current--;
        currentLine = historyRef.current[historyIndexRef.current];
        currentLineRef.current = currentLine;
        term.write(currentLine);
      }
    }
    // Handle Down Arrow (history)
    else if (data === '\x1b[B') {
      if (historyIndexRef.current < historyRef.current.length) {
        term.write('\r\x1b[K');
        writePrompt(term, cwdRef.current);
        
        historyIndexRef.current++;
        if (historyIndexRef.current >= historyRef.current.length) {
          currentLine = '';
          historyIndexRef.current = historyRef.current.length;
        } else {
          currentLine = historyRef.current[historyIndexRef.current];
        }
        currentLineRef.current = currentLine;
        term.write(currentLine);
      }
    }
    // Handle regular characters
    else if (code >= 32 && code < 127) {
      currentLine += data;
      currentLineRef.current = currentLine;
      term.write(data);
    }
    else {
      // Unhandled character code
    }
  };
};
