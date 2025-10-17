import React from 'react';
import type { User } from '../types';
import StatsDisplay from './StatsDisplay';

interface ProfileModalProps {
  user: User;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-700 flex flex-col">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-emerald-400">Your Profile</h2>
            <button onClick={onClose} className="text-3xl text-slate-400 hover:text-white" aria-label="Close profile">&times;</button>
        </div>
        <div>
            <p className="text-center text-lg mb-6">
                <span className="text-slate-400">Player: </span> 
                <span className="font-bold text-white">{user.username}</span>
            </p>
            <StatsDisplay stats={user.stats} />
            
            <button 
              onClick={onClose} 
              className="mt-8 w-full py-3 px-5 text-lg font-semibold text-white bg-slate-600 rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-emerald-500 transition"
            >
              Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
