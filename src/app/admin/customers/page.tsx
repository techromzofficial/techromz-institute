"use client";

import React, { Suspense } from "react";
import { CustomerCommandDashboard } from "@/components/admin/customers/CustomerCommandDashboard";

export default function CustomerCommandCenterPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm font-semibold">Loading Customer Management Command Center...</div>}>
      <CustomerCommandDashboard />
    </Suspense>
  );
}
