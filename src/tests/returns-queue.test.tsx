import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, it, expect, vi } from "vitest";
import ReturnsQueuePage from "@/app/admin/marketplace/returns/page";
import { marketplaceReturns } from "./marketplace-regression-fixtures";

const apiGet = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/api", () => ({
  api: { get: apiGet },
  withQuery: (path: string) => path,
}));

describe("Screen 12 - Returns, Refunds & Disputes Queue Page", () => {
  beforeEach(() => apiGet.mockReset().mockResolvedValue(marketplaceReturns));

  it("renders the page header without unavailable case creation or export actions", async () => {
    render(<ReturnsQueuePage />);

    await waitFor(
      () => {
        expect(screen.getByRole("heading", { name: "Returns & Disputes" })).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(screen.getByRole("button", { name: "Refresh" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Create Case" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Export" })).not.toBeInTheDocument();
  });

  it("renders 14 summary metric cards including dark-red monthly refund value card", async () => {
    render(<ReturnsQueuePage />);

    await waitFor(
      () => {
        expect(screen.getByText("Total Cases")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(screen.getByText("Open Cases")).toBeInTheDocument();
    expect(screen.getByText("Returns")).toBeInTheDocument();
    expect(screen.getByText("Disputes")).toBeInTheDocument();
    expect(screen.getByText("Resolved")).toBeInTheDocument();
  });

  it("renders return cases table rows matching reference image", async () => {
    render(<ReturnsQueuePage />);

    await waitFor(
      () => {
        expect(screen.getByText("Damaged serum return")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(screen.getByText("ORD-2026-009021")).toBeInTheDocument();
    expect(screen.getByText("Luxe Distribution")).toBeInTheDocument();
  });

  it("renders Open Case action buttons navigating to Screen 13", async () => {
    render(<ReturnsQueuePage />);

    await waitFor(
      () => {
        expect(screen.getByText("Damaged serum return")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(screen.getByText("Case #45091")).toBeInTheDocument();
  });

  it("renders Order Reference link connecting to Screen 11", async () => {
    render(<ReturnsQueuePage />);

    await waitFor(
      () => {
        const orderLink = screen.getByText("ORD-2026-009021");
        expect(orderLink).toHaveAttribute("href", "/admin/marketplace/orders/21");
      },
      { timeout: 3000 }
    );
  });

  it("renders right sidebar panels (Operations Health, Priority Alerts, Refund Performance, Quick Queue, Liability Summary)", async () => {
    render(<ReturnsQueuePage />);

    await waitFor(
      () => {
        expect(screen.getByText("Reverse Logistics")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(screen.getByText("Refund & Settlement")).toBeInTheDocument();
    expect(screen.getByText(/remain owned by the Logistics domain/i)).toBeInTheDocument();
  });
});
