"use client";

import type { AppRouter } from "@consulting-platform/api/trpc/root";
import { createTRPCReact } from "@trpc/react-query";

export const api = createTRPCReact<AppRouter>();
