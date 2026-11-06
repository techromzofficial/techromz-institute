import { CustomerFormDashboard } from "@/components/admin/customers/form/CustomerFormDashboard";

interface CustomerEditPageProps {
  params: Promise<{
    customerId: string;
  }>;
}

export default async function CustomerEditPage({
  params,
}: CustomerEditPageProps) {
  const { customerId } = await params;

  return (
    <CustomerFormDashboard
      mode="edit"
      customerId={customerId}
    />
  );
}