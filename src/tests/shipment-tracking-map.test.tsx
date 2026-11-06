import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="map">{children}</div>,
  TileLayer: () => <div data-testid="tiles" />,
  CircleMarker: ({ children }: { children: React.ReactNode }) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Polyline: () => <div data-testid="route" />,
  useMap: () => ({ setView: vi.fn(), fitBounds: vi.fn() }),
}));

import ShipmentTrackingMap from "@/features/admin/logistics/components/ShipmentTrackingMap";

describe("ShipmentTrackingMap", () => {
  it("renders origin, chronological event, latest, destination and route geometry", () => {
    render(<ShipmentTrackingMap carrier="Hill Country Express" trackingNumber="TRK-DEMO-002" tracking={{ is_live: false, origin: { label: "Dubai Hub", latitude: 25.2532, longitude: 55.3657 }, planned_transit_points: [{ id: 8, sequence: 1, label: "Colombo Air Cargo", latitude: 6.9271, longitude: 79.8612 }], destination: { id: 2, status: "delivered", label: "Kandy", latitude: 7.2771, longitude: 80.6385, occurred_at: "2026-09-14T13:10:00Z" }, latest_location: { id: 2, status: "delivered", label: "Kandy", latitude: 7.2771, longitude: 80.6385, occurred_at: "2026-09-14T13:10:00Z" }, events: [{ id: 1, status: "out_for_delivery", label: "Kandy", latitude: 7.2836, longitude: 80.6413, occurred_at: "2026-09-14T08:30:00Z" }, { id: 2, status: "delivered", label: "Kandy", latitude: 7.2771, longitude: 80.6385, occurred_at: "2026-09-14T13:10:00Z" }], estimated_arrival: "2026-09-14T06:00:00Z", estimated_delivery: "2026-09-14T13:00:00Z" }} />);
    expect(screen.getByTestId("map")).toBeInTheDocument();
    expect(screen.getByTestId("route")).toBeInTheDocument();
    expect(screen.getAllByTestId("marker")).toHaveLength(5);
    expect(screen.getByText("Planned Transit 1")).toBeInTheDocument();
    expect(screen.getByText(/Planned country arrival/i)).toBeInTheDocument();
    expect(screen.getAllByText("Latest Tracking Location").length).toBeGreaterThan(0);
    expect(screen.queryByText(/live gps/i)).not.toBeInTheDocument();
  });

  it("shows an honest empty state and filters invalid coordinates", () => {
    render(<ShipmentTrackingMap carrier={null} trackingNumber={null} tracking={{ is_live: false, origin: { label: "Invalid", latitude: 95, longitude: 20 }, destination: null, latest_location: null, events: [] }} />);
    expect(screen.getByText(/tracking location is not available/i)).toBeInTheDocument();
    expect(screen.queryByTestId("map")).not.toBeInTheDocument();
  });
});
