import { authorizations } from "@/mocks/admin/fixtures";
import { getAuthorizationDetailMock } from "@/mocks/admin/authorizationDetail.mock";
import { useAdminMocks } from "./adminDataSource";
import type { BrandAuthorizationDetail } from "@/types/authorizationDetail";

export async function getBrandAuthorizationDetail(
  authorizationId: string,
): Promise<BrandAuthorizationDetail | undefined> {
  if (!useAdminMocks) {
    throw new Error("Live brand authorization detail service is not configured");
  }

  const record = authorizations.find((authorization) => authorization.id === authorizationId);
  return record ? getAuthorizationDetailMock(record) : undefined;
}

