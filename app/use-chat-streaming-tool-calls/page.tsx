'use client';

import { ToolInvocation } from 'ai';
import { Message, useChat } from '@ai-sdk/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/use-chat-streaming-tool-calls',
    maxSteps: 5,

    // run client-side tools that are automatically executed:
    async onToolCall({ toolCall }) {
      if (toolCall.toolName === 'showWeatherInformation') {
        // display tool. add tool result that informs the llm that the tool was executed.
        return 'Weather information was shown to the user.';
      }
    },
  });

  // used to only render the role when it changes:
  let lastRole: string | undefined = undefined;

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages?.map((m: Message) => {
        const isNewRole = m.role !== lastRole;
        lastRole = m.role;

        return (
          <div key={m.id} className="whitespace-pre-wrap">
            {isNewRole && <strong>{`${m.role}: `}</strong>}
            {m.content}
                
                    <div key={m.id} className="whitespace-pre-wrap">
                      {m.parts?.map((part, i) => {
                        switch (part.type) {
                          case 'tool-invocation':
                            const toolInvocation = part.toolInvocation;
                            const toolCallId = toolInvocation.toolCallId;
                            const toolName = toolInvocation.toolName;
                            const dynamicInfoStyles = 'font-mono bg-gray-100 p-1 text-sm';
                            const args  = toolInvocation.args;
                            // render confirmation tool (client-side tool with user interaction)
                            if (
                              toolName === 'showWeatherInformation' 
                            ) {
                              return (
                                <div
                                  key={toolCallId}
                                  className="p-4 my-2 text-gray-500 border border-gray-300  bg-[#F6F4EC] rounded"
                                >
                                  <h4 className="mb-2 text-[#4F531F] "><b>{args?.city ?? ''}</b></h4>
                                  <div className="flex flex-col gap-2 text-[#341C02]">
                                    <div className="flex gap-2 ">
                                      {args?.weather && <b>{args.weather}</b>}
                                      {args?.temperature && <b>{args.temperature} &deg;C</b>}
                                    </div>
                                    {args?.typicalWeather && <div>{args.typicalWeather}</div>}
                                  </div>
                                </div>
                              );
                            }
                        }
                      })}
                    </div>
          </div>
        );
      })}

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8  border-2 rounded shadow-xl outline-none focus:border-[#EFC87D] transition-colors"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
