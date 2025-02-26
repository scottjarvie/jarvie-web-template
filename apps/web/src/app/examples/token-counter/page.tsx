import { TokenVisualizer, TokenCounter } from '@/components/ai';

export const metadata = {
  title: 'Token Counter Example',
  description: 'Example of OpenAI token counting integration',
};

export default function TokenCounterPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">OpenAI Token Counting</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Token Visualizer</h2>
          <p className="text-muted-foreground mb-4">
            Visualize how text is divided into tokens for OpenAI models.
            This helps understand token usage and cost estimation.
          </p>
          <TokenVisualizer />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Simple Token Counter</h2>
          <p className="text-muted-foreground mb-4">
            A lightweight component that shows token count for a given text.
            Useful for embedding in forms or editors.
          </p>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Example: Fixed Text</h3>
            <div className="p-3 bg-muted rounded mb-2">
              The quick brown fox jumps over the lazy dog.
            </div>
            <TokenCounter 
              text="The quick brown fox jumps over the lazy dog." 
              className="text-right"
            />
          </div>
          
          <div className="p-4 border rounded-lg mt-4">
            <h3 className="font-medium mb-2">Example: Chat Message</h3>
            <div className="p-3 bg-primary/10 rounded-lg mb-2">
              <p className="font-semibold text-xs text-primary mb-1">User</p>
              <p>Hello, can you explain how token counting works in OpenAI models?</p>
            </div>
            <TokenCounter 
              text="Hello, can you explain how token counting works in OpenAI models?" 
              className="text-right"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-muted p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">About Token Counting</h2>
        <p className="mb-4">
          OpenAI models process text as tokens. A token is roughly 4 characters 
          or about ¾ of a word in English. Token counting is important because:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Models have token limits (4,096 for GPT-4o-mini, 128,000 for GPT-4o)</li>
          <li>API costs are calculated per token</li>
          <li>Both input and output tokens count toward usage</li>
        </ul>
        <p className="mt-4 text-sm text-muted-foreground">
          This example uses the tiktoken library for accurate token counting.
        </p>
      </div>
    </div>
  );
} 