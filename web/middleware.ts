import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/api/health",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/trpc(.*)", // Allow API routes for authenticated requests
  // Footer pages - public access
  "/features",
  "/pricing",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/api",
  "/blog",
  "/security",
  "/cookies",
  "/gdpr",
  "/integrations",
  "/changelog",
  "/careers",
  "/partners",
]);

// Rate limit tracking (in-memory for simplicity)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export default clerkMiddleware(async (auth, req) => {
  // Simple rate limiting to prevent loops
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const now = Date.now();
  const windowMs = 60000; // 1 minute window
  const maxRequests = 100; // Max 100 requests per minute

  const userKey = `${ip}:${req.url}`;
  const requestData = requestCounts.get(userKey);

  if (requestData) {
    if (now < requestData.resetTime) {
      if (requestData.count >= maxRequests) {
        console.warn(`Rate limit exceeded for ${userKey}`);
        return new NextResponse("Too Many Requests", { status: 429 });
      }
      requestData.count++;
    } else {
      // Reset the window
      requestCounts.set(userKey, { count: 1, resetTime: now + windowMs });
    }
  } else {
    requestCounts.set(userKey, { count: 1, resetTime: now + windowMs });
  }

  // Clean up old entries periodically
  if (Math.random() < 0.01) {
    // 1% chance to clean up
    for (const [key, data] of requestCounts.entries()) {
      if (now > data.resetTime) {
        requestCounts.delete(key);
      }
    }
  }

  // Protect routes when Clerk is configured
  if (!isPublicRoute(req)) {
    try {
      const { userId } = await auth();
      if (!userId) {
        // For dashboard routes, let the client-side handle the redirect
        // This prevents server-side errors and allows for better UX
        if (
          req.nextUrl.pathname.startsWith("/dashboard") ||
          req.nextUrl.pathname.startsWith("/admin")
        ) {
          return NextResponse.next();
        }

        // For other protected routes, redirect to sign-in
        const signInUrl = new URL("/sign-in", req.url);
        signInUrl.searchParams.set("redirect_url", req.url);
        return NextResponse.redirect(signInUrl);
      }

      // Minimal admin check placeholder (future: fetch user role)
      if (req.nextUrl.pathname.startsWith("/admin")) {
        // Currently only ensures the user is authenticated. Role check can be added here
        return NextResponse.next();
      }
    } catch (error: unknown) {
      // Handle Clerk errors gracefully
      console.error("Clerk middleware error:", error);

      const err = error as { status?: number; message?: string };
      // If it's a rate limit error from Clerk, return a proper response
      if (err?.status === 429 || err?.message?.includes("rate")) {
        return new NextResponse(
          "Authentication service rate limit exceeded. Please try again in a few minutes.",
          {
            status: 429,
            headers: {
              "Retry-After": "60",
            },
          }
        );
      }

      // For dashboard routes, let client-side handle the error
      if (
        req.nextUrl.pathname.startsWith("/dashboard") ||
        req.nextUrl.pathname.startsWith("/admin")
      ) {
        return NextResponse.next();
      }

      // For other errors, redirect to sign-in
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
