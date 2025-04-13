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
  //redirect('/server-action-gemini-2.0-flash-lite');
  
  // 6. Visual Reasoning with llama-4-scout-17b-16e-instruct
  //redirect('/use-chat-vision');

  // 7. Multi Images Visual Reasoning with llama-4-scout-17b-16e-instruct
  //redirect('/use-chat-images-vision');

  // 8. XAI Image Generation with grok-2-image
  //redirect('/use-chat-xai-image');

  // 9. 스튜디오 지브리 스타일 이미지 변환기
  redirect('/ghibli-style-image-generation');
}