import { loadChatMessages } from '@/modules/ai/actions/chat-store';
import { getConversation } from '@/modules/conversation/action/conversation-action';
import { conversationView as ConversationView } from '@/modules/conversation/components/conversation-view';
import { notFound } from 'next/navigation';
import React from 'react'

type ConversationPageProps = {
    params: Promise<{ id: string }>;
  };

/**
 * Conversation page — loads messages and renders the chat UI for a given ID.
 */
const page = async({params}:ConversationPageProps) => {
    const {id} = await params;

    try {
      await getConversation(id)
    } catch {
      notFound()
    }

    const initialMessages = await loadChatMessages(id);
    

  return (
    <ConversationView
      key={id}
      conversationId={id}
      initialMessages={initialMessages}
    />
  )
}

export default page