import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  LockKeyhole,
  PackageSearch,
  ShieldCheck,
} from "lucide-react";

export default function DeferredApprovalInventoryPage({
  params,
}: {
  params: Promise<{
    productId: string;
  }>;
}) {
  return <DeferredApprovalInventoryContent params={params} />;
}

async function DeferredApprovalInventoryContent({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const approvalHref = `/admin/catalogue/product-approvals/${productId}`;

  return (
    <div className="flex flex-col gap-4 p-6">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-500">
          Catalogue
          <span className="mx-2 text-gray-300">
            /
          </span>
          Product Approvals
          <span className="mx-2 text-gray-300">
            /
          </span>
          Inventory Reference
        </div>

        <Link
          href={approvalHref}
          className="inline-flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-gray-600 hover:text-[#741d35]"
        >
          <ArrowLeft size={13} />
          Back to Approval Review
        </Link>

        <h1 className="mt-2 text-xl font-bold tracking-tight text-gray-900">
          Approval Inventory Reference
        </h1>

        <p className="mt-1 text-[11px] text-gray-500">
          Approval decisions use the backend-certified read summary while
          Inventory operations remain separately owned.
        </p>
      </div>

      <section className="bg-white border border-gray-200 rounded shadow-2xs overflow-hidden">
        <div className="flex items-start gap-3 px-5 py-4 border-b border-gray-100">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-[#741d35]/15 bg-[#741d35]/5 text-[#741d35]">
            <Eye size={17} />
          </div>

          <div>
            <h2 className="text-sm font-bold text-gray-900">
              Read-only Inventory Boundary
            </h2>

            <p className="mt-0.5 text-[10.5px] text-gray-500">
              No mock stock, batch or expiry data is rendered in this
              Catalogue approval route.
            </p>
          </div>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BoundaryCard
              icon={<ShieldCheck size={15} />}
              title="Approval Evidence"
              description="The Product Approval workspace uses the backend-certified Inventory read summary as review evidence."
            />

            <BoundaryCard
              icon={<LockKeyhole size={15} />}
              title="No Inventory Mutation"
              description="Stock, batch, expiry, quarantine and adjustment operations remain owned by the authoritative Inventory module."
            />
          </div>

          <div className="mt-4 rounded border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-start gap-2">
              <PackageSearch
                size={14}
                className="mt-0.5 shrink-0 text-[#741d35]"
              />

              <p className="text-[10px] leading-relaxed text-gray-600">
                Return to the Product Approval workspace to review the current
                authoritative Product and Inventory evidence used for the
                decision.
              </p>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100">
            <Link
              href={approvalHref}
              className="inline-flex h-9 items-center justify-center rounded bg-[#741d35] px-4 text-[11px] font-bold text-white hover:bg-[#5c172a]"
            >
              Return to Approval Review
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function BoundaryCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded border border-gray-200 bg-gray-50 p-4">
      <div className="text-[#741d35]">
        {icon}
      </div>

      <h3 className="mt-3 text-[11px] font-bold text-gray-900">
        {title}
      </h3>

      <p className="mt-1 text-[10px] leading-relaxed text-gray-500">
        {description}
      </p>
    </div>
  );
}
