import { prisma } from "@/lib/db";
import { loadChatMessages, saveChatMessages } from "@/modules/ai/actions/chat-store";
import { getChatModel } from "@/modules/ai/utils/model";
import { requireUser } from "@/modules/auth/action/require-user";
import { auth } from "@clerk/nextjs/server";
import {
    convertToModelMessages,
    createIdGenerator,
    createUIMessageStreamResponse,
    streamText,
    toUIMessageStream,
    type UIMessage,
} from 'ai';

async function POST(req:Request) {
    await auth.protect();
    
    const {message, id} : {message : UIMessage , id: string } = await req.json();

    if(!message  || !id ){
        return new Response("Missing message and conversation id" , {status : 400});

    }

    const user = await requireUser();

    const conversation = await prisma.conversation.findFirst({
        where: {
            id,
            userId: user.id,
        }
    })

    if(!conversation) {
        return new Response("conversation not found", {status: 400});
    }

    const previewsMessages = await loadChatMessages(id);

    const alreadySaved = previewsMessages.some(
        (storedMessage) => storedMessage.id === message.id
    )

    const messages = alreadySaved ? previewsMessages : [...previewsMessages, message]

    if(!alreadySaved) {
        await saveChatMessages(id, [message]);
    }

    const result = await streamText({
        model : getChatModel(conversation.model),
        system: conversation.systemPrompt ?? "You are AuraGPT ,A helpful assistant",
        messages: await convertToModelMessages(messages),
    })

    result.consumeStream();

    return createUIMessageStreamResponse({
        stream: toUIMessageStream({
            stream: result.stream,
            originalMessages : messages,
            generateMessageId: createIdGenerator({
                prefix: "msg", size: 16
            }),
            onEnd: async({
                messages: finalMessages
            }) => {
                try {
                    await saveChatMessages(id, finalMessages, {updateTitle: false} )
                } catch (error) {
                    console.error(error);
                }
            }
            
        })
    })
}