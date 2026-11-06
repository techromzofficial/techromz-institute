"use client";

import React, { Suspense } from "react";
import { CustomerDirectoryDashboard } from "@/components/admin/customers/directory/CustomerDirectoryDashboard";

export default function CustomerDirectoryPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm font-semibold">Loading Customer Directory...</div>}>
      <CustomerDirectoryDashboard />
    </Suspense>
  );
}
