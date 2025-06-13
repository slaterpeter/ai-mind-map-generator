
import React, { useState, useCallback } from 'react';
import { TextInputArea } from './components/TextInputArea';
import { MindMapDisplay } from './components/MindMapDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { generateMindMapData } from './services/geminiService';
import { MindMapNodeData } from './types';
import { GEMINI_MODEL_NAME } from './constants';

const App: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [mindMapData, setMindMapData] = useState<MindMapNodeData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateMindMap = useCallback(async () => {
    if (!topic.trim()) {
      setError('Please enter a topic for the mind map.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setMindMapData(null);

    try {
      const data = await generateMindMapData(topic);
      setMindMapData(data);
    } catch (err) {
      console.error('Error generating mind map:', err);
      if (err instanceof Error) {
        setError(`Failed to generate mind map: ${err.message}. Ensure your API key is correctly configured.`);
      } else {
        setError('An unknown error occurred while generating the mind map.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [topic]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 flex flex-col items-center p-4 sm:p-8 selection:bg-indigo-500 selection:text-white">
      <header className="w-full max-w-4xl mb-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 py-2">
          AI Mind Map Generator
        </h1>
        <p className="text-slate-400 mt-2 text-sm sm:text-base">
          Enter a central topic, and let AI craft a visual mind map for you. Using {GEMINI_MODEL_NAME}.
        </p>
      </header>

      <main className="w-full max-w-4xl bg-slate-800 shadow-2xl rounded-xl p-6 sm:p-8">
        <TextInputArea
          value={topic}
          onChange={setTopic}
          onSubmit={handleGenerateMindMap}
          isLoading={isLoading}
        />

        {isLoading && <LoadingSpinner />}
        {error && !isLoading && <ErrorMessage message={error} />}
        
        {mindMapData && !isLoading && !error && (
          <div className="mt-8 p-4 bg-slate-700 rounded-lg shadow-inner">
            <h2 className="text-2xl font-semibold mb-4 text-indigo-400">Generated Mind Map</h2>
            <MindMapDisplay data={mindMapData} width={800} height={600} />
          </div>
        )}
        
        {!isLoading && !error && !mindMapData && (
          <div className="mt-8 p-8 text-center text-slate-500 border-2 border-dashed border-slate-700 rounded-lg">
            <p className="text-lg">Your mind map will appear here once generated.</p>
            <p className="text-sm mt-2">Try topics like "Learning React", "Healthy Lifestyle", or "Space Exploration".</p>
          </div>
        )}
      </main>

      <footer className="mt-12 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} AI Mind Map Generator. Powered by Gemini & D3.js.</p>
      </footer>
    </div>
  );
};

export default App;
