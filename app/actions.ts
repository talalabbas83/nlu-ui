'use server';

import { z } from 'zod';

const ResponseSchema = z
  .object({
    // Add more specific schema here if you know the exact structure
    // For now, we'll accept any JSON object
  })
  .passthrough();

export async function processQuery(query: string) {
  if (typeof query !== 'string' || query.length === 0) {
    return { error: 'Query must be a non-empty string' };
  }

  try {
    console.log('Sending request to NLU server...', query);
    const response = await fetch('http://13.58.253.101:8000/nlu/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({ query })
    });

    console.log('Received response from NLU server');
    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from NLU server:', errorText);
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const rawData = await response.text();
    console.log('Raw response data:', rawData);

    let data;
    try {
      data = JSON.parse(rawData);
    } catch (parseError) {
      console.error('Error parsing JSON:', {
        rawData,
        parseError:
          parseError instanceof Error ? parseError.message : parseError
      });
      throw new Error('Failed to parse server response as JSON');
    }

    console.log('Parsed data:', data);

    const validatedData = ResponseSchema.parse(data);
    console.log('Validated data:', validatedData);

    return { data: validatedData };
  } catch (error) {
    console.error('Error processing query:', {
      error: error instanceof Error ? error.message : JSON.stringify(error),
      stack: error instanceof Error ? error.stack : null
    });
    return {
      error: `An error occurred: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    };
  }
}
