'use client';

import { useChat } from '@ai-sdk/react';
import { Markdown } from './markdown';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, data, setData } =
    useChat({ api: '/api/use-chat-streamdata-multistep' });

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {data && (
        <>
          <pre className="p-4 text-sm bg-gray-100">
            {JSON.stringify(data, null, 2)}
          </pre>
          <button
            onClick={() => setData(undefined)}
            className="px-4 py-2 mt-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Clear Data
          </button>
        </>
      )}

      {messages?.map(message => (
        <div key={message.id} className="whitespace-pre-wrap">
          <strong>{`${message.role}: `}</strong>
          {message.parts.map((part, index) => {
            switch (part.type) {
              case 'text':
                return (
                  <Markdown className="prose prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base prose-h5:text-sm prose-h6:text-xs">
                    {part.text}
                  </Markdown>
                );
                
          
              case 'tool-invocation': {
                const toolInvocation = part.toolInvocation;
                const toolCallId = toolInvocation.toolCallId;
                const toolName = toolInvocation.toolName;
                const args  = toolInvocation.args;
                return (
                  <div
                    key={toolCallId}
                    className="p-4 my-2 text-gray-500 border border-gray-300  bg-[#F6F4EC] rounded"
                  >
                    <h4 className="mb-2 text-[#4F531F] "><b>{toolName?? ''}</b></h4>
                    <div className="flex flex-col gap-2 text-[#341C02]">
                      {args?.goal && <div>{args.goal}</div>}
                    </div>
                  </div>
                );
              }
            }
          })}
          <br />
          <br />
        </div>
      ))}

      <form
        onSubmit={e => {
          setData(undefined); // clear stream data
          handleSubmit(e);
        }}
      >
  
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
