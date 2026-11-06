"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeDollarSign,
  Calculator,
  CheckCircle2,
  Coins,
  Globe2,
  Info,
  Landmark,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";

import { PermissionGuard } from "@/components/admin/common/PermissionGuard";
import { ContextScopeBar } from "@/components/admin/shared/ContextScopeBar";
import { FINANCE_PERMISSIONS } from "@/features/finance/permissions/financePermissions";
import {
  financeApi,
  type FinanceExchangeRate,
  type FinancePaymentProviderCurrencyConfig,
  type FinanceTaxCurrencyResponse,
  type FinanceTaxRule,
} from "@/lib/api/finance";

function titleCase(
  value: string | null | undefined,
): string {
  if (!value) {
    return "—";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function formatDate(
  value: string | null | undefined,
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "2-digit",
    },
  ).format(date);
}

function formatRate(
  value: string | null | undefined,
): string {
  if (!value) {
    return "—";
  }

  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return value;
  }

  return numeric.toLocaleString(
    undefined,
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 8,
    },
  );
}

function statusClasses(
  status: string | null | undefined,
): string {
  switch (status) {
    case "active":
    case "enabled":
      return "border-green-200 bg-green-50 text-green-700";

    case "inactive":
    case "disabled":
    case "cancelled":
      return "border-gray-200 bg-gray-50 text-gray-600";

    case "draft":
    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-700";

    default:
      return "border-blue-200 bg-blue-50 text-blue-700";
  }
}

function StatusBadge({
  status,
}: {
  status: string | null | undefined;
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses(
        status,
      )}`}
    >
      {titleCase(status)}
    </span>
  );
}

function KpiCard({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {value}
          </p>

          <p className="mt-1 text-xs leading-5 text-gray-500">
            {description}
          </p>
        </div>

        <div className="rounded-lg bg-gray-50 p-3 text-gray-700">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function TaxCurrencyConfigurationPage() {
  const [
    response,
    setResponse,
  ] =
    useState<FinanceTaxCurrencyResponse | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(null);

  const [
    currencyFilter,
    setCurrencyFilter,
  ] = useState("");

  const [
    countryFilter,
    setCountryFilter,
  ] = useState("");

  const [
    taxStatusFilter,
    setTaxStatusFilter,
  ] = useState("");

  const loadConfiguration =
    useCallback(
      async (
        silent = false,
      ) => {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        try {
          const result =
            await financeApi.getTaxCurrencyConfiguration(
              {
                currency:
                  currencyFilter.trim() ||
                  undefined,

                country:
                  countryFilter.trim() ||
                  undefined,

                tax_status:
                  taxStatusFilter ||
                  undefined,
              },
            );

          setResponse(result);
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load tax and currency configuration.",
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [
        currencyFilter,
        countryFilter,
        taxStatusFilter,
      ],
    );

  useEffect(() => {
    void loadConfiguration();
  }, [loadConfiguration]);

  const currencies =
    response?.data.currencies ?? [];

  const selectableCurrencies = useMemo(
    () => currencies.filter((currency) => currency.status === "active"),
    [currencies],
  );

  const exchangeRates =
    response?.data.exchange_rates ?? [];

  const taxRules =
    response?.data.tax_rules ?? [];

  const paymentProviders =
    response?.data.payment_providers ??
    [];

  const summary =
    response?.summary;

  const capabilities =
    response?.capabilities;

  const tenantCurrencies =
    summary?.tenant_supported_currencies ??
    [];

  const configuredTenantCurrencies =
    response?.data.tenant_currencies ?? [];

  const [
    mutatingCode,
    setMutatingCode,
  ] = useState<string | null>(null);

  const [
    mutationMessage,
    setMutationMessage,
  ] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState("");
  const [isBaseCurrency, setIsBaseCurrency] = useState(false);
  const [submittingAdd, setSubmittingAdd] = useState(false);
  const [addModalError, setAddModalError] = useState<string | null>(null);

  const selectedCurrency = useMemo(() => {
    return selectableCurrencies.find((c) => c.code === selectedCurrencyCode) ?? null;
  }, [selectableCurrencies, selectedCurrencyCode]);

  const selectedCurrencyCountry = useMemo(() => {
    if (!selectedCurrencyCode) return null;
    const matchRule = taxRules.find(
      (r) =>
        r.country?.iso2 === selectedCurrencyCode.slice(0, 2) ||
        r.country?.iso3 === selectedCurrencyCode
    );
    if (matchRule?.country?.name) return matchRule.country.name;
    return "Not specified";
  }, [selectedCurrencyCode, taxRules]);

  const selectedRate = useMemo(() => {
    if (!selectedCurrencyCode) return null;
    return (
      exchangeRates.find(
        (r) =>
          r.base_currency === selectedCurrencyCode ||
          r.quote_currency === selectedCurrencyCode
      ) ?? null
    );
  }, [exchangeRates, selectedCurrencyCode]);

  const handleAddCurrencySubmit = async () => {
    if (!selectedCurrency) return;
    setSubmittingAdd(true);
    setAddModalError(null);

    try {
      const updatedResult = await financeApi.updateTenantCurrencyConfig({
        currency_code: selectedCurrencyCode,
        is_enabled: true,
        is_base: isBaseCurrency,
      });

      setResponse(updatedResult);
      setMutationMessage({
        type: "success",
        text: `${selectedCurrencyCode} has been added successfully.`,
      });
      setIsAddModalOpen(false);
      setSelectedCurrencyCode("");
      setIsBaseCurrency(false);
    } catch (err) {
      setAddModalError(
        err instanceof Error
          ? err.message
          : `Failed to add currency ${selectedCurrencyCode}.`
      );
    } finally {
      setSubmittingAdd(false);
    }
  };

  const handleUpdateTenantCurrency = async (
    currencyCode: string,
    isEnabled: boolean,
    isBase = false,
  ) => {
    setMutatingCode(currencyCode);
    setMutationMessage(null);

    try {
      const updatedResult =
        await financeApi.updateTenantCurrencyConfig({
          currency_code: currencyCode,
          is_enabled: isEnabled,
          is_base: isBase,
        });

      setResponse(updatedResult);
      setMutationMessage({
        type: "success",
        text: `Tenant currency ${currencyCode} configuration updated.`,
      });
    } catch (err) {
      setMutationMessage({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : `Failed to update tenant currency ${currencyCode}.`,
      });
    } finally {
      setMutatingCode(null);
    }
  };

  const taxStatuses =
    useMemo(() => {
      return Array.from(
        new Set(
          taxRules
            .map(
              (rule) =>
                rule.status,
            )
            .filter(Boolean),
        ),
      ).sort();
    }, [taxRules]);

  const resetFilters = () => {
    setCurrencyFilter("");
    setCountryFilter("");
    setTaxStatusFilter("");
  };

  return (
    <PermissionGuard
      permission={
        FINANCE_PERMISSIONS.view
      }
      fallback={
        <div
          className="p-6"
          role="alert"
        >
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="font-bold text-gray-900">
              Finance access required
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              You do not have permission
              to view Finance tax and
              currency configuration.
            </p>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-[1600px] space-y-6 p-6">
          <div>
            <Link
              href="/admin/finance"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Finance
            </Link>
          </div>

          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Finance</span>
                <span>/</span>
                <span>
                  Tax, Currency &
                  Configuration
                </span>
              </div>

              <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
                Tax, Currency &
                Configuration
              </h1>

              <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-500">
                Review platform currency
                references, exchange-rate
                evidence, tax rules and
                the currencies supported
                by payment providers for
                the current tenant.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setAddModalError(null);
                  setIsAddModalOpen(true);
                }}
                disabled={capabilities ? !capabilities.manage_tenant_currencies : false}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus className="h-4 w-4" />
                + Add Currency
              </button>
              <button
                type="button"
                onClick={() =>
                  void loadConfiguration(
                    true,
                  )
                }
                disabled={
                  loading ||
                  refreshing
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    refreshing
                      ? "animate-spin"
                      : ""
                  }`}
                />

                Refresh
              </button>
            </div>
          </div>

          <ContextScopeBar />

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />

              <div>
                <h2 className="text-sm font-bold text-blue-900">
                  Governed reference
                  configuration
                </h2>

                <p className="mt-1 text-sm leading-6 text-blue-800">
                  Currency, exchange-rate
                  and tax-rule information
                  shown here comes from
                  global localization
                  reference data. Tenant
                  payment-provider currency
                  support is shown only for
                  the current verified
                  tenant. Configuration
                  mutations are not exposed
                  until a governed tenant
                  workflow exists.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-sm font-bold text-red-800">
                    Unable to load
                    configuration
                  </h2>

                  <p className="mt-1 text-sm text-red-700">
                    {error}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    void loadConfiguration()
                  }
                  className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-700"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              label="Currencies"
              value={
                summary
                  ?.currency_count ?? 0
              }
              description={`${
                summary
                  ?.active_currency_count ??
                0
              } active reference currencies`}
              icon={
                <Coins className="h-5 w-5" />
              }
            />

            <KpiCard
              label="Exchange Rates"
              value={
                summary
                  ?.exchange_rate_count ??
                0
              }
              description="Active exchange-rate evidence records"
              icon={
                <BadgeDollarSign className="h-5 w-5" />
              }
            />

            <KpiCard
              label="Tax Rules"
              value={
                summary
                  ?.tax_rule_count ?? 0
              }
              description={`${
                summary
                  ?.active_tax_rule_count ??
                0
              } active global tax rules`}
              icon={
                <Calculator className="h-5 w-5" />
              }
            />

            <KpiCard
              label="Payment Providers"
              value={
                summary
                  ?.payment_provider_count ??
                0
              }
              description="Tenant-owned provider configurations"
              icon={
                <Landmark className="h-5 w-5" />
              }
            />
          </div>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="font-bold text-gray-900">
                  Tenant Currency Enablement & Governance
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Enable or disable currencies for this tenant and designate the tenant base currency. Open obligation safety rules apply automatically.
                </p>
              </div>
            </div>

            {mutationMessage && (
              <div
                role="alert"
                className={`mt-4 rounded-lg border p-3.5 text-sm font-semibold ${
                  mutationMessage.type === "success"
                    ? "border-green-200 bg-green-50 text-green-800"
                    : "border-red-200 bg-red-50 text-red-800"
                }`}
              >
                {mutationMessage.text}
              </div>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {currencies.map((curr) => {
                const config = configuredTenantCurrencies.find(
                  (tc) => tc.currency_code === curr.code
                );
                const isEnabled = config?.is_enabled ?? false;
                const isBase = config?.is_base ?? false;
                const isMutating = mutatingCode === curr.code;
                const isReferenceActive = curr.status === "active";

                return (
                  <div
                    key={curr.code}
                    className={`rounded-xl border p-4 transition ${
                      isEnabled
                        ? "border-blue-200 bg-blue-50/30"
                        : "border-gray-200 bg-gray-50/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-gray-900">
                        {curr.code} ({curr.symbol ?? curr.code})
                      </span>
                      {isBase ? (
                        <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-bold text-white">
                          Base Currency
                        </span>
                      ) : isEnabled ? (
                        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">
                          Enabled
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-500">
                          Disabled
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{curr.name}</p>

                    {capabilities?.manage_tenant_currencies && isReferenceActive && (
                      <div className="mt-4 flex items-center gap-2">
                        <button
                          type="button"
                          disabled={isMutating}
                          onClick={() =>
                            void handleUpdateTenantCurrency(
                              curr.code,
                              !isEnabled,
                              isBase
                            )
                          }
                          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition shadow-sm ${
                            isEnabled
                              ? "border border-red-200 bg-white text-red-700 hover:bg-red-50"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          } disabled:opacity-50`}
                        >
                          {isMutating ? "Saving…" : isEnabled ? "Disable" : "Enable"}
                        </button>

                        {isEnabled && !isBase && (
                          <button
                            type="button"
                            disabled={isMutating}
                            onClick={() =>
                              void handleUpdateTenantCurrency(
                                curr.code,
                                true,
                                true
                              )
                            }
                            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                          >
                            Set Base
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {configuredTenantCurrencies.filter((config) => !currencies.some((currency) => currency.code === config.currency_code)).map((config) => (
              <div key={config.uuid} className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
                {config.currency_code}: {config.is_base ? "Base currency; " : ""}{config.is_enabled ? "enabled" : "disabled"}. Reference not shown by current filters or no longer available; configuration retained as read-only evidence.
              </div>
            ))}
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div>
              <h2 className="font-bold text-gray-900">
                Reference Filters
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Filter global reference
                evidence. These values do
                not select or change the
                tenant context.
              </p>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-500">
                  Currency code
                </label>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                  <input
                    value={
                      currencyFilter
                    }
                    onChange={(event) =>
                      setCurrencyFilter(
                        event.target.value
                          .toUpperCase()
                          .slice(0, 3),
                      )
                    }
                    placeholder="LKR"
                    maxLength={3}
                    className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-500">
                  Country
                </label>

                <input
                  value={
                    countryFilter
                  }
                  onChange={(event) =>
                    setCountryFilter(
                      event.target.value,
                    )
                  }
                  placeholder="Sri Lanka"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-gray-400"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-500">
                  Tax status
                </label>

                <select
                  value={
                    taxStatusFilter
                  }
                  onChange={(event) =>
                    setTaxStatusFilter(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-gray-400"
                >
                  <option value="">
                    All statuses
                  </option>

                  {taxStatuses.map(
                    (status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {titleCase(
                          status,
                        )}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={
                    resetFilters
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Clear filters
                </button>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-gray-100 p-5">
              <div>
                <h2 className="font-bold text-gray-900">
                  Currency Reference
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Global currency master
                  reference. The legacy
                  currency exchange-rate
                  field is intentionally
                  not presented as a live
                  FX rate.
                </p>
              </div>

              <Globe2 className="h-5 w-5 text-gray-400" />
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                      Currency
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                      Symbol
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                      Decimal Places
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                      Status
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                      Default
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 bg-white">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-10 text-center text-sm text-gray-500"
                      >
                        Loading currency
                        references…
                      </td>
                    </tr>
                  ) : currencies.length >
                    0 ? (
                    currencies.map(
                      (currency) => (
                        <tr
                          key={
                            currency.uuid
                          }
                          className="hover:bg-gray-50"
                        >
                          <td className="px-5 py-4">
                            <div className="font-semibold text-gray-900">
                              {
                                currency.code
                              }
                            </div>

                            <div className="mt-0.5 text-xs text-gray-500">
                              {
                                currency.name
                              }
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm text-gray-700">
                            {currency.symbol ??
                              "—"}
                          </td>

                          <td className="px-5 py-4 text-sm text-gray-700">
                            {
                              currency.decimal_places
                            }
                          </td>

                          <td className="px-5 py-4">
                            <StatusBadge
                              status={
                                currency.status
                              }
                            />
                          </td>

                          <td className="px-5 py-4 text-sm text-gray-700">
                            {currency.is_default
                              ? "Yes"
                              : "No"}
                          </td>
                        </tr>
                      ),
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-10 text-center text-sm text-gray-500"
                      >
                        No currency
                        references match
                        the current filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-5">
              <h2 className="font-bold text-gray-900">
                Exchange-Rate Evidence
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Active records from the
                dedicated exchange-rate
                history table. Rates are
                presented with their
                recorded date and source;
                they are not described as
                live market rates.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                      Pair
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                      Rate
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                      Rate Date
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                      Source
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-10 text-center text-sm text-gray-500"
                      >
                        Loading exchange
                        rates…
                      </td>
                    </tr>
                  ) : exchangeRates.length >
                    0 ? (
                    exchangeRates.map(
                      (
                        rate: FinanceExchangeRate,
                      ) => (
                        <tr
                          key={rate.id}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-5 py-4">
                            <span className="font-semibold text-gray-900">
                              {
                                rate.base_currency
                              }
                            </span>

                            <span className="mx-2 text-gray-400">
                              →
                            </span>

                            <span className="font-semibold text-gray-900">
                              {
                                rate.quote_currency
                              }
                            </span>
                          </td>

                          <td className="px-5 py-4 font-mono text-sm text-gray-800">
                            {formatRate(
                              rate.rate,
                            )}
                          </td>

                          <td className="px-5 py-4 text-sm text-gray-700">
                            {formatDate(
                              rate.rate_date,
                            )}
                          </td>

                          <td className="px-5 py-4 text-sm text-gray-700">
                            {rate.source ??
                              "—"}
                          </td>

                          <td className="px-5 py-4">
                            <StatusBadge
                              status={
                                rate.status
                              }
                            />
                          </td>
                        </tr>
                      ),
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-10 text-center text-sm text-gray-500"
                      >
                        No exchange-rate
                        evidence is
                        available for the
                        current filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-5">
              <h2 className="font-bold text-gray-900">
                Tax Rule Reference
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Global tax-reference
                records by country and
                region. These rules are
                not tenant-editable from
                Finance.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                      Rule
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                      Jurisdiction
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                      Rate
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                      Effective Period
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-10 text-center text-sm text-gray-500"
                      >
                        Loading tax rules…
                      </td>
                    </tr>
                  ) : taxRules.length >
                    0 ? (
                    taxRules.map(
                      (
                        rule: FinanceTaxRule,
                      ) => (
                        <tr
                          key={
                            rule.uuid
                          }
                          className="hover:bg-gray-50"
                        >
                          <td className="px-5 py-4">
                            <div className="font-semibold text-gray-900">
                              {
                                rule.name
                              }
                            </div>

                            <div className="mt-0.5 text-xs text-gray-500">
                              {titleCase(
                                rule.tax_type,
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm text-gray-700">
                            <div>
                              {rule.country
                                ?.name ??
                                "Global"}
                            </div>

                            {rule.region && (
                              <div className="mt-0.5 text-xs text-gray-500">
                                {
                                  rule
                                    .region
                                    .name
                                }
                                {rule.region
                                  .code
                                  ? ` (${rule.region.code})`
                                  : ""}
                              </div>
                            )}
                          </td>

                          <td className="px-5 py-4 font-semibold text-gray-900">
                            {formatRate(
                              rule.rate,
                            )}
                            %
                          </td>

                          <td className="px-5 py-4 text-sm text-gray-700">
                            <div>
                              {formatDate(
                                rule.effective_from,
                              )}
                            </div>

                            <div className="mt-0.5 text-xs text-gray-500">
                              until{" "}
                              {formatDate(
                                rule.effective_until,
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <StatusBadge
                              status={
                                rule.status
                              }
                            />
                          </td>
                        </tr>
                      ),
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-10 text-center text-sm text-gray-500"
                      >
                        No tax-rule
                        references match
                        the current
                        filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-5">
              <h2 className="font-bold text-gray-900">
                Tenant Payment Provider
                Currency Configuration
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Safe operational evidence
                from payment-provider
                configurations belonging
                to the current tenant.
                Secret provider references
                and private configuration
                are not exposed.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                      Provider
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                      Environment
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                      Supported Currencies
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                      Capabilities
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-10 text-center text-sm text-gray-500"
                      >
                        Loading payment
                        provider
                        configuration…
                      </td>
                    </tr>
                  ) : paymentProviders.length >
                    0 ? (
                    paymentProviders.map(
                      (
                        provider: FinancePaymentProviderCurrencyConfig,
                      ) => (
                        <tr
                          key={
                            provider.uuid
                          }
                          className="align-top hover:bg-gray-50"
                        >
                          <td className="px-5 py-4">
                            <div className="font-semibold text-gray-900">
                              {provider.display_label ??
                                provider.provider_identifier}
                            </div>

                            <div className="mt-0.5 text-xs text-gray-500">
                              {
                                provider.provider_identifier
                              }
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm text-gray-700">
                            {titleCase(
                              provider.environment,
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex max-w-sm flex-wrap gap-1.5">
                              {provider
                                .supported_currencies
                                .length >
                              0 ? (
                                provider.supported_currencies.map(
                                  (
                                    currency,
                                  ) => (
                                    <span
                                      key={
                                        currency
                                      }
                                      className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-bold text-gray-700"
                                    >
                                      {
                                        currency
                                      }
                                    </span>
                                  ),
                                )
                              ) : (
                                <span className="text-sm text-gray-500">
                                  —
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex max-w-sm flex-wrap gap-1.5">
                              {provider
                                .enabled_capabilities
                                .length >
                              0 ? (
                                provider.enabled_capabilities.map(
                                  (
                                    capability,
                                  ) => (
                                    <span
                                      key={
                                        capability
                                      }
                                      className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600"
                                    >
                                      {titleCase(
                                        capability,
                                      )}
                                    </span>
                                  ),
                                )
                              ) : (
                                <span className="text-sm text-gray-500">
                                  —
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <StatusBadge
                              status={
                                provider.status
                              }
                            />
                          </td>
                        </tr>
                      ),
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-10 text-center text-sm text-gray-500"
                      >
                        No payment-provider
                        configurations are
                        available for the
                        current tenant.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-gray-700" />

              <div>
                <h2 className="font-bold text-gray-900">
                  Configuration
                  Capabilities
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Current backend
                  capabilities are shown
                  below. Disabled
                  capabilities do not
                  receive simulated UI
                  actions.
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    {
                      label:
                        "Currency reference",
                      enabled:
                        capabilities?.manage_currency_reference ??
                        false,
                    },
                    {
                      label:
                        "Exchange rates",
                      enabled:
                        capabilities?.manage_exchange_rates ??
                        false,
                    },
                    {
                      label:
                        "Tax rules",
                      enabled:
                        capabilities?.manage_tax_rules ??
                        false,
                    },
                    {
                      label:
                        "Provider currencies",
                      enabled:
                        capabilities?.manage_provider_currencies ??
                        false,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                    >
                      <div className="text-xs font-semibold text-gray-500">
                        {
                          item.label
                        }
                      </div>

                      <div className="mt-1 text-sm font-bold text-gray-900">
                        {item.enabled
                          ? "Manage"
                          : "Read only"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {isAddModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm">
              <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
                <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Add Currency</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Add an existing supported currency to this tenant.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleAddCurrencySubmit();
                  }}
                  className="mt-5 space-y-4"
                >
                  {addModalError && (
                    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-800">
                      {addModalError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                      Currency *
                    </label>
                    <select
                      value={selectedCurrencyCode}
                      onChange={(e) => {
                        setSelectedCurrencyCode(e.target.value);
                        setAddModalError(null);
                      }}
                      className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                      required
                    >
                      <option value="">Search or select currency</option>
                      {selectableCurrencies.map((c) => {
                        const config = configuredTenantCurrencies.find((tc) => tc.currency_code === c.code);
                        const isAlreadyEnabled = config?.is_enabled ?? false;
                        return (
                          <option key={c.code} value={c.code} disabled={isAlreadyEnabled}>
                            {c.code} — {c.name} {isAlreadyEnabled ? "(Already added)" : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {selectedCurrency ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600">Currency Name</label>
                          <input
                            type="text"
                            readOnly
                            value={selectedCurrency.name}
                            className="mt-1 block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-800 cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600">Currency Code</label>
                          <input
                            type="text"
                            readOnly
                            value={selectedCurrency.code}
                            className="mt-1 block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-800 cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600">Currency Symbol</label>
                          <input
                            type="text"
                            readOnly
                            value={selectedCurrency.symbol || "—"}
                            className="mt-1 block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-800 cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600">Country / Region</label>
                          <input
                            type="text"
                            readOnly
                            value={selectedCurrencyCountry || "Not specified"}
                            className="mt-1 block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-800 cursor-not-allowed"
                          />
                        </div>
                      </div>

                      {/* Provider Compatibility */}
                      <div className="rounded-xl border border-gray-200/80 bg-gray-50/60 p-3.5 text-xs">
                        <span className="block font-bold text-gray-800">Provider Compatibility</span>
                        <div className="mt-2 space-y-1.5">
                          {paymentProviders.length === 0 ? (
                            <span className="text-gray-500 italic">No providers configured</span>
                          ) : (
                            paymentProviders.map((p) => {
                              const isSupported = p.supported_currencies.includes(selectedCurrency.code);
                              return (
                                <div key={p.id} className="flex items-center justify-between text-xs">
                                  <span className="font-medium text-gray-700">{p.display_label || p.provider_identifier}</span>
                                  {isSupported ? (
                                    <span className="font-bold text-green-700">✓ Supported</span>
                                  ) : (
                                    <span className="font-semibold text-gray-400">✕ Not Supported</span>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                      {/* Exchange Rate Evidence */}
                      <div className="rounded-xl border border-gray-200/80 bg-gray-50/60 p-3.5 text-xs">
                        <span className="block font-bold text-gray-800">Exchange Rate Evidence</span>
                        {selectedRate ? (
                          <div className="mt-1 text-xs text-gray-600">
                            <span className="font-bold text-gray-900">
                              1 {selectedRate.base_currency} = {selectedRate.rate} {selectedRate.quote_currency}
                            </span>
                            <span className="ml-2 text-gray-500">({selectedRate.source} • {selectedRate.rate_date})</span>
                          </div>
                        ) : (
                          <span className="mt-1 block text-gray-500 italic">Exchange rate not available</span>
                        )}
                      </div>
                    </div>
                  ) : selectableCurrencies.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">No additional currencies are available to add.</p>
                  ) : null}

                  <div className="pt-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">Tenant Configuration</h3>
                    <div className="mt-2 rounded-xl border border-gray-200 p-4 bg-white">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isBaseCurrency}
                          onChange={(e) => setIsBaseCurrency(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                        />
                        <div>
                          <span className="text-xs font-bold text-gray-900">Make this the base/default currency</span>
                          <p className="mt-0.5 text-[11px] text-gray-500 leading-normal">
                            Designates this currency as the accounting base currency for this tenant. Base currency changes require all open financial obligations to be settled.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!selectedCurrency || submittingAdd}
                      onClick={() => void handleAddCurrencySubmit()}
                      className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submittingAdd ? "Adding…" : "Add Currency"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </PermissionGuard>
  );
}