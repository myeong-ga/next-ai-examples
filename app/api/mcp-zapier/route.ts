import { openai } from '@ai-sdk/openai';
import { experimental_createMCPClient, streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const mcpClient = await experimental_createMCPClient({
    transport: {
      type: 'sse',
      url: 'https://actions.zapier.com/mcp/{$API-KEY}/sse',
    },
  });

  let stepCounter = 0;
  try {
    const zapierTools = await mcpClient.tools();

    const result = streamText({
      model: openai('gpt-4o-mini'),
      messages,
      toolChoice: 'required',
      tools: zapierTools,
      onFinish: async () => {
        await mcpClient.close();
      },
      maxSteps: 10,
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

    return result.toDataStreamResponse();
  } catch (error) {
    return new Response('Internal Server Error', { status: 500 });
  }
}
