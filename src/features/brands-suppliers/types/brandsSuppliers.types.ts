/**
 * Shared TypeScript types for the Brands & Suppliers admin module.
 * All shared UI components are driven exclusively by these types.
 * No page-specific data belongs inside shared components.
 */

// ---------------------------------------------------------------------------
// Page Header
// ---------------------------------------------------------------------------

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageAction {
  id: string;
  label: string;
  icon?: React.ElementType;
  variant?: 'primary' | 'secondary' | 'outline';
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export interface PageContextField {
  label: string;
  value: string;
}

export interface BrandsSuppliersPageHeaderProps {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  description?: string;
  primaryAction?: PageAction;
  secondaryActions?: PageAction[];
  /** Additional context bar fields beyond the defaults (tenant, ecosystem, etc.) */
  extraContextFields?: PageContextField[];
  context?: {
    tenant?: string;
    ecosystem?: string;
    businessUnit?: string;
    salesChannels?: string;
    region?: string;
    currency?: string;
    lastSynced?: string;
  };
}

// ---------------------------------------------------------------------------
// Donut Chart
// ---------------------------------------------------------------------------

export interface DonutChartItem {
  id: string;
  name: string;
  value: number;
  color: string;
  percentage?: string;
}

export interface DonutChartCardProps {
  title: string;
  subtitle?: string;
  totalLabel: string;
  totalValue: number | string;
  data: DonutChartItem[];
  loading?: boolean;
  emptyMessage?: string;
}

// ---------------------------------------------------------------------------
// Trend Chart
// ---------------------------------------------------------------------------

export interface TrendData {
  name: string;
  [key: string]: string | number;
}

export interface TrendChartSeries {
  key: string;
  name: string;
  color: string;
  type: 'line' | 'bar' | 'area';
}

export interface TrendRange {
  id: string;
  label: string;
}

export interface TrendChartCardProps {
  title: string;
  description?: string;
  data: TrendData[];
  series: TrendChartSeries[];
  timeRange?: string;
  ranges?: TrendRange[];
  selectedRange?: string;
  onRangeChange?: (range: string) => void;
  loading?: boolean;
  emptyMessage?: string;
}

// ---------------------------------------------------------------------------
// Supplier Data Table
// ---------------------------------------------------------------------------

export interface SupplierTablePaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions?: number[];
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export interface SupplierDataTableProps extends SupplierTablePaginationProps {
  data: import('@/services/api/brandsSuppliers').SupplierSummary[];
  onRowClick?: (id: string) => void;
  selectedIds?: string[];
  onSelectRow?: (id: string) => void;
  onSelectAll?: () => void;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

// ---------------------------------------------------------------------------
// Bottom Panels
// ---------------------------------------------------------------------------

export type BottomPanelStatus = 'success' | 'warning' | 'danger' | 'neutral';

export interface BottomPanelItem {
  id: string;
  label: string;
  value: string | number;
  percentage?: number;
  status?: BottomPanelStatus;
  href?: string;
}

export interface BottomPanelColumn {
  header: string;
  accessor: string;
  align?: 'left' | 'center' | 'right';
  /** Optional render function. Receives the row object. */
  render?: (row: Record<string, unknown>) => React.ReactNode;
}

export type BottomPanelSectionType = 'table' | 'cards-grid' | 'sla-tracker';

export interface BottomPanelSection {
  id: string;
  title: string;
  type: BottomPanelSectionType;
  badgeLabel?: string;
  footerAction?: { label: string; href?: string };
  /** For 'table' type sections */
  columns?: BottomPanelColumn[];
  rows?: Record<string, unknown>[];
  /** For 'cards-grid' type sections */
  items?: BottomPanelItem[];
}

export interface BrandsSuppliersBottomPanelProps {
  /** Two-column row of panel sections. Each inner array renders as one xl:grid row */
  rows: BottomPanelSection[][];
  loading?: boolean;
}

// ---------------------------------------------------------------------------
// Supplier Form
// ---------------------------------------------------------------------------

export interface SupplierFormValues {
  supplierName: string;
  legalName?: string;
  tradingName?: string;
  companyType?: string;
  yearEstablished?: string;
  description?: string;
  primaryContact?: string;
  contactRole?: string;
  email?: string;
  phone?: string;
  country?: string;
  status?: string;
}

export interface FormCompleteness {
  overallPercent: number;
  requiredCompleted: number;
  requiredTotal: number;
  blockingCount: number;
  warningCount: number;
  autosaveLabel?: string;
}

export interface FormBlockingIssue {
  id: string;
  label: string;
  severity: 'error' | 'warning';
  fixHref?: string;
}

export interface SupplierFormProps {
  mode: 'create' | 'edit';
  /** Supplier record identifier (used in breadcrumb & context bar) */
  supplierId?: string;
  /** Draft ID shown in context bar */
  draftId?: string;
  /** Record version shown in context bar */
  recordVersion?: string;
  /** Seed values for form fields. Component must not mutate this object. */
  initialValues?: Partial<SupplierFormValues>;
  /** Completeness data for the summary cards */
  completeness?: FormCompleteness;
  /** Blocking issues rendered in the right insight rail */
  blockingIssues?: FormBlockingIssue[];
  loading?: boolean;
  submitting?: boolean;
  readOnly?: boolean;
  onSave?: () => void | Promise<void>;
  onValidate?: () => void | Promise<void>;
  onPreview?: () => void;
  onSubmit?: () => void | Promise<void>;
  onCancel?: () => void;
}
