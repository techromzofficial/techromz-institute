import { CustomerRecord } from "@/types/customer";

export function exportCustomerReportCSV(customers: CustomerRecord[]) {
  if (!customers || customers.length === 0) return;

  const headers = [
    "Customer ID",
    "Customer Name",
    "Customer Type",
    "Email",
    "Phone",
    "Region",
    "Preferred Channel",
    "Verification Status",
    "Profile Completeness (%)",
    "Lifecycle Segment",
    "Loyalty Tier",
    "Total Orders",
    "Lifetime Value (LKR)",
    "Last Order Date",
    "Returns Count",
    "Open Cases Count",
    "Consent Status",
    "Risk Level",
    "Restriction Status",
    "Customer Owner",
    "Last Activity",
    "Updated At",
  ];

  const rows = customers.map((c) => [
    `"${c.id}"`,
    `"${c.name.replace(/"/g, '""')}"`,
    `"${c.customerType}"`,
    `"${c.email}"`,
    `"${c.phone}"`,
    `"${(c.region ?? "").replace(/"/g, '""')}"`,
    `"${c.preferredChannel}"`,
    `"${c.verificationStatus}"`,
    c.profileCompleteness,
    `"${c.lifecycleSegment}"`,
    `"${c.loyaltyTier}"`,
    c.totalOrders,
    c.lifetimeValue,
    `"${c.lastOrderDate}"`,
    c.returnsCount,
    c.openCasesCount,
    `"${c.consentStatus}"`,
    `"${c.riskLevel}"`,
    `"${c.restrictionStatus}"`,
    `"${c.owner}"`,
    `"${c.lastActivity}"`,
    `"${c.updatedAt}"`,
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute(
    "download",
    `Customer_Operations_Report_${new Date().toISOString().split("T")[0]}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
