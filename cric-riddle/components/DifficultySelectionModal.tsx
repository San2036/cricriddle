import React from 'react';
import type { Difficulty } from '../types';

interface DifficultyButtonProps {
    level: Difficulty;
    onClick: (level: Difficulty) => void;
}

const DifficultyButton: React.FC<DifficultyButtonProps> = ({ level, onClick }) => {
    const baseClasses = "w-full py-3 text-lg font-semibold rounded-lg transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800";
    const colorClasses = {
        Easy: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
        Medium: 'bg-sky-600 hover:bg-sky-700 focus:ring-sky-500',
        Hard: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    };

    return (
        <button
            type="button"
            onClick={() => onClick(level)}
            className={`${baseClasses} ${colorClasses[level]}`}
        >
            {level}
        </button>
    );
};

interface DifficultySelectionModalProps {
    onSelect: (difficulty: Difficulty) => void;
}

const DifficultySelectionModal: React.FC<DifficultySelectionModalProps> = ({ onSelect }) => {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl border border-slate-700">
                <h2 className="text-3xl font-bold text-white mb-6">Choose Your Challenge</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <DifficultyButton level="Easy" onClick={onSelect} />
                    <DifficultyButton level="Medium" onClick={onSelect} />
                    <DifficultyButton level="Hard" onClick={onSelect} />
                </div>
            </div>
        </div>
    );
};

export default DifficultySelectionModal;
