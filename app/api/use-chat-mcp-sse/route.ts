import { anthropic } from '@ai-sdk/anthropic';
import { createDataStreamResponse, Message, streamText, experimental_createMCPClient as createMCPClient} from 'ai';
import { processToolCalls } from './utils';
import { tools as tools_hitl } from './tools';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const systemPrompt = `
you are a helpful assistant. You can use tools to answer questions.
`;

export async function POST(req: Request) {
  const { messages }: { messages: Message[] } = await req.json();

  let stepCounter = 0;

  const mcpClient = await createMCPClient({
    transport: {
      type: 'sse',
      url: 'http://localhost:8080/sse',
      headers: {
        example: 'header',
      },
    },
  });


  const myToolSet = {
    ...await mcpClient.tools(), 
    ...tools_hitl, // tools from the Human-in-the-Loop
  };


  return createDataStreamResponse({
    execute: async dataStream => {
 
      const processedMessages = await processToolCalls(
        {
          messages,
          dataStream,
          tools: tools_hitl,
        },
        {
           // type-safe object for tools without an execute function
           getWeatherInformation: async ({ city }) => {
            const conditions = [ 'snowy'];
            return `The weather in ${city} is ${
              conditions[Math.floor(Math.random() * conditions.length)]
            }.`;
          },
        }
      );

      const result = streamText({
        model: google("gemini-2.0-flash-lite"),
        system:  systemPrompt,
        messages: processedMessages,
        maxSteps: 10,
        tools: myToolSet,
        toolChoice: "auto",
        onStepFinish: ({ toolCalls, toolResults, finishReason, usage, text }) => {
          stepCounter++;
          console.log(`\n📊 Step ${stepCounter} Finished:`);
          console.log('🏁 Finish Reason:', finishReason);
          console.log('💬 Model Response:', text);
          
          if (toolCalls && toolCalls.length > 0) {
            console.log('🛠️ Tool Calls:');
            toolCalls.forEach((call, index) => {
              console.log(`  [${index + 1}] Tool: ${call.toolName}, Arguments:`, call.args);
            });
          }
          
          if (toolResults && toolResults.length > 0) {
            console.log('🔧 Tool Results:');
            toolResults.forEach((result, index) => {
              console.log(`  [${index + 1}] Result:`, typeof result === 'object' ? JSON.stringify(result) : result);
            });
          }
          
          if (usage) {
            console.log('📈 Usage:', usage);
          }
          
          console.log('------------------------');
        },
        onFinish: async () => {
          await mcpClient.close();
        },
      });

      result.mergeIntoDataStream(dataStream);
    },
  });
}



