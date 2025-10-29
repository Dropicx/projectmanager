"use client";

import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "../lib/utils";

const switchVariants = cva(
  "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "h-6 w-11 data-[state=checked]:bg-indigo-600 data-[state=unchecked]:bg-gray-200",
        frox: "h-4 w-12 data-[state=checked]:bg-color-brands data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-dark-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const switchThumbVariants = cva(
  "pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform",
  {
    variants: {
      variant: {
        default: "h-5 w-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
        frox: "h-3 w-3 data-[state=checked]:translate-x-8 data-[state=unchecked]:translate-x-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>,
    VariantProps<typeof switchVariants> {}

const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitives.Root>, SwitchProps>(
  ({ className, variant, ...props }, ref) => (
    <SwitchPrimitives.Root
      className={cn(switchVariants({ variant, className }))}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb className={cn(switchThumbVariants({ variant }))} />
    </SwitchPrimitives.Root>
  )
);
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch, switchVariants };
