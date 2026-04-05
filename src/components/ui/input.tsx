import * as React from "react";

import { cn } from "@/lib/utils";

function Input({
  className,
  type,
  value,
  onChange,
  ...props
}: React.ComponentProps<"input">) {
  const [hasValue, setHasValue] = React.useState(false);

  // Initialize hasValue based on initial value
  React.useEffect(() => {
    if (value !== undefined) {
      setHasValue(String(value).length > 0);
    }
  }, [value]);

  // Handle onChange to ensure immediate state update
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Update hasValue immediately for responsive styling
    setHasValue(e.target.value.length > 0);

    // Call original onChange if provided
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <input
      type={type}
      value={value}
      onChange={handleChange}
      data-slot="input"
      data-has-value={hasValue}
      className={cn(
        // Base styles - DEFAULT state (thin border)
        "h-8 w-full min-w-0 rounded-lg border border-gray-300 bg-transparent px-2.5 py-1 text-base transition-all duration-200 outline-none",
        // File input styles
        "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        // Placeholder styles
        "placeholder:text-muted-foreground",
        // HOVER state - thick black border with !important
        "hover:!border-[2px] hover:!border-black",
        // ACTIVE/FOCUS state - thick black border with !important
        "focus:!border-[2px] focus:!border-black focus:ring-0",
        // TYPING state - thick black border when has value with !important
        "data-[has-value=true]:!border-[2px] data-[has-value=true]:!border-black",
        // DISABLED state
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-50 disabled:border-gray-200",
        // ERROR state - thick red border with !important
        "aria-invalid:!border-[2px] aria-invalid:!border-red-500 aria-invalid:ring-0",
        // Dark mode adjustments
        "dark:border-gray-600 dark:bg-input/30 dark:hover:!border-black dark:focus:!border-black dark:disabled:bg-input/80 dark:disabled:border-gray-700 dark:aria-invalid:!border-red-400",
        // Responsive text size
        "md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
