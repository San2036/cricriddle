import React, { useState, useCallback, useRef } from 'react';
import type { User, DailyPuzzle, GameHistoryEntry, Difficulty } from '../types';
import { GUESSES_BY_DIFFICULTY } from '../constants';
import { geminiService } from '../services/geminiService';
import HistoryModal from './HistoryModal';
import ProfileModal from './ProfileModal';
import PlayerStatsCard from './PlayerStatsCard';
import Timer from './Timer';
import DifficultySelectionModal from './DifficultySelectionModal';

interface GameScreenProps {
  user: User;
  onLogout: () => void;
  onUserUpdate: (updatedUser: User) => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ user, onLogout, onUserUpdate }) => {
  const [puzzle, setPuzzle] = useState<DailyPuzzle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameStatus, setGameStatus] = useState<'PLAYING' | 'WON' | 'LOST'>('PLAYING');
  
  const [isHistoryVisible, setHistoryVisible] = useState(false);
  const [isProfileVisible, setProfileVisible] = useState(false);
  const [isResultModalVisible, setResultModalVisible] = useState(false);
  const [isDifficultyModalVisible, setDifficultyModalVisible] = useState(true);

  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty | null>(null);
  const [playedPlayerNames, setPlayedPlayerNames] = useState<string[]>([]);
  
  const timerRef = useRef<{ getTime: () => number, stop: () => void, reset: () => void }>(null);
  const [finalTime, setFinalTime] = useState(0);

  const maxGuesses = currentDifficulty ? GUESSES_BY_DIFFICULTY[currentDifficulty] : 0;
  const revealedClues = guesses.length + 1;

  const fetchNewPuzzle = useCallback(async (difficulty: Difficulty, excludedPlayers: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const newPuzzle = await geminiService.getDailyCricketer(difficulty, excludedPlayers);
      setPuzzle(newPuzzle);
    } catch (e) {
      setError('Failed to load the puzzle. Please try again later.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDifficultySelect = (difficulty: Difficulty) => {
    setCurrentDifficulty(difficulty);
    setDifficultyModalVisible(false);
    fetchNewPuzzle(difficulty, playedPlayerNames);
  };

  const resetGame = useCallback(() => {
    setGuesses([]);
    setCurrentGuess('');
    setGameStatus('PLAYING');
    timerRef.current?.reset();
    setFinalTime(0);
    setPuzzle(null);
    setCurrentDifficulty(null);
    setResultModalVisible(false);
    setDifficultyModalVisible(true);
  }, []);

  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentGuess.trim() || gameStatus !== 'PLAYING' || !puzzle) return;

    const newGuesses = [...guesses, currentGuess.trim()];
    setGuesses(newGuesses);
    
    const isCorrect = currentGuess.trim().toLowerCase() === puzzle.playerName.toLowerCase();

    if (isCorrect) {
      endGame(true, newGuesses);
    } else if (newGuesses.length >= maxGuesses) {
      endGame(false, newGuesses);
    }
    setCurrentGuess('');
  };
  
  const endGame = (won: boolean, finalGuesses: string[]) => {
    if (!currentDifficulty || !puzzle) return; // Should not happen

    setPlayedPlayerNames(prev => [...prev, puzzle.playerName]);

    if (timerRef.current) {
      timerRef.current.stop();
      const timeTaken = timerRef.current.getTime();
      setFinalTime(timeTaken);
    }
    setGameStatus(won ? 'WON' : 'LOST');
    setResultModalVisible(true);

    const newHistoryEntry: GameHistoryEntry = {
        date: new Date().toLocaleString(),
        correctPlayer: puzzle!.playerName,
        guesses: finalGuesses,
        timeTaken: timerRef.current?.getTime() || 0,
        won: won,
        difficulty: currentDifficulty,
    };

    const newStats = { ...user.stats };
    newStats.gamesPlayed += 1;
    if (won) {
        newStats.gamesWon += 1;
        newStats.currentStreak += 1;
        if (newStats.currentStreak > newStats.maxStreak) {
            newStats.maxStreak = newStats.currentStreak;
        }
    } else {
        newStats.currentStreak = 0;
    }

    const updatedUser: User = {
        ...user,
        stats: newStats,
        history: [...user.history, newHistoryEntry]
    };

    onUserUpdate(updatedUser);
  };

  const renderClues = () => {
    if (!puzzle) return null;
    return puzzle.clues.slice(0, revealedClues > maxGuesses ? maxGuesses : revealedClues).map((clue, index) => (
      <div key={index} className="bg-slate-700/50 p-4 rounded-lg animate-fade-in">
        <span className="font-semibold text-emerald-400 mr-2">Clue {index + 1}:</span>
        <span>{clue}</span>
      </div>
    ));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-emerald-400">Cric-Riddle</h1>
          <p className="text-slate-300">Player: <span className="font-semibold">{user.username}</span></p>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2">
            <button onClick={() => setProfileVisible(true)} className="text-slate-300 hover:text-white transition px-3 py-2 rounded-md hover:bg-slate-700">Profile</button>
            <button onClick={() => setHistoryVisible(true)} className="text-slate-300 hover:text-white transition px-3 py-2 rounded-md hover:bg-slate-700">History</button>
            <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold transition">Logout</button>
        </div>
      </header>
      
      {isDifficultyModalVisible && <DifficultySelectionModal onSelect={handleDifficultySelect} />}
      
      {loading && <div className="text-center mt-20 text-xl">Warming up the pitch...</div>}
      
      {error && <div className="text-center mt-20 text-xl text-red-400">{error}</div>}

      {!isDifficultyModalVisible && !loading && !error && puzzle && (
        <main className="bg-slate-800 p-6 rounded-2xl shadow-lg">

          <div className="my-6 space-y-3">
            {renderClues()}
          </div>

          {gameStatus === 'PLAYING' && (
            <>
              <div className="flex justify-between items-baseline mb-4">
                  <p className="text-lg">Guesses remaining: <span className="font-bold text-2xl text-yellow-400">{maxGuesses - guesses.length}</span></p>
                  <Timer ref={timerRef} isRunning={gameStatus === 'PLAYING'} />
              </div>

              <form onSubmit={handleGuessSubmit} className="flex gap-2">
                  <input
                      type="text"
                      value={currentGuess}
                      onChange={(e) => setCurrentGuess(e.target.value)}
                      placeholder="Who is the player?"
                      className="flex-grow bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-lg font-semibold transition transform hover:scale-105">Guess</button>
              </form>
            </>
          )}
          
          <div className="mt-4 space-y-2">
              {guesses.map((g, i) => (
                  <p key={i} className="text-red-400 line-through bg-slate-700/30 p-2 rounded-md">
                      {i+1}. {g}
                  </p>
              ))}
          </div>
        </main>
      )}

      {isResultModalVisible && puzzle && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl border border-slate-700 max-h-[90vh] overflow-y-auto">
                <h2 className={`text-4xl font-bold mb-4 ${gameStatus === 'WON' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {gameStatus === 'WON' ? "Correct!" : "Game Over"}
                </h2>
                <p className="text-lg text-slate-300 mb-2">The player was:</p>
                <p className="text-2xl font-semibold text-white mb-6">{puzzle.playerName}</p>
                
                {gameStatus === 'WON' && <p className="text-slate-300 mb-4">You guessed it in {guesses.length} {guesses.length === 1 ? 'try' : 'tries'} and {finalTime} seconds!</p>}

                <PlayerStatsCard stats={puzzle.stats} />
                
                <button onClick={resetGame} className="mt-8 w-full bg-emerald-600 hover:bg-emerald-700 py-3 rounded-lg font-semibold transition">
                    Play Next
                </button>
                <button onClick={() => setResultModalVisible(false)} className="mt-4 w-full bg-slate-600 hover:bg-slate-700 py-3 rounded-lg font-semibold transition">
                    Close
                </button>
            </div>
        </div>
      )}

      {isHistoryVisible && (
        <HistoryModal history={user.history} onClose={() => setHistoryVisible(false)} />
      )}
      {isProfileVisible && (
        <ProfileModal user={user} onClose={() => setProfileVisible(false)} />
      )}
    </div>
  );
};

export default GameScreen;