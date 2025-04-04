import { anthropic } from '@ai-sdk/anthropic';
import { createDataStreamResponse, Message, streamText, experimental_createMCPClient} from 'ai';
import { processToolCalls } from './utils';
import { tools as tools_hitl } from './tools';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const systemPrompt = `
Follow these steps for each interaction:

1. User Identification:
   - You should assume that you are interacting with default_user
   - If you have not identified default_user, proactively try to do so.

2. Memory Retrieval:
   - Always begin your chat by saying only "Remembering..." and retrieve all relevant information from your knowledge graph
   - Always refer to your knowledge graph as your "memory"

3. Memory
   - While conversing with the user, be attentive to any new information that falls into these categories:
     a) Basic Identity (age, gender, location, job title, education level, etc.)
     b) Behaviors (interests, habits, etc.)
     c) Preferences (communication style, preferred language, etc.)
     d) Goals (goals, targets, aspirations, etc.)
     e) Relationships (personal and professional relationships up to 3 degrees of separation)

4. Memory Update:
   - If any new information was gathered during the interaction, update your memory as follows:
     a) Create entities for recurring organizations, people, and significant events
     b) Connect them to the current entities using relations
     b) Store facts about them as observations
`;

export async function POST(req: Request) {
  const { messages }: { messages: Message[] } = await req.json();

  let mcpClient , mcpClient_ppl;

  // const stdioTransport = new StdioClientTransport({
  //   command: 'node',
  //   args: ['lib/server/pokemon-server.mjs'],
  // });
  const stdioTransport_ppl = new StdioClientTransport({
    command: 'node',
    args: ['lib/mcp-server/memory/index.mjs'],
  });
  // mcpClient = await experimental_createMCPClient({
  //   transport: stdioTransport,
  // });
  mcpClient_ppl = await experimental_createMCPClient({
    transport: stdioTransport_ppl,
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
            const conditions = [ 'snowy'];
            return `The weather in ${city} is ${
              conditions[Math.floor(Math.random() * conditions.length)]
            }.`;
          },
        }
      );

      // const mcpClientTools = await mcpClient.tools();
      const mcpClientTools = await mcpClient_ppl.tools();
      const myToolSet = {
        ...mcpClientTools,  // tools from the MCP
        ...tools_hitl,      // tools from the Human-in-the-Loop
      };

      const result = streamText({
        model: anthropic('claude-3-5-haiku-latest'),
        system:  systemPrompt,
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



