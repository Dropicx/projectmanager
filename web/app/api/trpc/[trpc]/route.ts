import { auth, currentUser } from "@clerk/nextjs/server";
import { appRouter } from "@consulting-platform/api";
import { createContext } from "@consulting-platform/api/trpc/trpc";
import { db, organizations, users } from "@consulting-platform/database";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => {
      const { userId, orgId } = await auth();

      if (!userId) {
        return createContext();
      }

      const clerkUser: any = await currentUser();

      // Get or create user in database
      const dbUser = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)
        .then((rows: any) => rows[0]);

      // Get or create organization if user has one
      let organizationId = orgId || dbUser?.organization_id;

      // Create a default organization if user doesn't have one
      if (!organizationId) {
        const [newOrg] = await db
          .insert(organizations)
          .values({
            name: `${clerkUser?.firstName || "Personal"}'s Organization`,
          })
          .returning();
        organizationId = newOrg.id;
      }

      // Create or update user in database
      if (!dbUser) {
        await db
          .insert(users)
          .values({
            id: userId,
            organization_id: organizationId,
            email: clerkUser?.emailAddresses?.[0]?.emailAddress || "",
            first_name: clerkUser?.firstName || null,
            last_name: clerkUser?.lastName || null,
          })
          .onConflictDoNothing();
      } else if (dbUser.organization_id !== organizationId) {
        // Update user's organization if changed
        await db
          .update(users)
          .set({
            organization_id: organizationId,
            updated_at: new Date(),
          })
          .where(eq(users.id, userId));
      }

      return {
        ...createContext(),
        user: {
          id: userId,
          email: clerkUser?.emailAddresses[0]?.emailAddress || "",
          organizationId: organizationId,
        },
      };
    },
  });

export { handler as GET, handler as POST };
