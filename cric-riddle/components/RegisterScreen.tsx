import React, { useState } from "react";

interface RegisterScreenProps {
  onRegister: (username: string) => void;
  switchToLogin: () => void;
  errorMessage?: string | null;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onRegister, switchToLogin, errorMessage }) => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(errorMessage ?? null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    onRegister(username.trim());
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-8 bg-slate-800 rounded-2xl shadow-2xl text-center">
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <h1 className="text-4xl font-bold tracking-tight text-white">Cric-Riddle</h1>
          </div>
          <p className="mt-2 text-lg text-slate-300">Create your player profile</p>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        {!error && errorMessage && <p className="text-red-400 text-sm">{errorMessage}</p>}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="username" className="sr-only">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-5 py-3 text-lg text-center bg-slate-700 border border-slate-600 rounded-lg placeholder-slate-400 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              placeholder="Choose a username"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 px-5 text-lg font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-emerald-500 transition transform hover:scale-105"
          >
            Register
          </button>
        </form>

        <p className="text-slate-400 text-sm">
          Already have an account? {" "}
          <button onClick={switchToLogin} className="text-emerald-400 hover:underline">
            Login here
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterScreen;