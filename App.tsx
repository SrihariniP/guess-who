import React, { useState, useEffect, useRef } from 'react';
import { GameStatus, Message, GameState } from './types.ts';
import { geminiService } from './services/geminiService.ts';
import { MAX_QUESTIONS, ICONS } from './constants.tsx';
import { ChatBubble } from './components/ChatBubble.tsx';
import { GameStatusDisplay } from './components/GameStatus.tsx';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    status: GameStatus.IDLE,
    questionsRemaining: MAX_QUESTIONS,
    history: [],
  });
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [gameState.history]);

  const startGame = async () => {
    setIsLoading(true);
    setGameState({
        status: GameStatus.INITIALIZING,
        questionsRemaining: MAX_QUESTIONS,
        history: [],
    });

    try {
      const welcomeText = await geminiService.startNewGame();
      setGameState(prev => ({
        ...prev,
        status: GameStatus.PLAYING,
        history: [{ role: 'model', text: welcomeText, type: 'system' }]
      }));
    } catch (error) {
      console.error(error);
      alert("Failed to initialize game. Please check your network or API key.");
      setGameState(prev => ({ ...prev, status: GameStatus.IDLE }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInteraction = async (type: 'question' | 'guess') => {
    if (!inputValue.trim() || isLoading) return;

    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    const userMsg: Message = { role: 'user', text: currentInput, type };
    setGameState(prev => ({
      ...prev,
      history: [...prev.history, userMsg]
    }));

    try {
      const aiResponse = await geminiService.askQuestion(currentInput);

      const modelMsg: Message = {
        role: 'model',
        text: aiResponse.answer,
        type: 'answer'
      };

      let newStatus = gameState.status;
      let revealedName = gameState.secretIdentity;
      let newRemaining = type === 'question' ? gameState.questionsRemaining - 1 : gameState.questionsRemaining;

      if (aiResponse.isCorrect) {
        newStatus = GameStatus.WON;
        revealedName = aiResponse.revealedName;
      } else if (newRemaining <= 0) {
        newStatus = GameStatus.LOST;
        revealedName = await geminiService.revealIdentity();
      }

      setGameState(prev => ({
        ...prev,
        status: newStatus,
        questionsRemaining: newRemaining,
        secretIdentity: revealedName,
        history: [...prev.history, modelMsg]
      }));

    } catch (error) {
      console.error(error);
      alert("Something went wrong with the AI response. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetGame = () => {
    startGame();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-slate-950 text-slate-200">
      <div className="max-w-4xl w-full flex flex-col h-[90vh]">

        {/* Header */}
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <ICONS.Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-600">
              PERSONA GUESS
            </h1>
          </div>
          {gameState.status !== GameStatus.IDLE && (
            <button
              onClick={resetGame}
              className="p-2 text-slate-400 hover:text-white transition-colors"
              title="Reset Game"
            >
              <ICONS.RotateCcw className="w-6 h-6" />
            </button>
          )}
        </header>

        {gameState.status === GameStatus.IDLE ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <img
                    src="https://images.unsplash.com/photo-1544502062-f82887f0dfd2?q=80&w=400&h=400&auto=format&fit=crop"
                    className="relative w-48 h-48 md:w-64 md:h-64 rounded-full object-cover border-4 border-slate-800 shadow-2xl"
                    alt="Mystery Persona"
                />
             </div>
             <div className="space-y-4 px-4">
                <h2 className="text-4xl md:text-6xl font-extrabold text-white">Who am I?</h2>
                <p className="text-slate-400 text-lg max-w-md mx-auto font-light leading-relaxed">
                  I'm thinking of a globally famous person. You have <span className="text-blue-400 font-bold">21 questions</span> to figure out who it is.
                </p>
                <button
                  onClick={startGame}
                  className="mt-8 px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-xl shadow-blue-900/20 transform transition-all hover:scale-105 active:scale-95 flex items-center space-x-3 mx-auto"
                >
                  <span>START THE CHALLENGE</span>
                  <ICONS.ChevronRight className="w-5 h-5" />
                </button>
             </div>
          </div>
        ) : (
          <div className="flex-grow flex flex-col bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden relative">

            {/* Overlay for Win/Loss */}
            {(gameState.status === GameStatus.WON || gameState.status === GameStatus.LOST) && (
              <div className="absolute inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md bg-slate-950/60 animate-in zoom-in duration-300">
                <div className="bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center space-y-6">
                  {gameState.status === GameStatus.WON ? (
                    <>
                      <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                        <ICONS.Trophy className="w-10 h-10 text-green-500" />
                      </div>
                      <h3 className="text-3xl font-black text-white">Victory!</h3>
                      <p className="text-slate-300">
                        Impressive! You correctly guessed <span className="text-green-400 font-bold underline">{gameState.secretIdentity}</span> with {gameState.questionsRemaining} questions to spare.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-4xl">😞</span>
                      </div>
                      <h3 className="text-3xl font-black text-white">Game Over</h3>
                      <p className="text-slate-300">
                        Out of questions! The secret persona was <span className="text-red-400 font-bold underline">{gameState.secretIdentity}</span>.
                      </p>
                    </>
                  )}
                  <button
                    onClick={resetGame}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-900/30"
                  >
                    Play Again
                  </button>
                </div>
              </div>
            )}

            {/* Status Header */}
            <div className="p-4 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800">
              <GameStatusDisplay
                remaining={gameState.questionsRemaining}
                status={gameState.status === GameStatus.INITIALIZING ? 'Thinking...' : 'Active'}
              />
            </div>

            {/* Chat Area */}
            <div
              ref={scrollRef}
              className="flex-grow overflow-y-auto p-4 md:p-6 custom-scrollbar flex flex-col space-y-2"
            >
              {gameState.history.map((msg, idx) => (
                <ChatBubble key={idx} message={msg} />
              ))}
              {isLoading && (
                <div className="flex justify-start mb-4 animate-pulse">
                  <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-700">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                      <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-.5s]"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Controls */}
            <div className="p-4 md:p-6 bg-slate-900/90 border-t border-slate-800">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isLoading) handleInteraction('question');
                    }}
                    placeholder="Ask a Yes/No question..."
                    disabled={isLoading || gameState.status !== GameStatus.PLAYING}
                    className="flex-grow bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all disabled:opacity-50"
                  />
                  <button
                    onClick={() => handleInteraction('question')}
                    disabled={isLoading || !inputValue.trim() || gameState.status !== GameStatus.PLAYING}
                    className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white p-4 rounded-2xl shadow-lg transition-all active:scale-95"
                  >
                    <ICONS.Send className="w-6 h-6" />
                  </button>
                </div>
                <div className="flex items-center justify-between px-1">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Type your question or take a guess</p>
                  <button
                    onClick={() => handleInteraction('guess')}
                    disabled={isLoading || !inputValue.trim() || gameState.status !== GameStatus.PLAYING}
                    className="text-xs text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider transition-colors disabled:opacity-0"
                  >
                    Ready to guess the name?
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <footer className="mt-6 text-center text-slate-500 text-sm">
          Powered by Gemini 3 Flash • Guess carefully!
        </footer>
      </div>
    </div>
  );
};

export default App;