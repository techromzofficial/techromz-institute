import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CatalogueLayout from "@/app/admin/catalogue/layout";

describe("Catalogue workspace shell", () => {
  it("provides a neutral canvas without duplicating application navigation", () => {
    render(<CatalogueLayout><div>Live screen body</div></CatalogueLayout>);
    expect(screen.getByTestId("catalogue-workspace")).toBeInTheDocument();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    expect(screen.queryByText("Catalogue Control Centre")).not.toBeInTheDocument();
    expect(screen.getByText("Live screen body")).toBeInTheDocument();
  });
});
