"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import type { MessageRole, MessageStatus, Prisma } from "@/lib/generated/prisma/client";

import { requireUser } from "@/modules/auth/action/require-user";
import { assertOwnConversation } from "@/modules/conversation/action/conversation-action";

export type MessageListItem = {
    id: string;
    conversationId: string;
    role: MessageRole;
    status: MessageStatus;
    content: string;
    parts: Prisma.JsonValue | null;
    metadata: Prisma.JsonValue | null;
    createdAt: Date;
    updatedAt: Date;
};

export type CreateMessageInput = {
    conversationId: string;
    content: string;
    role?: MessageRole;
    status?: MessageStatus;
    parts?: Prisma.JsonValue | null;
    metadata?: Prisma.JsonValue | null;
};

export type UpdateMessageInput = {
    content?: string;
    role?: MessageRole;
    status?: MessageStatus;
    parts?: Prisma.JsonValue | null;
    metadata?: Prisma.JsonValue | null;
};

const messageListSelect = {
    id: true,
    conversationId: true,
    role: true,
    status: true,
    content: true,
    parts: true,
    metadata: true,
    createdAt: true,
    updatedAt: true,
} as const;

export async function listMessages(conversationId: string) {
    const user = await requireUser();

    await assertOwnConversation(conversationId, user.id);

    return prisma.message.findMany({
        where: {
            conversationId,
        },
        orderBy: {
            createdAt: "asc",
        },
        select: messageListSelect,
    });
}

async function assertOwnMessage(messageId: string, userId: string) {
    const message = await prisma.message.findFirst({
        where: {
            id: messageId,
            conversation: {
                userId,
            },
        },
    });

    if (!message) {
        throw new Error("Message not found");
    }

    return message;
}

export async function createMessage(input: CreateMessageInput) {
    const user = await requireUser();

    const conversation = await assertOwnConversation(input.conversationId, user.id);

    const content = input.content.trim();

    if (!content) {
        throw new Error("Message content cannot be empty");
    }

    const message = await prisma.message.create({
        data: {
            conversationId: conversation.id,
            role: input.role ?? "USER",
            status: input.status ?? "COMPLETE",
            content,
            parts: input.parts ?? undefined,
            metadata: input.metadata ?? undefined,
        } as unknown as Prisma.MessageCreateInput,
        select: messageListSelect,
    });

    await prisma.conversation.update({
        where: {
            id: conversation.id,
        },
        data: {
            lastMessageAt: new Date(),
        },
    });

    revalidatePath("/");

    return message;
}

export async function updateMessage(messageId: string, input: UpdateMessageInput) {
    const user = await requireUser();

    await assertOwnMessage(messageId, user.id);

    const content = input.content?.trim();

    const updatedMessage = await prisma.message.update({
        where: {
            id: messageId,
        },
        data: {
            content: content === undefined ? undefined : content,
            role: input.role,
            status: input.status,
            parts: input.parts === undefined ? undefined : input.parts,
            metadata: input.metadata === undefined ? undefined : input.metadata,
        } as unknown as Prisma.MessageUpdateInput,
        select: messageListSelect,
    });

    revalidatePath("/");

    return updatedMessage;
}

export async function deleteMessage(messageId: string) {
    const user = await requireUser();

    await assertOwnMessage(messageId, user.id);

    const deletedMessage = await prisma.message.delete({
        where: {
            id: messageId,
        },
        select: messageListSelect,
    });

    revalidatePath("/");

    return deletedMessage;
}
