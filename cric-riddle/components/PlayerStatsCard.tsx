import React from 'react';
import type { PlayerStats } from '../types';

interface PlayerStatsCardProps {
  stats: PlayerStats;
}

const StatRow: React.FC<{ label: string; value: string | number | undefined }> = ({ label, value }) => {
    if (value === undefined || value === null) return null;
    return (
        <div className="flex justify-between items-baseline py-2 border-b border-slate-700 last:border-b-0">
            <p className="text-sm text-slate-400">{label}</p>
            <p className="font-semibold text-white">{value}</p>
        </div>
    );
};

const PlayerStatsCard: React.FC<PlayerStatsCardProps> = ({ stats }) => {
  const hasBattingStats = stats.batting && Object.keys(stats.batting).length > 0;
  const hasBowlingStats = stats.bowling && Object.keys(stats.bowling).length > 0;

  return (
    <div className="mt-6 text-left">
        <h3 className="text-xl font-bold text-emerald-400 mb-3 text-center">Career Statistics</h3>
        <div className="bg-slate-900/50 rounded-lg p-4">
            {hasBattingStats && (
                <div className="mb-4 last:mb-0">
                    <h4 className="font-bold text-lg mb-2 text-slate-200">Batting</h4>
                    <StatRow label="Runs" value={stats.batting.runs} />
                    <StatRow label="High Score" value={stats.batting.highScore} />
                    <StatRow label="Average" value={stats.batting.average} />
                    <StatRow label="100s" value={stats.batting.centuries} />
                    <StatRow label="50s" value={stats.batting.fifties} />
                </div>
            )}
            {hasBowlingStats && (
                <div>
                    <h4 className="font-bold text-lg mb-2 text-slate-200">Bowling</h4>
                    <StatRow label="Wickets" value={stats.bowling.wickets} />
                    <StatRow label="Best Figures" value={stats.bowling.bestFigures} />
                    <StatRow label="Average" value={stats.bowling.average} />
                    <StatRow label="Economy" value={stats.bowling.economy} />
                </div>
            )}
            {(!hasBattingStats && !hasBowlingStats) && (
                <p className="text-center text-slate-400">No detailed stats available.</p>
            )}
        </div>
    </div>
  );
};

export default PlayerStatsCard;
