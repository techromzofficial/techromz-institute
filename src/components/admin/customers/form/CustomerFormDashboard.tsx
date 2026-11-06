"use client";

import React, {
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

import { CustomerFormHeader } from "./CustomerFormHeader";
import { CustomerFormStepper } from "./CustomerFormStepper";
import { CustomerFormTopKpis } from "./CustomerFormTopKpis";
import { CustomerBasicIdentityForm } from "./CustomerBasicIdentityForm";
import { CustomerContactInformationForm } from "./CustomerContactInformationForm";

import {
  CustomerBusinessContextCard,
  CustomerDuplicateIntelligenceCard,
  CustomerCorrectiveActionsCard,
  CustomerCrossStepSummary,
} from "./CustomerFormBottomCards";

import { CustomerOnboardingRightRail } from "./CustomerOnboardingRightRail";
import { CustomerStickyBottomBar } from "./CustomerStickyBottomBar";
import { CustomerFormPreviewModal } from "./CustomerFormPreviewModal";
import { CustomerContextStrip } from "../CustomerContextStrip";

import {
  CU04_WORKFLOW_STEPS,
  INITIAL_FORM_DATA,
} from "@/constants/customerWorkflow";

import { customerApi } from "@/lib/api/customers";
import { ApiError } from "@/lib/api/client";

import type {
  CustomerBasicIdentityFormState,
  CustomerContactInformationFormState,
  CustomerFormFullData,
  CustomerFormMode,
} from "@/types/customer-form";

interface CustomerFormDashboardProps {
  mode: CustomerFormMode;
  customerId?: string;
}

export function CustomerFormDashboard({
  mode,
  customerId,
}: CustomerFormDashboardProps) {
  const router = useRouter();

  const [data, setData] =
    useState<CustomerFormFullData | null>(
      null,
    );

  const [
    currentStepNumber,
    setCurrentStepNumber,
  ] = useState(2);

  const [isLoading, setIsLoading] =
    useState(true);

  /*
   * CU04 writes are not connected yet.
   * This will become a writable state when
   * POST/PATCH integration is added.
   */
  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    isRefreshing,
    setIsRefreshing,
  ] = useState(false);

  const [
    toastMessage,
    setToastMessage,
  ] = useState<string | null>(
    null,
  );

  const [
    isPreviewOpen,
    setIsPreviewOpen,
  ] = useState(false);

  const [
    validationErrors,
    setValidationErrors,
  ] = useState<
    Record<string, string>
  >({});

  const [isDirty, setIsDirty] =
    useState(false);

  const showToast = (
    message: string,
  ) => {
    setToastMessage(message);

    window.setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  /*
   * Load create/edit form state.
   *
   * Edit mode only maps fields that are
   * currently authoritative from CU03.
   */
  useEffect(() => {
    let active = true;

    const loadFormData =
      async () => {
        setIsLoading(true);

        try {
          if (
            mode === "edit" &&
            customerId
          ) {
            const detail =
              await customerApi.getCustomerDetail(
                customerId,
              );

            if (!active) {
              return;
            }

            const profile =
              detail.profile;

            const nameParts =
              profile.name
                .trim()
                .split(/\s+/)
                .filter(Boolean);

            const firstName =
              nameParts[0] ?? "";

            const lastName =
              nameParts
                .slice(1)
                .join(" ");

            setData({
              mode: "edit",

              customerId:
                profile.id,

              draftId: null,
              version: profile.updatedAt,
              createdBy: null,
              lastAutosave: null,

              /*
               * Step 2
               *
               * Only fields backed by an
               * authoritative source are
               * populated.
               */
              basicIdentity: {
                title: "",
                firstName,
                middleName: "",
                lastName,
                displayName:
                  profile.name ?? "",

                dob:
                  profile.dob ?? "",

                gender:
                  profile.gender ?? "",

                preferredLanguage:
                  profile.preferredLanguage ??
                  "",

                nationality: "",
                occupation: "",
                customerNotes: "",
              },

              /*
               * Step 3
               *
               * These values come directly
               * from the authoritative User
               * customer account record.
               */
              contactInformation: {
                email:
                  profile.email ?? "",

                phone:
                  profile.phone ?? "",

                companyName:
                  profile.companyName ??
                  "",

                country:
                  profile.country ?? "",
              },

              workflowSteps:
                CU04_WORKFLOW_STEPS,

              completenessMetrics: {
                overallCompleteness:
                  null,

                requiredCompleted:
                  null,

                totalRequired:
                  null,

                optionalCompleted:
                  null,

                totalOptional:
                  null,

                openValidationIssues:
                  null,

                blockingIssues:
                  null,

                warnings:
                  null,

                duplicateCandidates:
                  null,

                autosaveStatus:
                  null,

                currentStepLabel:
                  "Basic Identity",

                approvalRequired:
                  null,
              },

              businessContext:
                null,

              duplicateIntelligence:
                null,

              correctiveActions:
                [],

              onboardingHealth:
                null,
            });

            return;
          }

          /*
           * Create mode uses only blank,
           * non-fabricated initial values.
           */
          setData({
            ...INITIAL_FORM_DATA,
            mode: "create",
          });
        } catch (error) {
          console.error(error);

          if (active) {
            showToast(
              "Failed to load customer profile details from server.",
            );
          }
        } finally {
          if (active) {
            setIsLoading(false);
          }
        }
      };

    void loadFormData();

    return () => {
      active = false;
    };
  }, [
    mode,
    customerId,
  ]);

  /*
   * Step 2:
   * Basic Identity
   */
  const handleFieldChange = (
    field:
      keyof CustomerBasicIdentityFormState,
    value: string,
  ) => {
    if (!data) {
      return;
    }

    setIsDirty(true);

    setData({
      ...data,

      basicIdentity: {
        ...data.basicIdentity,
        [field]: value,
      },
    });

    if (
      validationErrors[field]
    ) {
      const nextErrors = {
        ...validationErrors,
      };

      delete nextErrors[field];

      setValidationErrors(
        nextErrors,
      );
    }
  };

  /*
   * Step 3:
   * Contact Information
   */
  const handleContactFieldChange = (
    field:
      keyof CustomerContactInformationFormState,
    value: string,
  ) => {
    if (!data) {
      return;
    }

    setIsDirty(true);

    setData({
      ...data,

      contactInformation: {
        ...data.contactInformation,
        [field]: value,
      },
    });

    if (
      validationErrors[field]
    ) {
      const nextErrors = {
        ...validationErrors,
      };

      delete nextErrors[field];

      setValidationErrors(
        nextErrors,
      );
    }
  };

  /*
   * Validate only the currently supported
   * authoritative CU04 fields.
   */
  const handleValidate = () => {
    if (!data) {
      return;
    }

    const errors:
      Record<string, string> =
        {};

    const identity =
      data.basicIdentity;

    const contact =
      data.contactInformation;

    if (
      !identity.displayName.trim()
    ) {
      errors.displayName =
        "Display Name is required";
    }

    if (
      !contact.email.trim()
    ) {
      errors.email =
        "Email Address is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        contact.email.trim(),
      )
    ) {
      errors.email =
        "Enter a valid email address";
    }

    setValidationErrors(
      errors,
    );

    if (
      Object.keys(errors)
        .length > 0
    ) {
      showToast(
        "Validation failed. Please resolve the highlighted required fields.",
      );

      /*
       * If contact validation fails,
       * move the operator to Step 3.
       */
      if (
        errors.email
      ) {
        setCurrentStepNumber(3);
      }

      return false;
    }

    showToast(
      "Available customer fields are valid.",
    );

    return true;
  };

  /*
   * Write operations remain disabled until
   * CU04 POST/PATCH backend integration.
   * 
   */
  const buildWritePayload = () => {
    if (!data) {
      return null;
    }

    return {
      name: mode === "create" ?
        data.basicIdentity
          .displayName
          .trim() : undefined,

      email: mode === "create" ?
        data.contactInformation
          .email
          .trim()
          .toLowerCase() : undefined,

      phone: mode === "create" ?
        data.contactInformation
          .phone
          .trim() || null : undefined,

      companyName:
        data.contactInformation
          .companyName
          .trim() || null,

      country:
        data.contactInformation
          .country
          .trim() || null,

      expectedUpdatedAt:
        mode === "edit"
          ? data.version
          : undefined,
    };
  };

  const handleSaveDraft =
    async () => {
      showToast(
        "Draft persistence is not available yet. Use Save & Continue to persist supported customer master fields.",
      );
  };

  const handleSaveAndContinue =
    async () => {
      if (
        !data ||
        isSaving
      ) {
        return;
      }

      const valid =
        handleValidate();

      if (!valid) {
        return;
      }

      const payload =
        buildWritePayload();

      if (!payload) {
        return;
      }

      setIsSaving(true);

      try {
        if (
          mode === "edit" &&
          customerId
        ) {
          const result =
            await customerApi
              .updateCustomer(
                customerId,
                payload,
              );

          setIsDirty(false);

          showToast(
            result.message ||
              "Customer updated successfully.",
          );

          router.push(
            `/admin/customers/${result.customer.id}`,
          );

          return;
        }

        const result =
          await customerApi
            .createCustomer(
              payload,
            );

        setIsDirty(false);

        showToast(
          result.message ||
            "Customer created successfully.",
        );

        router.push(
          `/admin/customers/${result.customer.id}`,
        );
      } catch (error) {
        console.error(error);

        if (error instanceof ApiError && (error as { status?: number }).status === 409) {
          showToast("This customer changed on the server. Review or refresh the record before saving again.");
          return;
        }

        showToast(
          mode === "edit"
            ? "Failed to update customer."
            : "Failed to create customer.",
        );
      } finally {
        setIsSaving(false);
      }
  };

  const handleSaveChanges =
    async () => {
      if (
        mode !== "edit" ||
        !customerId ||
        !data ||
        isSaving
      ) {
        return;
      }

      const valid =
        handleValidate();

      if (!valid) {
        return;
      }

      const payload =
        buildWritePayload();

      if (!payload) {
        return;
      }

      setIsSaving(true);

      try {
        const result =
          await customerApi
            .updateCustomer(
              customerId,
              payload,
            );

        setIsDirty(false);

        showToast(
          result.message ||
            "Customer updated successfully.",
        );

        router.push(
          `/admin/customers/${result.customer.id}`,
        );
      } catch (error) {
        console.error(error);

        if (error instanceof ApiError && (error as { status?: number }).status === 409) {
          showToast("This customer changed on the server. Review or refresh the record before saving again.");
          return;
        }

        showToast(
          "Failed to update customer.",
        );
      } finally {
        setIsSaving(false);
      }
  };

  const handleCancel = () => {
    if (isDirty) {
      const shouldExit =
        window.confirm(
          "You have unsaved changes. Are you sure you want to exit?",
        );

      if (!shouldExit) {
        return;
      }
    }

    navigateBack();
  };

  /*
   * Record-level navigation:
   *
   * Edit -> Customer Detail
   * Create -> Customer Directory
   */
  const navigateBack = () => {
    if (
      mode === "edit" &&
      customerId
    ) {
      router.push(
        `/admin/customers/${customerId}`,
      );

      return;
    }

    router.push(
      "/admin/customers/directory",
    );
  };

  /*
   * Refresh authoritative server-backed
   * fields in Edit mode.
   */
  const handleRefresh =
    async () => {
      setIsRefreshing(true);

      try {
        if (
          mode === "edit" &&
          customerId
        ) {
          const detail =
            await customerApi.getCustomerDetail(
              customerId,
            );

          const profile =
            detail.profile;

          const nameParts =
            profile.name
              .trim()
              .split(/\s+/)
              .filter(Boolean);

          const firstName =
            nameParts[0] ?? "";

          const lastName =
            nameParts
              .slice(1)
              .join(" ");

          setData(
            (current) => {
              if (!current) {
                return current;
              }

              return {
                ...current,

                basicIdentity: {
                  ...current.basicIdentity,

                  firstName,

                  lastName,

                  displayName:
                    profile.name ?? "",

                  dob:
                    profile.dob ?? "",

                  gender:
                    profile.gender ?? "",

                  preferredLanguage:
                    profile.preferredLanguage ??
                    "",
                },

                contactInformation: {
                  ...current.contactInformation,

                  email:
                    profile.email ?? "",

                  phone:
                    profile.phone ?? "",

                  companyName:
                    profile.companyName ??
                    "",

                  country:
                    profile.country ?? "",
                },

                version: profile.updatedAt,
              };
            },
          );

          setValidationErrors({});

          setIsDirty(false);

          showToast(
            "Customer profile refreshed.",
          );

          return;
        }

        showToast(
          "No saved customer record is available to refresh.",
        );
      } catch (error) {
        console.error(error);

        showToast(
          "Failed to refresh customer profile.",
        );
      } finally {
        setIsRefreshing(false);
      }
    };

  if (
    isLoading ||
    !data
  ) {
    return (
      <div className="p-6 space-y-4 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3" />

        <div className="h-10 bg-slate-200 rounded w-full" />

        <div className="h-16 bg-slate-200 rounded w-full" />

        <div className="h-40 bg-slate-200 rounded w-full" />
      </div>
    );
  }

  const currentStep =
    data.workflowSteps.find(
      (step) =>
        step.stepNumber ===
        currentStepNumber,
    ) ??
    data.workflowSteps[1];

  return (
    <div className="space-y-3.5 p-3.5 sm:p-5 max-w-[1920px] mx-auto min-w-0 pb-20">
      {toastMessage && (
        <div className="fixed bottom-16 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />

          <span>
            {toastMessage}
          </span>
        </div>
      )}

      <CustomerFormHeader
        mode={mode}

        customerId={
          customerId
        }

        onCancel={
          handleCancel
        }

        onPreview={() =>
          setIsPreviewOpen(
            true,
          )
        }

        onValidate={
          handleValidate
        }

        onSaveDraft={
          handleSaveDraft
        }

        onSaveAndContinue={
          handleSaveAndContinue
        }

        isSaving={
          isSaving
        }
      />

      <CustomerContextStrip
        onRefresh={
          handleRefresh
        }

        isRefreshing={
          isRefreshing
        }
      />

      <CustomerFormStepper
        steps={
          data.workflowSteps
        }

        currentStepNumber={
          currentStepNumber
        }

        onSelectStep={
          setCurrentStepNumber
        }
      />

      <CustomerFormTopKpis
        metrics={
          data.completenessMetrics
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        <div className="xl:col-span-3 space-y-4 min-w-0">
          {/*
           * Step 2:
           * Basic Identity
           */}
          {currentStepNumber ===
          2 ? (
            <CustomerBasicIdentityForm
              mode={mode}
              formState={
                data.basicIdentity
              }

              onChange={
                handleFieldChange
              }

              errors={
                validationErrors
              }
            />
          ) : currentStepNumber ===
            3 ? (
            /*
             * Step 3:
             * Contact Information
             */
            <CustomerContactInformationForm
              mode={mode}
              formState={
                data.contactInformation
              }

              onChange={
                handleContactFieldChange
              }

              errors={
                validationErrors
              }
            />
          ) : (
            /*
             * Remaining CU04 workflow
             * sections stay unavailable
             * until their authoritative
             * sources are integrated.
             */
            <div className="bg-white border border-line rounded-lg p-6 text-center space-y-2">
              <span className="px-2.5 py-1 rounded bg-rose-50 text-[#671021] font-mono font-bold text-xs">
                Step{" "}
                {
                  currentStepNumber
                }{" "}
                / 13 —{" "}
                {
                  currentStep.label
                }
              </span>

              <h3 className="text-base font-bold text-ink">
                {
                  currentStep.label
                }{" "}
                Workflow Section
              </h3>

              <p className="text-xs text-slate-500 max-w-md mx-auto">
                This workflow
                section is not
                connected to an
                authoritative
                source yet.
              </p>

              <p className="text-[10.5px] text-slate-400 max-w-md mx-auto">
                Basic Identity
                and Contact
                Information are
                currently the
                supported customer
                master sections.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <CustomerBusinessContextCard
              data={
                data
              }

              showToast={
                showToast
              }
            />

            <CustomerDuplicateIntelligenceCard
              data={
                data
              }

              showToast={
                showToast
              }
            />

            <CustomerCorrectiveActionsCard
              data={
                data
              }

              showToast={
                showToast
              }
            />
          </div>

          <CustomerCrossStepSummary
            data={
              data
            }
          />
        </div>

        <div className="xl:col-span-1 min-w-0">
          <CustomerOnboardingRightRail
            data={
              data
            }

            showToast={
              showToast
            }

            onSaveDraft={
              handleSaveDraft
            }

            onValidate={
              handleValidate
            }

            onPreview={() =>
              setIsPreviewOpen(
                true,
              )
            }

            onSaveAndContinue={
              handleSaveAndContinue
            }

            isSaving={
              isSaving
            }
          />
        </div>
      </div>

      <CustomerStickyBottomBar
        currentStepNumber={
          currentStepNumber
        }

        totalSteps={
          13
        }

        stepLabel={
          currentStep.label
        }

        autosaveText={
          data
            .completenessMetrics
            .autosaveStatus ??
          "Unavailable"
        }

        onCancel={
          handleCancel
        }

        onBack={() =>
          setCurrentStepNumber(
            (previous) =>
              Math.max(
                1,
                previous - 1,
              ),
          )
        }

        onSaveDraft={
          handleSaveDraft
        }

        onSaveAndContinue={
          handleSaveAndContinue
        }

        onValidate={
          handleValidate
        }

        onPreview={() =>
          setIsPreviewOpen(
            true,
          )
        }

        onSaveChanges={
          handleSaveChanges
        }

        isSaving={
          isSaving
        }
      />

      <CustomerFormPreviewModal
        isOpen={
          isPreviewOpen
        }

        onClose={() =>
          setIsPreviewOpen(
            false,
          )
        }

        data={
          data
        }
      />
    </div>
  );
}
