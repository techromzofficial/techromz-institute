"use client";

import { ErrorState } from "@/components/admin/common/States";

export default function Error({ error, reset }: { error: Error & { referenceId?: string | null }; reset: () => void }) {
  return <>
    <ErrorState />
    <div style={{ padding: "20px" }}>
      <p>Unable to complete this operation.</p>
      {error.referenceId && <p>Reference: {error.referenceId}</p>}
    </div>
    <button className="button primary" onClick={reset}>Try again</button>
  </>;
}
