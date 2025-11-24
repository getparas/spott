"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

const ExploreLayout = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();

  const isMainExplore = pathname === "/explore";
  return (
    <div className="min-h-screen pb-16">
      <div className="mx-auto max-w-7xl px-6">
        {!isMainExplore && (
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/explore")}
              className="-ml-2 gap-2"
            >
              <ArrowLeft className="size-4" />
              Back to Explore
            </Button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default ExploreLayout;
