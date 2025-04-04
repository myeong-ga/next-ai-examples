import { anthropic } from '@ai-sdk/anthropic';
import { createDataStreamResponse, Message, streamText , CoreMessage } from 'ai';
import { processToolCalls } from './utils';
import { tools } from './tools';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: Message[] } = await req.json();

  return createDataStreamResponse({
    execute: async dataStream => {
      // Utility function to handle tools that require human confirmation
      // Checks for confirmation in last message and then runs associated tool
      const processedMessages = await processToolCalls(
        {
          messages,
          dataStream,
          tools,
        },
        {
          // toolInstance : toolInvocation.result 가 Structured Input defined 와 맞으면 여기에서 executeFunction을 구한다.
          // type-safe object for tools without an execute function
          getWeatherInformation: async ({ city }) => {
            const conditions = ['sunny', 'cloudy', 'rainy', 'snowy'];
            return `The weather in ${city} is ${
              conditions[Math.floor(Math.random() * conditions.length)]
            }.`;
          },

        },
      );
      console.log("### processedMessages ####", processedMessages);
      const result = streamText({
        model: anthropic('claude-3-5-haiku-latest'),
        messages: processedMessages,
        tools,
      });

      result.mergeIntoDataStream(dataStream);
    },
  });
}
