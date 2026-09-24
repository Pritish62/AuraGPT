"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";

import { requireUser } from "@/modules/auth/action/require-user";

/** Shape of a conversation row returned in the sidebar list. */
export type ConversationListItem = {
    id: string;
    title: string;
    isPinned: boolean;
    isArchived: boolean;
    lastMessageAt: Date;
    createdAt: Date;
    updatedAt: Date;
};

export type CreateConversationInput = {
    title?: string;
    model?: string;
    systemPrompt?: string;
};

export type UpdateConversationInput = {
    title?: string;
    model?: string | null;
    systemPrompt?: string | null;
    isPinned?: boolean;
    isArchived?: boolean;
    lastMessageAt?: Date;
};

const conversationListSelect = {
    id: true,
    title: true,
    isPinned: true,
    isArchived: true,
    lastMessageAt: true,
    createdAt: true,
    updatedAt: true,
} as const;

export async function listConversations() {
    const user = await requireUser();

    return prisma.conversation.findMany({
        where: {
            userId: user.id,
        },
        orderBy: [
            {
                isPinned: "desc",
            },
            {
                lastMessageAt: "desc",
            },
        ],
        select: conversationListSelect,
    });
}

export async function assertOwnConversation(conversationId: string, userId: string) {
    const conversation = await prisma.conversation.findFirst({
        where: {
            id: conversationId,
            userId,
        },
    });

    if (!conversation) {
        throw new Error("Conversation not found");
    }

    return conversation;
}
export async function getConversation(conversationId:string) {
    const user = await requireUser();
    return assertOwnConversation(conversationId, user.id);
}
export async function createConversation(input: CreateConversationInput = {}) {
    const user = await requireUser();

    return prisma.conversation.create({
        data: {
            userId: user.id,
            title: input.title?.trim() || "New Chat",
            model: input.model?.trim() || null,
            systemPrompt: input.systemPrompt?.trim() || null,
        },
        select: conversationListSelect,
    });
}

export async function deleteConversation(conversationId: string) {
    const user = await requireUser();

    const conversation = await assertOwnConversation(conversationId, user.id);

    const deletedConversation = await prisma.conversation.delete({
        where: {
            id: conversation.id,
        },
        select: conversationListSelect,
    });

    revalidatePath("/");

    return deletedConversation;
}

export async function updateConversation(
    conversationId: string,
    input: UpdateConversationInput,
) {
    const user = await requireUser();

    const conversation = await assertOwnConversation(conversationId, user.id);

    const updatedConversation = await prisma.conversation.update({
        where: {
            id: conversation.id,
        },
        data: {
            title: input.title?.trim(),
            model: input.model === undefined ? undefined : input.model?.trim() || null,
            systemPrompt:
                input.systemPrompt === undefined ? undefined : input.systemPrompt?.trim() || null,
            isPinned: input.isPinned,
            isArchived: input.isArchived,
            lastMessageAt: input.lastMessageAt,
        },
        select: conversationListSelect,
    });

    revalidatePath("/");

    return updatedConversation;
}
