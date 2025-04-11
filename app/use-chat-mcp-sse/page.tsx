'use client';

import { Message, useChat } from '@ai-sdk/react';
import {
  APPROVAL,
  getToolsRequiringConfirmation,
} from '../api/use-chat-mcp-sse/utils';
import { tools } from '../api/use-chat-mcp-sse/tools';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, addToolResult } =
    useChat({
      api: '/api/use-chat-mcp-sse',
      maxSteps: 5,
    });

  // HITL 가 필요한 tool
  const toolsRequiringConfirmation = getToolsRequiringConfirmation(tools);

  const pendingToolCallConfirmation = messages.some((m: Message) =>
    m.parts?.some(
      part =>
        part.type === 'tool-invocation' &&
        part.toolInvocation.state === 'call' &&
        toolsRequiringConfirmation.includes(part.toolInvocation.toolName),
    ),
  );

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages?.map((m: Message) => (
        <div key={m.id} className="whitespace-pre-wrap">
          <strong>{`${m.role}: `}</strong>
          {m.parts?.map((part, i) => {
            switch (part.type) {
              case 'text':
                return <div key={i}>{part.text}</div>;

              case 'tool-invocation':
                const toolInvocation = part.toolInvocation;
                const toolCallId = toolInvocation.toolCallId;
                const toolName = toolInvocation.toolName;
                const args  = toolInvocation.args;
                const dynamicInfoStyles = 'font-mono bg-gray-100 p-1 text-sm';

                // render confirmation tool (client-side tool with user interaction)
                if (
                  toolsRequiringConfirmation.includes(
                    toolInvocation.toolName,
                  ) &&
                  toolInvocation.state === 'call'
                ) {
                  return (
                    <div key={toolCallId} className="text-gray-500">
                      Run{' '}
                      <span className={dynamicInfoStyles}>
                        {toolInvocation.toolName}
                      </span>{' '}
                      with args:{' '}
                      <span className={dynamicInfoStyles}>
                        {JSON.stringify(toolInvocation.args)}
                      </span>
                      <div className="flex gap-2 pt-2">
                        <button
                          className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
                          onClick={() => {
                            console.log('HITL YES');
                            addToolResult({
                              toolCallId,
                              result: APPROVAL.YES,
                            })
                            
                          }

                          }
                        >
                          Yes
                        </button>
                        <button
                          className="px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700"
                          onClick={() =>
                            addToolResult({
                              toolCallId,
                              result: APPROVAL.NO,
                            })
                          }
                        >
                          No
                        </button>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div
                      key={toolCallId}
                      className="p-4 my-2 text-gray-500 border border-gray-300  bg-[#F6F4EC] rounded"
                    >
                      <h4 className="mb-2 text-[#4F531F] "><b>Tool : {toolName?? ''}</b></h4>
                      <div className="flex flex-col gap-2 text-[#341C02]">
                        {args?.name && <div> {args.name}</div>}
                      </div>
                    </div>
                  );
                }
            }
          })}
          <br />
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          disabled={pendingToolCallConfirmation}
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
