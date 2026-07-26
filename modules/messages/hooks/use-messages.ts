"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/modules/conversation/utils/query-keys";
import {
    createMessage,
    deleteMessage,
    listMessages,
    updateMessage,
    type CreateMessageInput,
    type MessageListItem,
    type UpdateMessageInput,
} from "@/modules/messages/actions/message-action";

export function useMessages(conversationId: string) {
    const queryClient = useQueryClient();

    const messagesQuery = useQuery({
        queryKey: queryKeys.messages.byConversation(conversationId),
        queryFn: () => listMessages(conversationId),
        enabled: Boolean(conversationId),
    });

    const createMessageMutation = useMutation({
        mutationFn: (input: CreateMessageInput) => createMessage(input),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.messages.byConversation(conversationId),
            });
        },
    });

    const updateMessageMutation = useMutation({
        mutationFn: ({ messageId, input }: { messageId: string; input: UpdateMessageInput }) =>
            updateMessage(messageId, input),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.messages.byConversation(conversationId),
            });
        },
    });

    const deleteMessageMutation = useMutation({
        mutationFn: (messageId: string) => deleteMessage(messageId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.messages.byConversation(conversationId),
            });
        },
    });

    return {
        messagesQuery,
        createMessageMutation,
        updateMessageMutation,
        deleteMessageMutation,
    };
}

export type { MessageListItem };
