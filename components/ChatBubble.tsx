import React from 'react';
import { Message } from './types.ts';
import { ICONS } from './constants.tsx';

interface ChatBubbleProps {
  message: Message;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isModel = message.role === 'model';

  return (
    <div className={`flex w-full mb-4 ${isModel ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[85%] ${isModel ? 'flex-row' : 'flex-row-reverse'}`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 ${isModel ? 'bg-blue-600 mr-2' : 'bg-slate-600 ml-2'}`}>
          {isModel ? <ICONS.Brain className="w-5 h-5" /> : <ICONS.User className="w-5 h-5" />}
        </div>
        <div className={`p-3 rounded-2xl shadow-sm ${
          isModel
            ? 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700'
            : 'bg-blue-600 text-white rounded-tr-none'
        }`}>
          <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
            {message.text}
          </p>
          <div className={`text-[10px] mt-1 opacity-50 ${isModel ? 'text-left' : 'text-right'}`}>
             {message.type.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
};