'use client';

import dynamic from 'next/dynamic';

const Terminal = dynamic(() => import('../components/Terminal'), { ssr: false });

export default function Home() {
  return (
    <div className="w-screen h-screen bg-gray-900 p-4">
      <div className="w-full h-full flex flex-col">
        <header className="mb-4 text-center">
          <h1 className="text-3xl font-bold text-white">Git Online Learning Terminal</h1>
          <p className="text-gray-400 mt-2">Practice Git commands in your browser</p>
        </header>
        <div className="flex-1 bg-gray-800 rounded-lg overflow-hidden shadow-xl">
          <Terminal />
        </div>
      </div>
    </div>
  );
}
