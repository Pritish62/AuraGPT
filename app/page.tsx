import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";

import { onBoard } from "@/modules/auth/action/onboard";

export default async function Home() {
  const clerkUser = await currentUser();

  if (clerkUser) {
    await onBoard();
  }

  return (
    <div>
      <div>hello world</div>
      <UserButton />
    </div>
  );
}

