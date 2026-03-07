"use client";

import { useQuery } from "@tanstack/react-query";

export default function SampleQuery() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["hello"],
    queryFn: async () => {
      const res = await fetch("/api/hello");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h2>TanStack Query Sample</h2>
      <p>{data.message}</p>
      <p>Fetched at: {new Date(data.timestamp).toLocaleTimeString()}</p>
    </div>
  );
}
