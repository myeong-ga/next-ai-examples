import { createChat } from '@/lib/server/chat-store';
import { redirect } from 'next/navigation';


export default async function ChatPage() {
  const id = await createChat();
  redirect(`/use-chat-persistence-single-message-image-output/${id}`);
}
