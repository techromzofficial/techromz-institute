"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  CustomerRecord,
  CustomerFilterState,
  CustomerKpiCard,
  CustomerRightRailSectionData,
  CustomerStatusSummaryData,
  CustomerHealthMetricItem,
} from "@/types/customer";
import { exportCustomerReportCSV } from "@/utils/exportCustomerReport";
import { customerApi } from "@/lib/api/customers";

export function useCustomerCommandCenter() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [kpis, setKpis] = useState<CustomerKpiCard[]>([]);
  const [statusSummary, setStatusSummary] = useState<CustomerStatusSummaryData | null>(null);
  const [healthScorecard, setHealthScorecard] = useState<CustomerHealthMetricItem[] | null>(null);
  const [rightRail, setRightRail] = useState<CustomerRightRailSectionData | null>(null);
  const [pagination, setPagination] = useState<{ total: number; currentPage: number; perPage: number; lastPage: number }>({
    total: 0,
    currentPage: 1,
    perPage: 25,
    lastPage: 1,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals & Drawers
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isSaveViewOpen, setIsSaveViewOpen] = useState(false);
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false);

  // Sync state
  const [lastSynced, setLastSynced] = useState("May 26, 2025 10:15 AM");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "info" | "warning";
  } | null>(null);

  const showToast = useCallback((text: string, type: "success" | "info" | "warning" = "info") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // Filter state
  const [filters, setFilters] = useState<CustomerFilterState>({
    searchQuery: searchParams?.get("q") || "",
    segment: searchParams?.get("segment") || "All",
    customerType: searchParams?.get("customerType") || "All",
    region: searchParams?.get("region") || "All",
    salesChannel: searchParams?.get("salesChannel") || "All",
    loyaltyTier: searchParams?.get("loyaltyTier") || "All",
    verificationStatus: searchParams?.get("verificationStatus") || "All",
    consentStatus: searchParams?.get("consentStatus") || "All",
    riskLevel: searchParams?.get("riskLevel") || "All",
    owner: searchParams?.get("owner") || "Any",
    updatedDate: searchParams?.get("updatedDate") || "All",
    activeTab: searchParams?.get("view") || "Overview",
    quickChips: searchParams?.get("chip") ? [searchParams?.get("chip")!] : [],
  });

  // Sorting
  const [sortColumn, setSortColumn] = useState<keyof CustomerRecord>("updatedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Sync tab change with URL
  const handleTabChange = (tabName: string) => {
    setFilters((prev) => ({ ...prev, activeTab: tabName }));
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("view", tabName);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };


  // Toggle quick-filter chip
  const handleToggleQuickChip = (chip: string) => {
    setFilters((prev) => {
      const exists = prev.quickChips.includes(chip);
      const updatedChips = exists
        ? prev.quickChips.filter((c) => c !== chip)
        : [...prev.quickChips, chip];
      return { ...prev, quickChips: updatedChips };
    });
  };

  const handleClearFilters = () => {
    setFilters({
      searchQuery: "",
      segment: "All",
      customerType: "All",
      region: "All",
      salesChannel: "All",
      loyaltyTier: "All",
      verificationStatus: "All",
      consentStatus: "All",
      riskLevel: "All",
      owner: "Any",
      updatedDate: "All",
      activeTab: "Overview",
      quickChips: [],
    });
    showToast("Cleared all customer filters.", "info");
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const data = await customerApi.getCommandCenterDashboard();
      setKpis(data.kpis);
      if (data.statusSummary) setStatusSummary(data.statusSummary);
      if (data.healthScorecard) setHealthScorecard(data.healthScorecard);
      setCustomers(data.customers);
      setPagination(data.pagination);
      setRightRail(data.rightRail);
      setLastSynced(new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }));
      showToast("Synced customer data from server.", "success");
    } catch (error) {
      console.error(error);
      showToast("Failed to sync data.", "warning");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Initial data load
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await customerApi.getCommandCenterDashboard();
        setKpis(data.kpis);
        if (data.statusSummary) setStatusSummary(data.statusSummary);
        if (data.healthScorecard) setHealthScorecard(data.healthScorecard);
        setCustomers(data.customers);
        setPagination(data.pagination);
        setRightRail(data.rightRail);
        setLastSynced(new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }));
        showToast('Loaded customer data.', 'success');
      } catch (error) {
        console.error(error);
        showToast('Failed to load data.', 'warning');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filtered dataset
  const filteredCustomers = useMemo(() => {
    return customers.filter((item) => {
      if (filters.activeTab === "Active" && item.lifecycleSegment !== "Active") return false;
      if (filters.activeTab === "New" && item.lifecycleSegment !== "New") return false;
      if (filters.activeTab === "Verified" && item.verificationStatus !== "Verified") return false;
      if (filters.activeTab === "Loyalty" && item.lifecycleSegment !== "Loyalty") return false;
      if (filters.activeTab === "Dormant" && item.lifecycleSegment !== "Dormant") return false;
      if (filters.activeTab === "Restricted" && item.lifecycleSegment !== "Restricted") return false;
      if (filters.activeTab === "High-Value" && item.lifecycleSegment !== "High-Value") return false;
      if (filters.activeTab === "Service Cases" && item.openCasesCount === 0) return false;
      if (filters.activeTab === "Returns & Disputes" && item.returnsCount === 0) return false;

      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const match =
          item.name.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q) ||
          item.email.toLowerCase().includes(q) ||
          item.phone.toLowerCase().includes(q) ||
          (item.region ?? "").toLowerCase().includes(q);        
          if (!match) return false;
      }

      if (filters.segment !== "All" && item.lifecycleSegment !== filters.segment) return false;
      if (filters.customerType !== "All" && item.customerType !== filters.customerType) return false;
      if (
        filters.region !== "All" &&
        !(item.region ?? "").includes(filters.region)
      ) {
        return false;
      }      if (filters.salesChannel !== "All" && item.preferredChannel !== filters.salesChannel) return false;
      if (filters.loyaltyTier !== "All" && item.loyaltyTier !== filters.loyaltyTier) return false;
      if (filters.verificationStatus !== "All" && item.verificationStatus !== filters.verificationStatus) return false;
      if (filters.consentStatus !== "All" && item.consentStatus !== filters.consentStatus) return false;
      if (filters.riskLevel !== "All" && item.riskLevel !== filters.riskLevel) return false;
      if (filters.owner !== "Any" && item.owner !== filters.owner) return false;

      if (filters.quickChips.includes("Assigned to Me") && item.owner !== "Rachel Dias") return false;
      if (filters.quickChips.includes("Verification Pending") && item.verificationStatus !== "Verification Pending") return false;
      if (filters.quickChips.includes("High-Value") && item.lifecycleSegment !== "High-Value") return false;
      if (filters.quickChips.includes("Dormant") && item.lifecycleSegment !== "Dormant") return false;
      if (filters.quickChips.includes("Restricted") && item.restrictionStatus !== "Restricted") return false;
      if (filters.quickChips.includes("Open Cases") && item.openCasesCount === 0) return false;
      if (filters.quickChips.includes("Return Risk") && item.returnsCount === 0) return false;

      return true;
    });
  }, [customers, filters]);

  // Sorted dataset
  const sortedCustomers = useMemo(() => {
    return [...filteredCustomers].sort((a, b) => {
      let valA: any = a[sortColumn];
      let valB: any = b[sortColumn];

      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredCustomers, sortColumn, sortDirection]);

  // Paginated dataset
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedCustomers.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedCustomers, currentPage, rowsPerPage]);

  const handleSort = (column: keyof CustomerRecord) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedRowIds((prev) =>
      prev.includes(id) ? prev.filter((rId) => rId !== id) : [...prev, id]
    );
  };

  const handleSelectAllOnPage = () => {
    const pageIds = paginatedCustomers.map((c) => c.id);
    const allSelected = pageIds.every((id) => selectedRowIds.includes(id));
    if (allSelected) {
      setSelectedRowIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedRowIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const selectedCustomer = useMemo(() => {
    if (!selectedCustomerId) return null;
    return customers.find((c) => c.id === selectedCustomerId) || null;
  }, [customers, selectedCustomerId]);

  const handleExportCSV = () => {
    exportCustomerReportCSV(sortedCustomers);
    showToast(`Exported ${sortedCustomers.length} customer records to CSV.`, "success");
  };

  return {
    customers,
    setCustomers,
    selectedCustomerId,
    setSelectedCustomerId,
    selectedCustomer,
    selectedRowIds,
    statusSummary,
    healthScorecard,

    filters,
    setFilters,
    handleTabChange,
    handleToggleQuickChip,

    filteredCustomers,
    paginatedCustomers,

    sortColumn,
    sortDirection,
    handleSort,
    handleSelectRow,
    handleSelectAllOnPage,
    handleClearFilters,
    handleExportCSV,

    currentPage,
    setCurrentPage,
    rowsPerPage,
    setRowsPerPage,

    toastMessage,
    showToast,
    lastSynced,
    isRefreshing,
    handleRefresh,

    // New data
    kpis,
    rightRail,
    pagination,
    isLoading,

    // Modals
    isAddCustomerOpen,
    setIsAddCustomerOpen,
    isSaveViewOpen,
    setIsSaveViewOpen,
    isMoreFiltersOpen,
    setIsMoreFiltersOpen,
  };
}
