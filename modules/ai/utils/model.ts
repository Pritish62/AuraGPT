import { createOpenAI } from '@ai-sdk/openai';

export const DEFAULT_CHAT_MODEL = "gpt-4o-mini";

const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY ?? process.env.OPEN_AI_API_KEY,
});

export function getChatModel(modelId ? : string | null){
    return openai(modelId || DEFAULT_CHAT_MODEL);
}