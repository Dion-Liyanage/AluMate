"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import DesignStudio from "@/components/design-studio/DesignStudio";

function StudioContent() {
  const searchParams = useSearchParams();
  const productType = (searchParams.get("type") ?? "other").toLowerCase();
  const savedDesignId = searchParams.get("savedDesignId") ?? undefined;

  return <DesignStudio productType={productType} savedDesignId={savedDesignId} />;
}

export default function StudioPage() {
  return (
    <DashboardLayout title="Design Studio">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
          </div>
        }
      >
        <StudioContent />
      </Suspense>
    </DashboardLayout>
  );
}
