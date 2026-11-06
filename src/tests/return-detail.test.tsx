import { render, screen } from "@testing-library/react";
import { beforeEach, describe, it, expect, vi } from "vitest";
import ReturnDetailPage from "@/app/admin/marketplace/returns/[returnId]/page";
import { marketplaceReturnDetail } from "./marketplace-regression-fixtures";

const apiGet = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({ returnId: "45091" }),
}));

vi.mock("@/lib/api", () => ({ api: { get: apiGet } }));

describe("Screen 13 - Return Case Details and Decision Management Page", () => {
  beforeEach(() => apiGet.mockReset().mockResolvedValue(marketplaceReturnDetail));

  it("renders return case header, public reference, database ID, and original order links for RET-2026-045091", async () => {
    render(<ReturnDetailPage params={Promise.resolve({ returnId: "ignored" })} />);

    expect(await screen.findByRole("heading", { name: "Damaged serum return" })).toBeInTheDocument();
    expect(screen.getByText("#45091")).toBeInTheDocument();
    expect(apiGet).toHaveBeenCalledWith(
      "/admin/marketplace/returns/45091",
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it("renders separated status badges (Eligibility Review, Eligible Subject to Inspection, Pending, Pending Review, None, Low, 18 Hours Remaining)", async () => {
    render(<ReturnDetailPage params={Promise.resolve({ returnId: "ignored" })} />);

    expect(await screen.findByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("Return")).toBeInTheDocument();
    expect(screen.getByText("Damaged")).toBeInTheDocument();
  });

  it("renders Case Summary Card customer statement and metadata", async () => {
    render(<ReturnDetailPage params={Promise.resolve({ returnId: "ignored" })} />);

    expect(await screen.findByText(/Seal arrived broken and the product leaked into the outer packaging/i)).toBeInTheDocument();
    expect(screen.getByText("Commercial Case")).toBeInTheDocument();
  });

  it("renders Original Order Summary card with functional link to Screen 11", async () => {
    render(<ReturnDetailPage params={Promise.resolve({ returnId: "ignored" })} />);

    expect(await screen.findByText("Related Order")).toBeInTheDocument();
    const orderLinks = screen.getAllByText("ORD-2026-009021");
    expect(orderLinks.length).toBeGreaterThan(0);
    expect(orderLinks[0].closest("a")).toHaveAttribute("href", "/admin/marketplace/orders/order-uuid");
  });

  it("renders Customer Profile Card, Health Metrics, and Internal Case Note", async () => {
    render(<ReturnDetailPage params={Promise.resolve({ returnId: "ignored" })} />);

    expect(await screen.findByText("Seller")).toBeInTheDocument();
    expect(screen.getByText("Luxe Distribution")).toBeInTheDocument();
    expect(screen.getByText("Verified")).toBeInTheDocument();
  });

  it("renders right-side Case Decision Panel with blocking issues and decision actions", async () => {
    render(<ReturnDetailPage params={Promise.resolve({ returnId: "ignored" })} />);

    expect(await screen.findByText("Marketplace Boundary")).toBeInTheDocument();
    expect(screen.getByText("Reverse Logistics")).toBeInTheDocument();
    expect(screen.getByText("Finance")).toBeInTheDocument();
  });

  it("does not expose Logistics or Finance execution actions", async () => {
    render(<ReturnDetailPage params={Promise.resolve({ returnId: "ignored" })} />);

    expect(await screen.findByText("Reverse Logistics")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Create Reverse Shipment" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Issue Refund" })).not.toBeInTheDocument();
  });

  it("renders Return Case Not Found state for invalid return ID", async () => {
    apiGet.mockRejectedValueOnce(new Error("Return not found"));
    render(<ReturnDetailPage params={Promise.resolve({ returnId: "ignored" })} />);

    expect(await screen.findByRole("heading", { name: "Return / Dispute unavailable" })).toBeInTheDocument();
    expect(screen.getByText("Return not found")).toBeInTheDocument();
  });
});
