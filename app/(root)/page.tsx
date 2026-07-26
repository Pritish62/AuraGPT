import { startNewChat } from '@/modules/home/actions/startNewChat';
import { redirect } from 'next/navigation';

export default async function Page() {
  const conversationId = await startNewChat();
  const targetPath = `/chat/${conversationId}`;

  redirect(targetPath);
}
