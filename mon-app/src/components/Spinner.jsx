import React from 'react';

export default function Spinner({ dark = false }) {
  return (
    <div className={`w-4 h-4 border-2 rounded-full animate-spin ${
      dark ? 'border-gray-400 border-t-gray-900' : 'border-white/50 border-t-white'
    }`} />
  );
}