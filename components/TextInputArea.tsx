
import React from 'react';

interface TextInputAreaProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const TextInputArea: React.FC<TextInputAreaProps> = ({ value, onChange, onSubmit, isLoading }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label htmlFor="topic-input" className="block text-lg font-medium text-indigo-300">
        Enter Central Topic
      </label>
      <textarea
        id="topic-input"
        rows={3}
        className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out placeholder-slate-400 text-slate-100"
        placeholder="e.g., The Future of Artificial Intelligence"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 disabled:bg-slate-500 disabled:cursor-not-allowed transition duration-150 ease-in-out"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : (
          'Generate Mind Map'
        )}
      </button>
    </form>
  );
};
