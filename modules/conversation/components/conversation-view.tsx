"use client"
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useQueryClient } from '@tanstack/react-query'
import { DefaultChatTransport, type UIMessage } from 'ai'
import React, { useMemo } from 'react'
import { useConversations } from '../hooks/use-conversation'
import { useChat } from '@ai-sdk/react';
import { queryKeys } from '../utils/query-keys'
import { toast } from '@/components/ui/toast'
import {ChatEmpty} from './chat-emty'
import {ChatMessages }from './chat-messages'
import { ChatComposer } from './chat-composer'


type conversationViewProps = {
    conversationId: string,
    initialMessages: UIMessage[]
}
export const conversationView = ({ conversationId, initialMessages }: conversationViewProps) => {

    const queryClient = useQueryClient();
    const { conversationsQuery } = useConversations();
    const conversations = conversationsQuery.data;

    const transport = useMemo(() => new DefaultChatTransport({
        api: "api/chat",
        prepareSendMessagesRequest: ({ id, messages }) => ({
            body: {
                id, message: messages.at(-1)
            }
        })
    }
    ), []);

    const { messages, sendMessage, status } = useChat({
        id: conversationId,
        messages: initialMessages,
        transport,
        onFinish: () => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.conversations.all,
            });
        },
        onError: (error) => {
             toast.add({ title: error.message, type: "error" });
        }
    })

    const title =
    conversations?.find((item: { id: string }) => item.id === conversationId)?.title ?? "Chat";

    
    return (
        <div className="flex h-full min-h-0 flex-1 flex-col">
            <header className="flex h-14 shrink-0 items-center gap-2 border-b px-3">
                <SidebarTrigger />
                <Separator orientation="vertical" className="mx-1 h-4" />
                <h1 className="truncate text-sm font-medium">{title}</h1>
            </header>

            {messages.length === 0 ? (
                <ChatEmpty />
            ) : (
                <ChatMessages messages={messages} status={status} />
            )}

            <ChatComposer
                onSend={(text) => {
                    void sendMessage({ text });
                }}
                isSending={status !== "ready"}
                autoFocus
            />
        </div>
    )
}
