"use server";

import { currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/db";

export async function requireUser() {
	const clerkUser = await currentUser();

	if (!clerkUser) {
		throw new Error("Unauthorized");
	}

	const user = await prisma.user.findUnique({
		where: {
			clerkId: clerkUser.id,
		},
	});

	if (!user) {
		throw new Error("User not found");
	}

	return user;
}
