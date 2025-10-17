
import React from 'react';
import type { UserStats } from '../types';

interface StatsDisplayProps {
  stats: UserStats;
}

const StatItem: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div className="text-center bg-slate-700/50 p-3 rounded-lg">
        <p className="text-2xl font-bold text-emerald-400">{value}</p>
        <p className="text-xs text-slate-400 uppercase tracking-wider">{label}</p>
    </div>
);

const StatsDisplay: React.FC<StatsDisplayProps> = ({ stats }) => {
  const winPercentage = stats.gamesPlayed > 0 ? ((stats.gamesWon / stats.gamesPlayed) * 100).toFixed(0) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatItem label="Played" value={stats.gamesPlayed} />
      <StatItem label="Win %" value={`${winPercentage}%`} />
      <StatItem label="Current Streak" value={stats.currentStreak} />
      <StatItem label="Max Streak" value={stats.maxStreak} />
    </div>
  );
};

export default StatsDisplay;
