import { openai } from '@ai-sdk/openai';
import { createDataStreamResponse, streamText, tool } from 'ai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages } = await req.json();

  return createDataStreamResponse({

    execute: async dataStream => {
      const result = streamText({
        model: openai('gpt-4o-mini', { structuredOutputs: true }),
        system: 'You are a helpful assistant.',
        messages,
        // toolChoice: 'required', // force the model to call a tool
        toolCallStreaming: true,
        tools: {
          ExtractGoal: tool({
            description: '사용자의 질의로부터 직관적인 목표를 추출합니다.',
            parameters: z.object({ goal: z.string() }),
            execute: async ({ goal }) => goal, // no-op extract tool
          }),
        },
        maxSteps: 3
      });

      result.mergeIntoDataStream(dataStream);
    },
  });
}
