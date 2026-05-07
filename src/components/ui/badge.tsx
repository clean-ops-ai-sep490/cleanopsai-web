import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none whitespace-nowrap",
  {
    variants: {
      variant: {
        default:
          "bg-slate-100 text-slate-900 hover:bg-slate-200/80",
        secondary:
          "bg-slate-800 text-slate-50 hover:bg-slate-800/80",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20",
        success:
          "bg-success/10 text-success hover:bg-success/20",
        warning:
          "bg-warning/10 text-warning hover:bg-warning/20",
        info:
          "bg-info/10 text-info hover:bg-info/20",
        outline: "text-slate-950 border border-slate-200 hover:bg-slate-50",
        ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
        link: "text-primary underline-offset-4 hover:underline bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
