import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Page from "@/app/admin/logistics/locations/page";

const api = vi.hoisted(() => ({
  getLocations: vi.fn(),
  createWarehouse: vi.fn(),
  updateWarehouse: vi.fn(),
  setWarehouseStatus: vi.fn(),
  archiveWarehouse: vi.fn(),
  createWarehouseLocation: vi.fn(),
  updateWarehouseLocation: vi.fn(),
  setWarehouseLocationStatus: vi.fn(),
  archiveWarehouseLocation: vi.fn(),
}));

vi.mock("@/lib/api/logistics", () => ({ logisticsApi: api }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

type Location = { id: number; uuid: string; code: string; name: string | null; status: string };
const location: Location = { id: 9, uuid: "loc-9", code: "PACK-A", name: "Packing Area", status: "active" };
const warehouse = {
  id: 4,
  uuid: "wh-4",
  code: "WH-OPS",
  name: "Operations Warehouse",
  status: "active",
  address_line_1: "10 Main Street",
  address_line_2: null,
  city: "Colombo",
  region: null,
  postal_code: null,
  country_code: "LK",
  contact_name: "Warehouse Lead",
  contact_phone: "+94110000000",
  contact_email: null,
  timezone: "Asia/Colombo",
  opens_at: "08:00:00",
  closes_at: "18:00:00",
  dispatch_cutoff_at: "16:00:00",
  capabilities: ["storage"],
  archived_at: null,
  supplier: null,
  locations: [location],
};
const response = () => ({
  data: [warehouse],
  summary: { warehouses: 1, active: 1, locations: 1 },
  filters: { statuses: ["active"] },
  capabilities: {
    read: true,
    manage: true,
    create_warehouse: true,
    update_warehouse: true,
    delete_warehouse: false,
    archive_warehouse: true,
    create_location: true,
    update_location: true,
    delete_location: false,
  },
});

describe("Locations and warehouses CRUD", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getLocations.mockResolvedValue(response());
    api.createWarehouse.mockResolvedValue({ warehouse });
    api.createWarehouseLocation.mockResolvedValue({ location });
    api.archiveWarehouse.mockResolvedValue({ warehouse: { ...warehouse, status: "archived" } });
    api.archiveWarehouseLocation.mockResolvedValue({ location: { ...location, status: "archived" } });
  });

  it("creates a warehouse through the API and refetches the directory", async () => {
    render(<Page />);
    await screen.findByText("Operations Warehouse");
    fireEvent.click(screen.getByRole("button", { name: "Add location & warehouse" }));
    fireEvent.change(screen.getByLabelText("Warehouse code"), { target: { value: "WH-NEW" } });
    fireEvent.change(screen.getByLabelText("Warehouse name"), { target: { value: "New Warehouse" } });
    fireEvent.change(screen.getByLabelText("Address line 1"), { target: { value: "20 Main Street" } });
    fireEvent.change(screen.getByLabelText("City"), { target: { value: "Colombo" } });
    fireEvent.change(screen.getByLabelText("Contact name"), { target: { value: "Lead" } });
    fireEvent.change(screen.getByLabelText("Contact phone"), { target: { value: "+94110000001" } });
    fireEvent.click(screen.getByRole("button", { name: "Save & add location" }));
    await waitFor(() => expect(api.createWarehouse).toHaveBeenCalledWith(expect.objectContaining({ code: "WH-NEW", name: "New Warehouse" })));
    expect(await screen.findByRole("dialog", { name: "Add Location" })).toBeInTheDocument();
    await waitFor(() => expect(api.getLocations.mock.calls.length).toBeGreaterThan(1));
  });

  it("creates a location under a loaded tenant warehouse", async () => {
    render(<Page />);
    await screen.findByText("Operations Warehouse");
    fireEvent.click(screen.getByRole("button", { name: "Add Location" }));
    fireEvent.change(screen.getByLabelText("Location code"), { target: { value: "BIN-B" } });
    fireEvent.change(screen.getByLabelText("Location name"), { target: { value: "Bin B" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Location" }));
    await waitFor(() => expect(api.createWarehouseLocation).toHaveBeenCalledWith(4, { code: "BIN-B", name: "Bin B", status: "active" }));
    await waitFor(() => expect(api.getLocations.mock.calls.length).toBeGreaterThan(1));
  });

  it("archives a warehouse through the API after collecting a reason", async () => {
    vi.spyOn(window, "prompt").mockReturnValue("Lease ended");
    render(<Page />);
    await screen.findByText("Operations Warehouse");
    fireEvent.click(screen.getAllByRole("button", { name: "Archive" })[0]);
    await waitFor(() => expect(api.archiveWarehouse).toHaveBeenCalledWith(4, "Lease ended"));
    vi.restoreAllMocks();
  });

  it("shows the combined action disabled when manage permission is unavailable", async () => {
    api.getLocations.mockResolvedValue({ ...response(), capabilities: { ...response().capabilities, manage: false } });
    render(<Page />);
    const button = await screen.findByRole("button", { name: "Add location & warehouse" });
    expect(button).toBeDisabled();
    expect(screen.getByText("Logistics manage permission is required to add or edit facilities.")).toBeInTheDocument();
  });
});
