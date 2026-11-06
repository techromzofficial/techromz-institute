"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  CustomerRecord,
  CustomerFilterState,
  CustomerKpiCard,
  CustomerStatusSummaryData,
  CustomerHealthMetricItem,
} from "@/types/customer";
import { exportCustomerReportCSV } from "@/utils/exportCustomerReport";
import { customerApi } from "@/lib/api/customers";

export function useCustomerDirectory() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [kpis, setKpis] = useState<CustomerKpiCard[]>([]);
  const [statusSummary, setStatusSummary] = useState<CustomerStatusSummaryData | null>(null);
  const [healthScorecard, setHealthScorecard] = useState<CustomerHealthMetricItem[] | null>(null);
  const [pagination, setPagination] = useState<{ total: number; currentPage: number; perPage: number; lastPage: number }>({
    total: 0,
    currentPage: 1,
    perPage: 25,
    lastPage: 1,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastSynced, setLastSynced] = useState<string>("");

  // Drawers & Modals
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false);

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // Filters State
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
    owner: searchParams?.get("owner") || "All",
    updatedDate: searchParams?.get("updatedDate") || "30D",
    activeTab: searchParams?.get("view") || "all",
    quickChips: searchParams?.get("chip") ? [searchParams?.get("chip")!] : [],
  });


  // Sorting
  const [sortColumn, setSortColumn] = useState<keyof CustomerRecord>("updatedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Fetch Directory Data from API
  const fetchDirectory = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await customerApi.getDirectory({
        q: filters.searchQuery,
        lifecycle_state:
          filters.activeTab === "all"
            ? undefined
            : filters.activeTab,
        page: pagination.currentPage,
        perPage: pagination.perPage,
        sort: sortColumn,
        direction: sortDirection,
      });

      const fetchedCustomers = res.customers || [];
      setCustomers(fetchedCustomers);
      setPagination(res.pagination || { total: fetchedCustomers.length, currentPage: 1, perPage: 25, lastPage: 1 });
      
      if (res.kpis && res.kpis.length > 0) {
        setKpis(res.kpis);
      }
      if (res.statusSummary) {
        setStatusSummary(res.statusSummary);
      }
      if (res.healthScorecard) {
        setHealthScorecard(res.healthScorecard);
      }

      setLastSynced(new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }));
    } catch (error) {
      console.error("Failed to load customer directory:", error);
      showToast("Failed to load customer directory data from server.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [filters, pagination.currentPage, pagination.perPage, sortColumn, sortDirection, showToast]);

  useEffect(() => {
    fetchDirectory();
  }, [fetchDirectory]);

  // Selected customer record
  const selectedCustomer = useMemo(() => {
    if (!selectedCustomerId) return null;
    return customers.find((c) => c.id === selectedCustomerId) || null;
  }, [customers, selectedCustomerId]);

  const handleFilterChange = (key: keyof CustomerFilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearAll = () => {
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
      owner: "All",
      updatedDate: "30D",
      activeTab: "all",
      quickChips: [],
    });
    showToast("Filters reset to default.");
  };

  const handleToggleQuickChip = (chip: string) => {
    setFilters((prev) => {
      const exists = prev.quickChips.includes(chip);
      const nextChips = exists
        ? prev.quickChips.filter((c) => c !== chip)
        : [...prev.quickChips, chip];
      return { ...prev, quickChips: nextChips };
    });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    showToast("Syncing customer directory data...");
    fetchDirectory();
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedRowIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedRowIds.length === customers.length) {
      setSelectedRowIds([]);
    } else {
      setSelectedRowIds(customers.map((c) => c.id));
    }
  };

  const handleExport = () => {
    exportCustomerReportCSV(customers);
    showToast("Exported customer directory report to CSV.");
  };

  return {
    customers,
    selectedCustomer,
    selectedCustomerId,
    setSelectedCustomerId,
    selectedRowIds,
    setSelectedRowIds,
    kpis,
    statusSummary,
    healthScorecard,
    pagination,
    setPagination,
    isLoading,
    isRefreshing,
    lastSynced,
    filters,
    setFilters,
    handleFilterChange,
    handleClearAll,
    handleToggleQuickChip,
    handleRefresh,
    handleToggleSelectRow,
    handleToggleSelectAll,
    handleExport,
    sortColumn,
    setSortColumn,
    sortDirection,
    setSortDirection,
    toastMessage,
    showToast,
    isAddDrawerOpen,
    setIsAddDrawerOpen,
    isSaveModalOpen,
    setIsSaveModalOpen,
    isMoreFiltersOpen,
    setIsMoreFiltersOpen,
  };
}
