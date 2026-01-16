import { useEffect, useRef } from 'react';
import type { Terminal } from '@xterm/xterm';
import type { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import FS from '@isomorphic-git/lightning-fs';
import { Shell } from '@/lib/shell/Shell';
import { ShellContext } from '@/lib/shell/context';
import { writePrompt, writeWelcomeMessage } from './utils';
import { createInputHandler } from './inputHandler';

export const useTerminal = (containerRef: React.RefObject<HTMLDivElement | null>) => {
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const shellRef = useRef<Shell | null>(null);
  const fsRef = useRef<FS | null>(null);
  
  const currentLineRef = useRef('');
  const cwdRef = useRef('/home');
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const isInitializedRef = useRef(false);
  const isInitializingRef = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (isInitializingRef.current || xtermRef.current) {
      return;
    }
    
    if (!containerRef.current) {
      return;
    }
    
    isInitializingRef.current = true;

    // Cleanup function to prevent double-mounting issues
    let mounted = true;

    const initTerminal = async () => {
      const { Terminal: XTerminal } = await import('@xterm/xterm');
      const { FitAddon: XTermFitAddon } = await import('@xterm/addon-fit');
      
      if (!mounted) {
        return;
      }
      
      if (!containerRef.current || containerRef.current.offsetWidth === 0 || containerRef.current.offsetHeight === 0) {
        return;
      }

      const fs = new FS('git-online-fs');
      fsRef.current = fs;

      const term = new XTerminal({
        cursorBlink: true,
        cursorStyle: 'block',
        fontSize: 15,
        lineHeight: 1.4,
        fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", Consolas, monospace',
        fontWeight: '400',
        fontWeightBold: '700',
        letterSpacing: 0,
        theme: {
          background: '#0d1117',
          foreground: '#c9d1d9',
          cursor: '#58a6ff',
          cursorAccent: '#0d1117',
          // selection: 'rgba(88, 166, 255, 0.3)',
          black: '#484f58',
          red: '#ff7b72',
          green: '#3fb950',
          yellow: '#d29922',
          blue: '#58a6ff',
          magenta: '#bc8cff',
          cyan: '#39c5cf',
          white: '#b1bac4',
          brightBlack: '#6e7681',
          brightRed: '#ffa198',
          brightGreen: '#56d364',
          brightYellow: '#e3b341',
          brightBlue: '#79c0ff',
          brightMagenta: '#d2a8ff',
          brightCyan: '#56d4dd',
          brightWhite: '#f0f6fc',
        },
        rows: 30,
        scrollback: 10000,
        allowTransparency: false,
        convertEol: true,
      });

      const fitAddon = new XTermFitAddon();
      term.loadAddon(fitAddon);
      
      if (!mounted || !containerRef.current) {
        term.dispose();
        return;
      }
      
      term.open(containerRef.current as HTMLElement);
      term.refresh(0, term.rows - 1);
      
      setTimeout(() => {
        if (!mounted) {
          return;
        }
        fitAddon.fit();
      }, 0);

      if (!mounted) {
        term.dispose();
        return;
      }

      xtermRef.current = term;
      fitAddonRef.current = fitAddon;

      const ctx: ShellContext = {
        fs: fs.promises,
        cwd: cwdRef.current,
        write: (text: string) => {
          term.write(text);
        },
        clear: () => {
          term.clear();
        },
      };

      const shell = new Shell(ctx);
      shellRef.current = shell;

      try {
        if (!mounted) {
          return;
        }
        
        try {
          await fs.promises.mkdir('/home');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          if (err.code !== 'EEXIST') {
            console.error('Error creating home directory:', err);
          }
        }
        cwdRef.current = '/home';
        isInitializedRef.current = true;
        
        setTimeout(() => {
          if (!mounted) {
            return;
          }
          
          writeWelcomeMessage(term);
          writePrompt(term, cwdRef.current);
          term.focus();
        }, 100);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error('Failed to initialize filesystem:', err);
        term.writeln('\x1b[1;31mError: ' + (err.message || err) + '\x1b[0m\r\n');
      }

      if (!mounted) {
        term.dispose();
        return;
      }
      
      const inputHandler = createInputHandler({
        term,
        shell,
        cwdRef,
        currentLineRef,
        historyRef,
        historyIndexRef,
        isInitializedRef,
      });

      const disposable = term.onData(inputHandler);

      // Handle window resize
      const handleResize = () => {
        fitAddon.fit();
      };
      window.addEventListener('resize', handleResize);

      cleanupRef.current = () => {
        mounted = false;
        isInitializingRef.current = false;
        window.removeEventListener('resize', handleResize);
        if (xtermRef.current) {
          xtermRef.current.dispose();
          xtermRef.current = null;
        }
        fitAddonRef.current = null;
        shellRef.current = null;
        fsRef.current = null;
        isInitializedRef.current = false;
      };
    };
    
    initTerminal();
    
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [containerRef]);

  return {
    xtermRef,
    fitAddonRef,
    shellRef,
    fsRef,
  };
};
