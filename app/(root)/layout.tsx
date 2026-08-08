import { onBoard } from '@/modules/auth/action/onboard';
import { auth } from '@clerk/nextjs/server'
import React from 'react'
import { ChatShell } from '@/modules/conversation/components/chat-shell';
/**
 * Authenticated app layout — protects routes, syncs user to DB, and wraps content in `ChatShell`.
 */
const RootGrouplayout = async ({ children }: { children: React.ReactNode }) => {

    await auth.protect();
    await onBoard();

    return (

        <ChatShell>{children}</ChatShell>
    )
}

export default RootGrouplayout