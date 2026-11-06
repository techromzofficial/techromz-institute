import { PageHeader } from "@/components/admin/layout/PageHeader";
import { VerificationStatsGrid } from "@/components/admin/verification/VerificationStatsGrid";
import { SupplierQueue } from "@/components/admin/verification/SupplierQueue";
import { SystemEfficiencyCard } from "@/components/admin/verification/SystemEfficiencyCard";
import { ExpiringDocumentsCard } from "@/components/admin/verification/ExpiringDocumentsCard";

export default function SupplierVerificationPage() {
  return (
    <>
      <PageHeader
        title="Supplier Verification & Compliance"
        description="Review supplier applications, validate legal and commercial documentation, assess brand authorization and manage marketplace eligibility."
        crumbs={["Admin", "Verification & Compliance", "Supplier Verification"]}
        actions={
          <>
            <button className="button">View Audit History</button>
            <button className="button">Assign Cases</button>
            <button className="button">Export Report</button>
            <button className="button primary">Review Next Application</button>
          </>
        }
      />
      <div className="dashboard-stack">
        <VerificationStatsGrid />
        <div className="grid dashboard-operations-grid">
          <SupplierQueue />
          <div className="grid supplier-aside">
            <SystemEfficiencyCard />
            <ExpiringDocumentsCard />
          </div>
        </div>
      </div>
    </>
  );
}
