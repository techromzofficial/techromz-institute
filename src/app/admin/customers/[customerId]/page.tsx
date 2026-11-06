import { CustomerDetailDashboard } from "@/components/admin/customers/detail/CustomerDetailDashboard";

interface CustomerDetailPageProps {
  params: Promise<{
    customerId: string;
  }>;
}

export default async function CustomerDetailPage({
  params,
}: CustomerDetailPageProps) {
  const { customerId } = await params;

  return (
    <CustomerDetailDashboard
      customerId={customerId}
    />
  );
}