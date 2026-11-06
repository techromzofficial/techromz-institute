import { CaseDetailView } from "@/components/admin/verification/case-detail/CaseDetailView";

// Map fixture supplier IDs to verification internal IDs
const fixtureIdToInternalId: Record<string, string> = {
  'supplier-uuid-001': 'sup_1001', // Serene Botanics Lanka
  'supplier-uuid-002': 'sup_1002', // Ceylon Glow Exports
  'supplier-uuid-003': 'sup_1001', // Velvet Botanics Ltd. -> rich override!
  'supplier-uuid-004': 'sup_1006', // LuxeSkin Wholesale
  'supplier-uuid-005': 'sup_1008', // Ceylon Botanicals
  'supplier-uuid-006': 'sup_1007', // Tokyo Beauty Co.
};

export default async function Page({
  params,
}: {
  params: Promise<{ supplierId: string }>;
}) {
  const { supplierId } = await params;
  const mappedId = fixtureIdToInternalId[supplierId] || supplierId;

  return <CaseDetailView supplierId={mappedId} />;
}
