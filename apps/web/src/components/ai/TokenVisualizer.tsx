'use client';

import { useState, useEffect } from 'react';
import { OpenAIModel } from '@/lib/openai';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';

export function TokenVisualizer() {
  const [text, setText] = useState<string>("Hello world! How are tokens counted by OpenAI models?");
  const [tokenized, setTokenized] = useState<{ text: string; isToken: boolean; tokenCount?: number }[]>([]);
  const [tokenCount, setTokenCount] = useState<number>(0);
  const [model, setModel] = useState<string>(OpenAIModel.GPT4O_MINI);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [debugInfo, setDebugInfo] = useState<string>("");
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (text) analyzeTokens();
    }, 500); // Debounce input

    return () => clearTimeout(timer);
  }, [text, model]);
  
  async function analyzeTokens() {
    if (!text.trim()) {
      setTokenized([]);
      setTokenCount(0);
      return;
    }
    
    setIsLoading(true);
    setDebugInfo("Sending text to token counting API...");
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/openai/tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, model }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      setTokenCount(data.tokens);
      
      // Create a visual representation of tokens
      // This is a simplified approach since we don't have the exact token boundaries
      // In a real implementation, you might want to get the actual tokens from the API
      const words = text.split(/(\s+)/);
      const avgTokensPerChar = data.tokens / text.length;
      
      const visualTokens = words.map(word => {
        const estimatedTokens = Math.ceil(word.length * avgTokensPerChar);
        return {
          text: word,
          isToken: word.trim().length > 0,
          tokenCount: estimatedTokens
        };
      });
      
      setTokenized(visualTokens);
      setDebugInfo(`Successfully counted ${data.tokens} tokens using model ${data.model}`);
    } catch (error) {
      console.error('Error analyzing tokens:', error);
      setDebugInfo(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <div className="space-y-4 p-4 bg-background border rounded-lg">
      <div>
        <label className="block text-sm font-medium mb-1">Model</label>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full border rounded p-2 bg-background"
        >
          <option value={OpenAIModel.GPT4O_MINI}>GPT-4o-mini</option>
          <option value={OpenAIModel.GPT4O}>GPT-4o</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Enter text to analyze:</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full border rounded p-2 h-24 bg-background"
          placeholder="Enter text to analyze token count..."
        />
      </div>
      
      <div className="p-4 bg-muted rounded-lg">
        <div className="mb-2 font-medium">Token Visualization:</div>
        <div className="flex flex-wrap">
          {tokenized.map((item, index) => (
            <span
              key={index}
              className={`px-1 py-0.5 rounded ${
                item.isToken ? 'bg-primary/10 border border-primary/30' : ''
              }`}
              title={item.tokenCount ? `~${item.tokenCount} tokens` : undefined}
            >
              {item.text}
            </span>
          ))}
        </div>
        <div className="mt-2 font-medium">
          Total tokens: <span className="text-primary">{tokenCount}</span>
        </div>
      </div>
      
      {isLoading && <div className="text-muted-foreground">Analyzing tokens...</div>}
      <div className="text-xs text-muted-foreground">{debugInfo}</div>
    </div>
  );
} 