'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { processQuery } from './actions';

export default function QueryPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); // Prevent the default form submission behavior
    setIsLoading(true);
    setError(null);
    setResult(null);
    const formData = new FormData(event.currentTarget);
    const query = formData.get('query') as string;

    try {
      const response = await processQuery(query);

      if ('error' in response) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        setError(response.error);
      } else if ('data' in response) {
        setResult(response.data);
      } else {
        setError('Unexpected response format');
      }
    } catch (err) {
      setError('An unexpected error occurred while processing the query');
      console.error('Error in handleSubmit:', err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className='container mx-auto p-4'>
      <Card>
        <CardHeader>
          <CardTitle>NLU Query Processor</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='flex space-x-2'>
              <Input
                type='text'
                name='query'
                placeholder='Enter your query'
                className='flex-grow'
                required
              />
              <Button type='submit' disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Submit'}
              </Button>
            </div>
          </form>

          {error && (
            <div className='mt-4 p-4 bg-red-100 text-red-700 rounded'>
              <p className='font-bold'>Error:</p>
              <p>{error}</p>
            </div>
          )}

          {result && (
            <div className='mt-4'>
              <h2 className='text-lg font-semibold mb-2'>Result:</h2>
              <pre className='bg-gray-100 p-4 rounded overflow-x-auto'>
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
