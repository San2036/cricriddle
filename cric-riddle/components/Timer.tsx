
import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';

interface TimerProps {
  isRunning: boolean;
}

const Timer = forwardRef<{ getTime: () => number, stop: () => void, reset: () => void }, TimerProps>(({ isRunning }, ref) => {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  useImperativeHandle(ref, () => ({
    getTime: () => seconds,
    stop: () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    },
    reset: () => {
        setSeconds(0);
    }
  }));

  const formatTime = () => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="text-lg font-mono bg-slate-700/50 px-3 py-1 rounded-md">
      <span>{formatTime()}</span>
    </div>
  );
});

export default Timer;
