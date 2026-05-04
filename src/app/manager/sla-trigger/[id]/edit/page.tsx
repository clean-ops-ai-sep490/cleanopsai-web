"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DetailPageSkeleton } from "@/components/ui/page-skeleton";


export default function EditSLAPage() {
  const params = useParams();
  const id = params.id as string;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 0);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {ready ? (
        <div className="flex flex-col items-center justify-center p-12 text-center h-64">
          <h2 className="text-xl font-medium text-gray-800">Tính năng đang được xây dựng</h2>
          <p className="text-gray-500 mt-2">Chức năng chỉnh sửa SLA sẽ sớm được ra mắt.</p>
        </div>
      ) : <DetailPageSkeleton />}
    </>
  );
}
