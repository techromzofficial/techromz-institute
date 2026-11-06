import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookOpen,
  LayoutDashboard,
  LayoutGrid,
  LifeBuoy,
  Megaphone,
  Settings,
  ShieldCheck,
  Store,
  Tags,
  Truck,
  Users,
  Wallet,
} from "lucide-react";

export type AdminNavigationItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  exact?: boolean;
  disabled?: boolean;
  badge?: string;
  permission?: string;
  children?: Array<{
    id: string;
    label: string;
    href?: string;
    exact?: boolean;
    disabled?: boolean;
    badge?: string;
    permission?: string;
  }>;
};

export const ADMIN_NAVIGATION: AdminNavigationItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    id: "marketplace",
    label: "Marketplace",
    href: "/admin/marketplace",
    icon: Store,
    permission: "marketplace.view",
    children: [
      {
        id: "marketplace-command-center",
        label: "Command Center",
        href: "/admin/marketplace",
        exact: true,
        permission: "marketplace.view",
      },
      {
        id: "orders",
        label: "Orders",
        href: "/admin/marketplace/orders",
        permission: "marketplace.view",
      },
      {
        id: "sellers",
        label: "Sellers",
        href: "/admin/marketplace/sellers",
        permission: "marketplace.view",
      },
      {
        id: "listings",
        label: "Listings",
        href: "/admin/marketplace/listings",
        permission: "marketplace.view",
      },
      {
        id: "promotions",
        label: "Promotions",
        href: "/admin/marketplace/promotions",
        permission: "marketplace.view",
      },
      {
        id: "policy-violations",
        label: "Policy Violations",
        href: "/admin/marketplace/policy-violations",
        permission: "marketplace.view",
      },
      {
        id: "returns",
        label: "Returns & Disputes",
        href: "/admin/marketplace/returns",
        permission: "marketplace.view",
      },
      {
        id: "channels",
        label: "Channels",
        href: "/admin/marketplace/channels",
        permission: "marketplace.view",
      },
    ],
  },
  {
    id: "catalogue",
    label: "Catalogue",
    href: "/admin/catalogue",
    icon: BookOpen,
    permission: "catalogue.view",
    children: [
      {
        id: "catalogue-overview",
        label: "Command Center",
        href: "/admin/catalogue",
        exact: true,
        permission: "catalogue.view",
      },
      {
        id: "products",
        label: "Product Master",
        href: "/admin/catalogue/products",
        permission: "products.view",
      },
      {
        id: "product-approvals",
        label: "Product Approvals",
        href: "/admin/catalogue/product-approvals",
        permission: "products.view",
      },
      {
        id: "catalogue-categories",
        label: "Categories",
        href: "/admin/catalogue/categories",
        permission: "catalogue.view",
      },
      {
        id: "catalogue-attributes",
        label: "Attributes",
        href: "/admin/catalogue/attributes",
        permission: "catalogue.view",
      },
      {
        id: "catalogue-brands",
        label: "Brands",
        href: "/admin/catalogue/brands",
        permission: "catalogue.view",
      },
      {
        id: "catalogue-media",
        label: "Media Assets",
        href: "/admin/catalogue/media",
        permission: "catalogue.view",
      },
      {
        id: "catalogue-quality",
        label: "Quality",
        href: "/admin/catalogue/quality",
        permission: "catalogue.quality.view",
      },
      {
        id: "catalogue-import-export",
        label: "Import / Export",
        href: "/admin/catalogue/import-export",
        permission: "catalogue.view",
      },
    ],
  },
  {
  id: "brands-suppliers",
  label: "Brands & Suppliers",
  href: "/admin/brands-suppliers",
  icon: Tags,
  children: [
    {
      id: "brands-suppliers-command-center",
      label: "Command Center",
      href: "/admin/brands-suppliers",
    },
    {
      id: "brands-suppliers-suppliers",
      label: "Suppliers",
      href: "/admin/brands-suppliers/suppliers",
    },
    {
      id: "brands-suppliers-verification",
      label: "Verification",
      href: "/admin/brands-suppliers/verification",
    },
    {
      id: "brands-suppliers-authorizations",
      label: "Brand Authorizations",
      href: "/admin/brands-suppliers/authorizations",
    },
    {
      id: "brands-suppliers-contracts",
      label: "Contracts",
      href: "/admin/brands-suppliers/contracts",
    },
    {
      id: "brands-suppliers-catalogue-coverage",
      label: "Catalogue Coverage",
      href: "/admin/brands-suppliers/catalogue-coverage",
    },
    {
      id: "brands-suppliers-performance",
      label: "Performance",
      href: "/admin/brands-suppliers/performance",
    },
    {
      id: "brands-suppliers-risk-compliance",
      label: "Risk & Compliance",
      href: "/admin/brands-suppliers/risk-compliance",
    },
    {
      id: "brands-suppliers-users-access",
      label: "Users & Access",
      href: "/admin/brands-suppliers/users-access",
    },
    {
      id: "brands-suppliers-import-export-audit",
      label: "Import / Export & Audit",
      href: "/admin/brands-suppliers/import-export-audit",
    },
  ],
  },
  {
  id: "verification-compliance",
  label: "Verification & Compliance",
  href: "/admin/verification-compliance",
  icon: ShieldCheck,
  permission: "compliance.view",
  children: [
    {
      id: "verification-compliance-command-center",
      label: "Command Center",
      href: "/admin/verification-compliance",
      exact: true,
      permission: "compliance.view",
    },
    {
      id: "verification-compliance-supplier-verification",
      label: "Supplier Verification",
      href: "/admin/verification-compliance/supplier-verification",
      permission: "compliance.cases.view",
    },
    {
      id: "verification-compliance-brand-authorizations",
      label: "Brand Authorizations",
      href: "/admin/verification-compliance/brand-authorizations",
      permission: "compliance.view",
    },
    {
      id: "verification-compliance-cases",
      label: "Compliance Cases",
      href: "/admin/verification-compliance/cases",
      permission: "compliance.cases.view",
    },
    {
      id: "verification-compliance-documents",
      label: "Documents & Evidence",
      href: "/admin/verification-compliance/documents",
      permission: "compliance.evidence.view",
    },
    {
      id: "verification-compliance-authenticity",
      label: "Product Authenticity",
      href: "/admin/verification-compliance/authenticity",
      permission: "compliance.view",
    },
    {
      id: "verification-compliance-product-safety",
      label: "Product Safety",
      href: "/admin/verification-compliance/product-safety",
      permission: "compliance.view",
    },
    {
      id: "verification-compliance-recalls",
      label: "Recalls & Quarantine",
      href: "/admin/verification-compliance/recalls",
      permission: "compliance.view",
    },
    {
      id: "verification-compliance-governance",
      label: "Governance",
      href: "/admin/verification-compliance/governance",
      permission: "compliance.rules.view",
    },
    {
      id: "verification-compliance-reports",
      label: "Reports",
      href: "/admin/verification-compliance/reports",
      permission: "compliance.reports.view",
    },
    {
      id: "verification-compliance-import-export-audit",
      label: "Import / Export & Audit",
      href: "/admin/verification-compliance/import-export-audit",
      permission: "compliance.audit.view",
    },
  ],
  },
  {
    id: "customers",
    label: "Customers",
    href: "/admin/customers",
    icon: Users,
    children: [
      {
        id: "customers-command-center",
        label: "Command Center",
        href: "/admin/customers",
        exact: true,
      },
      {
        id: "customers-directory",
        label: "Customer Directory",
        href: "/admin/customers/directory",
      },
      {
        id: "customers-create",
        label: "Create Customer",
        href: "/admin/customers/new",
      },
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    icon: Megaphone,
    disabled: true,
    badge: "Coming Soon",
  },
  {
  id: "finance",
  label: "Finance",
  icon: Wallet,
  href: "/admin/finance",
  permission: "finance.view",
  children: [
    {
      id: "finance-command-center",
      label: "Command Center",
      href: "/admin/finance",
      exact: true,
      permission: "finance.view",
    },
    {
      id: "finance-revenue-receivables",
      label: "Revenue & Receivables",
      href: "/admin/finance/revenue-receivables",
      permission: "finance.view",
    },
    {
      id: "finance-payments",
      label: "Payments",
      href: "/admin/finance/payments",
      permission: "finance.view",
    },
    {
      id: "finance-supplier-payables",
      label: "Supplier Payables",
      href: "/admin/finance/supplier-payables",
      permission: "finance.view",
    },
    {
      id: "finance-settlements-payouts",
      label: "Settlements & Payouts",
      href: "/admin/finance/settlements-payouts",
      permission: "finance.view",
    },
    {
      id: "finance-refunds-compensation",
      label: "Refunds & Compensation",
      href: "/admin/finance/refunds-compensation",
      permission: "finance.view",
    },
    {
      id: "finance-commissions-fees",
      label: "Commissions & Fees",
      href: "/admin/finance/commissions-fees",
      permission: "finance.view",
    },
    {
      id: "finance-invoices-notes",
      label: "Invoices & Notes",
      href: "/admin/finance/invoices-notes",
      permission: "finance.view",
    },
    {
      id: "finance-reconciliation-controls",
      label: "Reconciliation & Controls",
      href: "/admin/finance/reconciliation-controls",
      permission: "finance.view",
    },
    {
      id: "finance-tax-currency",
      label: "Tax & Currency",
      href: "/admin/finance/tax-currency-configuration",
      permission: "finance.view",
    },
    {
      id: "finance-reports-audit",
      label: "Reports & Audit",
      href: "/admin/finance/reports-import-export-audit",
      permission: "finance.view",
    },
  ],
  },
  {
    id: "logistics",
    label: "Logistics",
    icon: Truck,
    href: "/admin/logistics",
    permission: "logistics.view",
    children: [
      {
        id: "logistics-overview",
        label: "Command Center",
        href: "/admin/logistics",
        exact: true,
        permission: "logistics.view",
      },
      {
        id: "shipment-operations",
        label: "Shipment Operations",
        href: "/admin/logistics/shipments",
        permission: "logistics.view",
      },
      {
        id: "fulfilment-orders",
        label: "Fulfilment Orders",
        href: "/admin/logistics/fulfilment-orders",
        permission: "logistics.view",
      },
      {
        id: "logistics-carriers",
        label: "Carriers & Partners",
        href: "/admin/logistics/carriers",
        permission: "logistics.view",
      },
      {
        id: "logistics-locations",
        label: "Locations & Warehouses",
        href: "/admin/logistics/locations",
        permission: "logistics.view",
      },
      {
        id: "logistics-serviceability",
        label: "Serviceability & Routing",
        href: "/admin/logistics/serviceability-routing",
        permission: "logistics.view",
      },
      {
        id: "logistics-tracking",
        label: "Shipment Tracking",
        href: "/admin/logistics/tracking",
        permission: "logistics.view",
      },
      {
        id: "logistics-exceptions",
        label: "Operational Exceptions",
        href: "/admin/logistics/exceptions",
        permission: "logistics.view",
      },
      {
        id: "logistics-returns",
        label: "Returns & Reverse Logistics",
        href: "/admin/logistics/returns",
        permission: "logistics.view",
      },
      {
        id: "logistics-claims-cost",
        label: "Claims, Cost & Reconciliation",
        href: "/admin/logistics/claims-cost-reconciliation",
        permission: "logistics.view",
      },
      {
        id: "logistics-reports-audit",
        label: "Reports, Import / Export & Audit",
        href: "/admin/logistics/reports-import-export-audit",
        permission: "logistics.view",
      },
    ],
  },
  {
    id: "customer-support",
    label: "Customer Support",
    icon: LifeBuoy,
    permission: "support.case.view",
    href: "/admin/customer-support/support-operations",
    children: [
      {
        id: "customer-support-command-center",
        label: "Command Center",
        permission: "support.case.view",
        href: "/admin/customer-support/support-operations",
        exact: true,
      },
      {
        id: "customer-support-cases",
        label: "Cases",
        permission: "support.case.view",
        href: "/admin/customer-support/cases",
      },
      { id: "customer-support-conversations", label: "Conversations", href: "/admin/customer-support/conversations", permission: "support.case.view" },
      { id: "customer-support-complaints", label: "Complaints", href: "/admin/customer-support/complaints", permission: "support.case.view" },
      { id: "customer-support-returns-refunds", label: "Returns & Refunds", href: "/admin/customer-support/returns-refunds", permission: "support.case.view" },
      { id: "customer-support-order-delivery", label: "Order & Delivery", href: "/admin/customer-support/order-delivery", permission: "support.case.view" },
      { id: "customer-support-product-supplier", label: "Product & Supplier", href: "/admin/customer-support/product-supplier", permission: "support.case.view" },
      { id: "customer-support-sla-routing", label: "SLA & Routing", href: "/admin/customer-support/sla-routing", permission: "support.case.view" },
      { id: "customer-support-knowledge", label: "Knowledge", href: "/admin/customer-support/knowledge", permission: "support.case.view" },
      { id: "customer-support-satisfaction-qa", label: "Satisfaction & QA", href: "/admin/customer-support/satisfaction-qa", permission: "support.case.view" },
      { id: "customer-support-teams-performance", label: "Teams & Performance", href: "/admin/customer-support/teams-performance", permission: "support.case.view" },
      { id: "customer-support-reports-audit", label: "Reports & Audit", href: "/admin/customer-support/reports-audit", permission: "support.case.view" },
    ],
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    href: "/admin/analytics",
    children: [
      {
        id: "analytics-overview",
        label: "Analytics & BI",
        href: "/admin/analytics",
        exact: true,
      },
      {
        id: "analytics-reports",
        label: "Reports",
        href: "/admin/analytics/reports",
      },
    ],
  },
  {
    id: "ecosystem-modules",
    label: "Ecosystem Modules",
    icon: LayoutGrid,
    href: "/admin/ecosystem-modules",
  },
  {
    id: "administration",
    label: "Administration",
    icon: Settings,
    disabled: true,
    badge: "Coming Soon",
  },
];
