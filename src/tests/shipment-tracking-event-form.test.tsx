import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ addShipmentTrackingEvent: vi.fn() }));
vi.mock("@/lib/api/logistics", () => ({ logisticsApi: api }));
import ShipmentTrackingEventForm from "@/features/admin/logistics/components/ShipmentTrackingEventForm";

describe("ShipmentTrackingEventForm", () => {
  beforeEach(() => { api.addShipmentTrackingEvent.mockReset(); api.addShipmentTrackingEvent.mockResolvedValue({ event: { id: 1 } }); });

  it("persists an authoritative coordinate event and refetches the shipment", async () => {
    const updated = vi.fn();
    render(<ShipmentTrackingEventForm shipmentId="SHP-1" permitted onUpdated={updated}/>);
    fireEvent.click(screen.getByRole("button", { name: "Add Tracking Event" }));
    fireEvent.change(screen.getByLabelText("Event Type"), { target: { value: "arrived_destination_country" } });
    fireEvent.change(screen.getByLabelText("Location / Facility"), { target: { value: "Colombo Air Cargo" } });
    fireEvent.change(screen.getByLabelText("Country Code"), { target: { value: "lk" } });
    fireEvent.change(screen.getByLabelText("Latitude"), { target: { value: "6.9271" } });
    fireEvent.change(screen.getByLabelText("Longitude"), { target: { value: "79.8612" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Tracking Event" }));
    await waitFor(() => expect(api.addShipmentTrackingEvent).toHaveBeenCalledWith("SHP-1", expect.objectContaining({ event_type: "arrived_destination_country", location: "Colombo Air Cargo", country_code: "LK", latitude: 6.9271, longitude: 79.8612 })));
    expect(updated).toHaveBeenCalled();
  });

  it("rejects invalid coordinates before calling the API", () => {
    render(<ShipmentTrackingEventForm shipmentId="SHP-1" permitted onUpdated={vi.fn()}/>);
    fireEvent.click(screen.getByRole("button", { name: "Add Tracking Event" }));
    fireEvent.change(screen.getByLabelText("Location / Facility"), { target: { value: "Unknown scan" } });
    fireEvent.change(screen.getByLabelText("Latitude"), { target: { value: "91" } });
    fireEvent.change(screen.getByLabelText("Longitude"), { target: { value: "80" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Tracking Event" }));
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(api.addShipmentTrackingEvent).not.toHaveBeenCalled();
  });
});
