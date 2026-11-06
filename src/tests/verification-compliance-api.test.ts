import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

vi.mock("@/lib/api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },

  withQuery: (path: string) =>
    path,
}));

import { api } from "@/lib/api";
import { verificationComplianceApi } from "@/lib/api/verificationCompliance";

describe(
  "verification compliance authoritative API",
  () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it(
      "loads the normalized profile",
      async () => {
        vi.mocked(api.get)
          .mockResolvedValue({
            data: {
              status: "passed",
              is_eligible: true,
              requirements: [],
            },
          });

        await expect(
          verificationComplianceApi.getComplianceProfile(
            7,
          ),
        ).resolves.toMatchObject({
          status: "passed",
          is_eligible: true,
        });

        expect(
          api.get,
        ).toHaveBeenCalledWith(
          "/admin/verification-compliance/cases/7/profile",
        );
      },
    );

    it(
      "sends a versioned pass command",
      async () => {
        vi.mocked(api.post)
          .mockResolvedValue({
            data: {
              status: "passed",
            },
          });

        await verificationComplianceApi.decideCase(
          7,
          "pass",
          {
            expected_version: 3,
          },
        );

        expect(
          api.post,
        ).toHaveBeenCalledWith(
          "/admin/verification-compliance/cases/7/pass",
          {
            expected_version: 3,
          },
        );
      },
    );

    it(
      "sends reason for adverse commands",
      async () => {
        vi.mocked(api.post)
          .mockResolvedValue({});

        await verificationComplianceApi.decideCase(
          7,
          "fail",
          {
            expected_version: 3,
            reason:
              "revoked licence",
          },
        );

        expect(
          api.post,
        ).toHaveBeenCalledWith(
          "/admin/verification-compliance/cases/7/fail",
          {
            expected_version: 3,
            reason:
              "revoked licence",
          },
        );
      },
    );

    it(
      "links evidence with optimistic concurrency",
      async () => {
        vi.mocked(api.post)
          .mockResolvedValue({});

        await verificationComplianceApi.linkEvidence(
          7,
          {
            expected_version: 4,
            compliance_rule_id: 2,
            upload_id: 18,
            evidence_type:
              "license",
          },
        );

        expect(
          api.post,
        ).toHaveBeenCalledWith(
          "/admin/verification-compliance/cases/7/evidence",
          {
            expected_version: 4,
            compliance_rule_id: 2,
            upload_id: 18,
            evidence_type:
              "license",
          },
        );
      },
    );

    it(
      "uses governed versioned evidence review commands",
      async () => {
        vi.mocked(api.post)
          .mockResolvedValue({});

        await verificationComplianceApi.reviewEvidence(
          7,
          12,
          "revoke",
          {
            expected_version: 5,
            reason:
              "issuer revoked",
          },
        );

        expect(
          api.post,
        ).toHaveBeenCalledWith(
          "/admin/verification-compliance/cases/7/evidence/12/revoke",
          {
            expected_version: 5,
            reason:
              "issuer revoked",
          },
        );
      },
    );

    it(
      "builds only the authorized backend evidence download URL",
      () => {
        expect(
          verificationComplianceApi.evidenceDownloadUrl(
            7,
            12,
          ),
        ).toBe(
          "/api/admin/verification-compliance/cases/7/evidence/12/download",
        );
      },
    );

    it(
      "submits scoped expiring waivers with optimistic concurrency",
      async () => {
        vi.mocked(api.post)
          .mockResolvedValue({});

        const payload = {
          expected_version: 6,
          compliance_rule_id: 1,
          scope: "case",
          reason:
            "regulator extension",
          effective_from:
            "2026-08-28",
          expires_at:
            "2026-09-28",
        };

        await verificationComplianceApi.approveWaiver(
          7,
          payload,
        );

        expect(
          api.post,
        ).toHaveBeenCalledWith(
          "/admin/verification-compliance/cases/7/waivers",
          payload,
        );
      },
    );
  },
);