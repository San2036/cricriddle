import React from 'react';
import type { GameHistoryEntry } from '../types';

// Fix: Define the props interface for the HistoryModal component.
interface HistoryModalProps {
  history: GameHistoryEntry[];
  onClose: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ history, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-2xl shadow-2xl border border-slate-700 max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-emerald-400">Game History</h2>
            <button onClick={onClose} className="text-3xl text-slate-400 hover:text-white">&times;</button>
        </div>
        <div className="overflow-y-auto pr-2">
            {history.length === 0 ? (
                <p className="text-center text-slate-400 py-8">No games played yet.</p>
            ) : (
                <div className="space-y-4">
                    {history.slice().reverse().map((entry, index) => (
                        <div key={`${entry.date}-${index}`} className={`p-4 rounded-lg border-l-4 ${entry.won ? 'border-emerald-500 bg-emerald-500/10' : 'border-red-500 bg-red-500/10'}`}>
                            <div className="flex justify-between items-center">
                                <p className="font-bold text-lg">{entry.date}</p>
                                <p className={`font-semibold px-2 py-1 text-xs rounded ${entry.won ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                                    {entry.won ? 'WON' : 'LOST'}
                                </p>
                            </div>
                            <div className="mt-2 flex justify-between items-baseline text-slate-300">
                                <p>Player: <span className="font-medium text-white">{entry.correctPlayer}</span></p>
                                <p className="text-sm">Difficulty: <span className="font-semibold">{entry.difficulty}</span></p>
                            </div>
                            <p className="text-slate-300">Guesses: {entry.guesses.join(', ')} ({entry.guesses.length})</p>
                            <p className="text-slate-300">Time: {entry.timeTaken} seconds</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;