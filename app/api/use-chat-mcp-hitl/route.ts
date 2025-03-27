import { anthropic } from '@ai-sdk/anthropic';
import { createDataStreamResponse, Message, streamText, experimental_createMCPClient} from 'ai';
import { processToolCalls } from './utils';
import { tools as tools_hitl } from './tools';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;


export async function POST(req: Request) {
  const { messages }: { messages: Message[] } = await req.json();

  let mcpClient;

  const stdioTransport = new StdioClientTransport({
    command: 'node',
    args: ['lib/server/pokemon-server.mjs'],
  });

  mcpClient = await experimental_createMCPClient({
    transport: stdioTransport,
  });

  let stepCounter = 0;

  return createDataStreamResponse({
    execute: async dataStream => {
      // Utility function to handle tools that require human confirmation
      // Checks for confirmation in last message and then runs associated tool
      const processedMessages = await processToolCalls(
        {
          messages,
          dataStream,
          tools: tools_hitl,
        },
        {
           // type-safe object for tools without an execute function
           getWeatherInformation: async ({ city }) => {
            const conditions = ['sunny', 'cloudy', 'rainy', 'snowy'];
            return `The weather in ${city} is ${
              conditions[Math.floor(Math.random() * conditions.length)]
            }.`;
          },
        }
      );

      const mcpClientTools = await mcpClient.tools();
  
      const myToolSet = {
        ...mcpClientTools,  // tools from the MCP
        ...tools_hitl,      // tools from the Human-in-the-Loop
      };

      const result = streamText({
        model: anthropic('claude-3-5-haiku-latest'),
        messages: processedMessages,
        maxSteps: 10,
        tools: myToolSet,
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
        }
      });

      result.mergeIntoDataStream(dataStream);
    },
  });
}



