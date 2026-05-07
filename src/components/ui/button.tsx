import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-[var(--app-radius-sm)] border text-sm font-medium transition-all outline-none select-none cursor-pointer",
    "focus-visible:ring-2 focus-visible:ring-[var(--app-primary)]/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--app-primary)] text-white shadow-sm hover:bg-[var(--app-primary-strong)]",
        outline:
          "border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950",
        secondary:
          "border-transparent bg-slate-100 text-slate-700 shadow-sm hover:bg-slate-200 hover:text-slate-950",
        ghost:
          "border-transparent bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-950",
        destructive:
          "border-transparent bg-rose-600 text-white shadow-sm hover:bg-rose-700",
        link: "border-transparent bg-transparent text-[var(--app-primary)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-sm",
        lg: "h-10 px-5 text-sm",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
          </>
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
