import { redirect } from 'next/navigation';

export default function HomePage() {

  //redirect('/use-chat-human-in-the-loop');

  //redirect('/use-chat-streamdata-multistep');
 
  //redirect('/use-chat-persistence-single-message-image-output');

  // 4. MCP client with Human in the Loop
  redirect('/use-chat-mcp-hitl');
  
}