import { redirect } from 'next/navigation';

export default function HomePage() {

  // 1. Human in the Loop
  //redirect('/use-chat-human-in-the-loop');

  // 2. multi-step workflow
  //redirect('/use-chat-streamdata-multistep');
 
  // 3. gemini-2.0-flash-exp 를 이용한 이미지 생성 
  //redirect('/use-chat-persistence-single-message-image-output');

  // 4. MCP client with Human in the Loop
  //redirect('/use-chat-mcp-hitl');

  // 5. Server Action with gemini-2.0-flash-lite
  redirect('/server-action-gemini-2.0-flash-lite');
  
}