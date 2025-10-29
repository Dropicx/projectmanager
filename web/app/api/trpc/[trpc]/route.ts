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

      const clerkUser = await currentUser();

      console.log(`[DEBUG] Looking up user: ${userId}`);

      // Get or create user in database
      let dbUser: any;
      try {
        dbUser = await db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1)
          .then((rows) => rows[0]);
        console.log(`[DEBUG] User lookup result:`, dbUser ? "Found" : "Not found");
      } catch (error: unknown) {
        console.error(`[ERROR] User lookup failed:`, (error as Error).message);
        console.error(
          `[ERROR] Full error:`,
          JSON.stringify(error, Object.getOwnPropertyNames(error))
        );
        console.error(`[ERROR] Error cause:`, (error as any)?.cause);
        throw error;
      }

      // Get or create organization if user has one
      let organizationId = orgId || dbUser?.organization_id;

      // In development, use the demo organization for all users
      // This allows seeing seeded data without additional setup
      const useDemoOrg =
        process.env.USE_DEMO_ORG === "true" || process.env.NODE_ENV === "development";
      const DEMO_ORG_ID = "00000000-0000-0000-0000-000000000001";

      if (!organizationId && useDemoOrg) {
        // Check if demo organization exists
        const demoOrg = await db
          .select()
          .from(organizations)
          .where(eq(organizations.id, DEMO_ORG_ID))
          .limit(1)
          .then((rows) => rows[0]);

        if (demoOrg) {
          console.log(`[DEV] Assigning user ${userId} to demo organization`);
          organizationId = DEMO_ORG_ID;
        }
      }

      // Create a default organization if user doesn't have one (production behavior)
      if (!organizationId) {
        const [newOrg] = await db
          .insert(organizations)
          .values({
            name: `${clerkUser?.firstName || "Personal"}'s Organization`,
          })
          .returning();
        organizationId = newOrg.id;
        console.log(`Created new organization ${organizationId} for user ${userId}`);
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
