"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	createConversation,
	deleteConversation,
	listConversations,
	updateConversation,
	type CreateConversationInput,
	type ConversationListItem,
	type UpdateConversationInput,
} from "@/modules/conversation/action/conversation-action";
import { queryKeys } from "@/modules/conversation/utils/query-keys";

export function useConversation() {
	const queryClient = useQueryClient();

	const conversationsQuery = useQuery({
		queryKey: queryKeys.conversations.all,
		queryFn: listConversations,
	});

	const createConversationMutation = useMutation({
		mutationFn: (input: CreateConversationInput) => createConversation(input),
		onSuccess: async (conversation) => {
			await queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
			return conversation;
		},
	});

	const updateConversationMutation = useMutation({
		mutationFn: ({
			conversationId,
			input,
		}: {
			conversationId: string;
			input: UpdateConversationInput;
		}) => updateConversation(conversationId, input),
		onSuccess: async (conversation) => {
			await queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
			await queryClient.invalidateQueries({
				queryKey: queryKeys.conversations.detail(conversation.id),
			});
			return conversation;
		},
	});

	const deleteConversationMutation = useMutation({
		mutationFn: (conversationId: string) => deleteConversation(conversationId),
		onSuccess: async (conversation) => {
			await queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
			await queryClient.invalidateQueries({
				queryKey: queryKeys.conversations.detail(conversation.id),
			});
			return conversation;
		},
	});

	return {
		conversationsQuery,
		createConversationMutation,
		updateConversationMutation,
		deleteConversationMutation,
	};
}

export type { ConversationListItem };
