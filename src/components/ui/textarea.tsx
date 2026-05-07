import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        data-slot="textarea"
        className={cn(
          "flex min-h-[104px] w-full rounded-[var(--app-radius-sm)] border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition-all placeholder:text-slate-400",
          "focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[var(--app-primary)]/15",
          "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 disabled:opacity-70",
          "aria-invalid:border-[var(--app-danger)] aria-invalid:ring-2 aria-invalid:ring-[var(--app-danger)]/15",
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
