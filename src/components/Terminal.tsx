'use client';

import { useRef } from 'react';
import { useTerminal } from './terminal/useTerminal';

export default function TerminalComponent() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const { xtermRef } = useTerminal(terminalRef);

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#0d1117',
      borderRadius: '8px',
      overflow: 'hidden',
    }}>
      <div 
        ref={terminalRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          padding: '16px',
          cursor: 'text',
        }}
        onClick={() => {
          xtermRef.current?.focus();
        }}
      />
    </div>
  );
}
