import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ShipmentDecisionPanel } from "@/components/admin/logistics/ShipmentDecisionPanel";

const { cancelShipment } = vi.hoisted(() => ({ cancelShipment: vi.fn() }));

vi.mock("@/lib/api/logistics", () => ({
  logisticsApi: { cancelShipment },
}));

const capabilities = {
  canConfirmPickup: true,
  canChangeCarrier: true,
  canMarkException: true,
  canCancel: true,
};

describe("ShipmentDecisionPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  it("keeps actions without authoritative endpoints disabled", () => {
    render(<ShipmentDecisionPanel shipmentId="shipment-1" capabilities={capabilities} onSuccess={vi.fn()} onError={vi.fn()} />);

    expect(screen.getByRole("button", { name: /confirm pickup/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /change carrier/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /mark exception/i })).toBeDisabled();
  });

  it("cancels through the authoritative shipment API", async () => {
    const onSuccess = vi.fn();
    cancelShipment.mockResolvedValue({ shipment: { id: 1 } });
    render(<ShipmentDecisionPanel shipmentId="shipment-1" capabilities={capabilities} onSuccess={onSuccess} onError={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /cancel shipment/i }));

    await waitFor(() => expect(cancelShipment).toHaveBeenCalledWith("shipment-1"));
    expect(onSuccess).toHaveBeenCalledWith("Shipment cancellation persisted.");
  });
});
