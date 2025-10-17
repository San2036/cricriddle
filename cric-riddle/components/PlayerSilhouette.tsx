import React from 'react';

interface PlayerSilhouetteProps {
  playerImage: string;
  blurLevel: number; // 0 (clear) to 5 (max blur)
  isRevealed: boolean;
}

const PlayerSilhouette: React.FC<PlayerSilhouetteProps> = ({ playerImage, blurLevel, isRevealed }) => {
  const blurValue = isRevealed ? 0 : Math.max(0, blurLevel) * 4;

  return (
    <div className="relative w-48 h-64 mx-auto mb-6 flex items-center justify-center bg-slate-700/30 rounded-lg overflow-hidden" aria-hidden="true">
        <img
            src={playerImage}
            alt="A cricket player"
            className="w-full h-full object-contain transition-all duration-500 ease-in-out"
            style={{ filter: `blur(${blurValue}px)` }}
        />
        { !isRevealed &&
          <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl font-bold text-white/50 select-none">?</span>
          </div>
        }
    </div>
  );
};

export default PlayerSilhouette;