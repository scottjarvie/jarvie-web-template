'use client';

import { useState, useEffect } from 'react';
import { OpenAIModel, countTokens } from '@/lib/openai';

interface TokenCounterProps {
  text: string;
  model?: string;
  className?: string;
}

export function TokenCounter({ 
  text, 
  model = OpenAIModel.GPT4O_MINI,
  className = ''
}: TokenCounterProps) {
  const [tokenCount, setTokenCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (text) getTokenCount();
      else setTokenCount(0);
    }, 500); // Debounce input

    return () => clearTimeout(timer);
  }, [text, model]);
  
  async function getTokenCount() {
    if (!text) {
      setTokenCount(0);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const count = await countTokens(text, model);
      setTokenCount(count);
    } catch (err) {
      setError('Failed to count tokens');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }
  
  if (isLoading) {
    return <div className={`text-muted-foreground text-sm ${className}`}>Counting tokens...</div>;
  }
  
  if (error) {
    return <div className={`text-destructive text-sm ${className}`}>{error}</div>;
  }
  
  return (
    <div className={`text-sm ${className}`}>
      <span className="font-medium">Token count:</span> {tokenCount ?? 0}
    </div>
  );
} 