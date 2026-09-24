import { getConversation } from '@/modules/conversation/action/conversation-action'
import { notFound } from 'next/navigation'
import React from 'react'

type  ConversationPageProps = {
  params : Promise<{id : string}>
}
const page = async ({params} : ConversationPageProps) =>  {

  const { id } = await params;
  try {
    await getConversation(id);
  } catch (error) {
    notFound();
  }

  
  return (
    <div>this is chat page{id}</div>
  )
}

export default page