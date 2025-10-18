import React, { useState, useEffect, useCallback } from 'react';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import GameScreen from './components/GameScreen';
import { storageService } from './services/storageService';
import type { User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);

  useEffect(() => {
    const loggedInUser = storageService.getUser();
    if (loggedInUser) {
      setUser(loggedInUser);
    }
    setLoading(false);
  }, []);

  const handleLogin = useCallback(async (username: string) => {
    const existingUser = await storageService.getUserData(username);
    if (existingUser) {
      setUser(existingUser);
      storageService.setUser(existingUser);
      setLoginError(null); // clear any previous error
    } else {
      setLoginError('User not registered. Please register first.');
    }
  }, []);

  const handleLogout = useCallback(() => {
    storageService.clearUser();
    setUser(null);
  }, []);

  const handleUserUpdate = useCallback((updatedUser: User) => {
      setUser(updatedUser);
      storageService.saveUserData(updatedUser);
      storageService.setUser(updatedUser);
  }, []);

  const handleRegister = useCallback(async (username: string) => {
    const existing = await storageService.getUserData(username);
    if (existing) {
      setRegisterError('Username already exists.');
      return;
    }

    const newUser: User = {
      username,
      stats: {
        gamesPlayed: 0,
        gamesWon: 0,
        currentStreak: 0,
        maxStreak: 0,
      },
      history: [],
    };
    await storageService.saveUserData(newUser);
    storageService.setUser(newUser);
    setUser(newUser);
    setRegisterError(null);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-2xl font-bold text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-800 text-white p-4 sm:p-6">
      {user ? (
        <GameScreen user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />
      ) : authMode === 'login' ? (
        <LoginScreen onLogin={handleLogin} switchToRegister={() => { setLoginError(null); setAuthMode('register'); }} errorMessage={loginError} />
      ) : (
        <RegisterScreen onRegister={handleRegister} switchToLogin={() => { setRegisterError(null); setAuthMode('login'); }} errorMessage={registerError} />
      )}
    </div>
  );
};

export default App;
