import React from 'react';
import { MAX_QUESTIONS } from '../constants.tsx';

interface GameStatusProps {
  remaining: number;
  status: string;
}

export const GameStatusDisplay: React.FC<GameStatusProps> = ({ remaining, status }) => {
  const percentage = (remaining / MAX_QUESTIONS) * 100;

  return (
    <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-xl p-4 sticky top-4 z-10 shadow-lg">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Questions Left</h2>
        <span className={`text-2xl font-black ${remaining <= 5 ? 'text-red-400 animate-pulse' : 'text-blue-400'}`}>
          {remaining}
        </span>
      </div>
      <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ease-out rounded-full ${remaining <= 5 ? 'bg-red-500' : 'bg-blue-500'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-slate-500 font-medium">Progress: {MAX_QUESTIONS - remaining}/{MAX_QUESTIONS}</span>
        <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs text-slate-300 font-bold">{status}</span>
        </div>
      </div>
    </div>
  );
};