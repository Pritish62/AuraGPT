import { prisma } from "@/lib/db";
import { onBoard } from "@/modules/auth/action/onboard";
import { requireUser } from "@/modules/auth/action/require-user";

export async function startNewChat() {
    await onBoard();

    const user = await requireUser();

    const conversation = await prisma.conversation.create({
        data: {
            userId: user.id,
            title: "new chat",
        },
    });

    return conversation.id;
}