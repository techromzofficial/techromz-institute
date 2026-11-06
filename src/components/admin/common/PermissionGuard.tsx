"use client";

import { cloneElement, isValidElement } from "react";
import { useAdminContext } from "@/contexts/AdminContext";

type Props = {
  permission: string;
  children: React.ReactNode;
  mode?: "hide" | "disable";
  fallback?: React.ReactNode;
};

export function PermissionGuard({ permission, children, mode = "hide", fallback = null }: Props) {
  const { hasPermission } = useAdminContext();
  if (hasPermission(permission)) return <>{children}</>;
  if (mode === "disable" && isValidElement(children)) {
    return cloneElement(children as React.ReactElement<any>, { disabled: true, "aria-disabled": true });
  }
  return <>{fallback}</>;
}
