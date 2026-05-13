import { useEffect, useState } from "react";

/**
 * Hook to detect if the component has mounted on the client.
 * Useful for preventing hydration errors when rendering client-only state.
 */
export function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted;
}
