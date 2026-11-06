import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProductVariantsManager } from "@/features/admin/catalogue/components/ProductVariantsManager";

const mocks = vi.hoisted(() => ({
  permissions: ["products.view", "products.manage"],
  list: vi.fn(),
  attributes: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  setStatus: vi.fn(),
}));

vi.mock("@/contexts/AdminContext", () => ({
  useAdminContext: () => ({
    hasPermission: (permission: string) => mocks.permissions.includes(permission),
  }),
}));

vi.mock("@/features/admin/catalogue/api/variantApi", () => ({
  variantApi: mocks,
}));

const product = {
  id: "7",
  name: "Serum",
  approvalStatus: "pending",
  updatedAt: "2026-08-14T10:00:00.000Z",
};

const variant = {
  id: "11",
  sku: "SERUM-01",
  slug: "serum-01",
  name: "Original",
  variantName: null,
  description: null,
  status: "active",
  isActive: true,
  barcode: null,
  updatedAt: product.updatedAt,
  attributeValues: [],
  product,
};

const attributes = [
  {
    id: "1",
    name: "Label",
    slug: "label",
    dataType: "text",
    group: null,
    isRequired: false,
  },
  {
    id: "2",
    name: "Amount",
    slug: "amount",
    dataType: "number",
    group: null,
    isRequired: false,
  },
  {
    id: "3",
    name: "Enabled",
    slug: "enabled",
    dataType: "boolean",
    group: null,
    isRequired: false,
  },
  {
    id: "4",
    name: "Release date",
    slug: "release-date",
    dataType: "date",
    group: null,
    isRequired: false,
  },
  {
    id: "5",
    name: "Metadata",
    slug: "metadata",
    dataType: "json",
    group: null,
    isRequired: false,
  },
];

describe("CAT-09 Product Variant manager", () => {
  beforeEach(() => {
    mocks.permissions = ["products.view", "products.manage"];

    mocks.list.mockReset().mockResolvedValue([variant]);

    mocks.attributes.mockReset().mockResolvedValue(attributes);

    mocks.create.mockReset().mockResolvedValue({
      ...variant,
      id: "12",
      product: {
        ...product,
        updatedAt: "2026-08-14T10:00:01.000Z",
      },
    });

    mocks.update.mockReset().mockResolvedValue({
      ...variant,
      product: {
        ...product,
        updatedAt: "2026-08-14T10:00:01.000Z",
      },
    });

    mocks.setStatus.mockReset().mockResolvedValue({
      ...variant,
      status: "inactive",
      isActive: false,
      product: {
        ...product,
        updatedAt: "2026-08-14T10:00:01.000Z",
      },
    });
  });

  it("submits typed Attribute values and the authoritative Product version", async () => {
    const onVersion = vi.fn();

    render(
      <ProductVariantsManager
        productId="7"
        productVersion={product.updatedAt}
        onProductVersion={onVersion}
      />,
    );

    await screen.findByText("SERUM-01");

    fireEvent.click(screen.getByRole("button", { name: "Add Variant" }));

    fireEvent.change(screen.getByLabelText("Variant SKU"), {
      target: { value: "SERUM-02" },
    });

    fireEvent.change(screen.getByLabelText("Variant name"), {
      target: { value: "Typed" },
    });

    fireEvent.change(screen.getByLabelText("Label"), {
      target: { value: "zero" },
    });

    fireEvent.change(screen.getByLabelText("Amount"), {
      target: { value: "0" },
    });

    fireEvent.change(screen.getByLabelText("Enabled"), {
      target: { value: "false" },
    });

    fireEvent.change(screen.getByLabelText("Release date"), {
      target: { value: "2026-08-14" },
    });

    fireEvent.change(screen.getByLabelText("Metadata"), {
      target: { value: '{"tone":"warm"}' },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Create Variant" }),
    );

    await waitFor(() =>
      expect(mocks.create).toHaveBeenCalledWith(
        "7",
        expect.objectContaining({
          sku: "SERUM-02",
          name: "Typed",
          expectedProductUpdatedAt: product.updatedAt,
          attributeValues: [
            { attributeId: "1", value: "zero" },
            { attributeId: "2", value: 0 },
            { attributeId: "3", value: false },
            { attributeId: "4", value: "2026-08-14" },
            { attributeId: "5", value: { tone: "warm" } },
          ],
        }),
      ),
    );

    expect(onVersion).toHaveBeenCalledWith(
      "2026-08-14T10:00:01.000Z",
      "pending",
    );
  });

  it("activates or deactivates through the live status mutation with Product concurrency", async () => {
    render(
      <ProductVariantsManager
        productId="7"
        productVersion={product.updatedAt}
        onProductVersion={vi.fn()}
      />,
    );

    await screen.findByText("SERUM-01");

    fireEvent.click(
      screen.getByRole("button", { name: "Deactivate" }),
    );

    await waitFor(() =>
      expect(mocks.setStatus).toHaveBeenCalledWith(
        "7",
        "11",
        "inactive",
        product.updatedAt,
      ),
    );
  });

  it.each([
    [false, "false", false],
    [true, "true", true],
  ] as const)(
    "round-trips an existing boolean %s value",
    async (initial, selected, expected) => {
      mocks.list.mockResolvedValue([
        {
          ...variant,
          attributeValues: [
            {
              attributeId: "3",
              name: "Enabled",
              slug: "enabled",
              dataType: "boolean",
              value: initial,
            },
          ],
        },
      ]);

      render(
        <ProductVariantsManager
          productId="7"
          productVersion={product.updatedAt}
          onProductVersion={vi.fn()}
        />,
      );

      await screen.findByText("SERUM-01");

      fireEvent.click(
        screen.getByRole("button", { name: "Edit" }),
      );

      expect(screen.getByLabelText("Enabled")).toHaveValue(selected);

      fireEvent.click(
        screen.getByRole("button", { name: "Save Changes" }),
      );

      await waitFor(() =>
        expect(mocks.update).toHaveBeenCalledWith(
          "7",
          "11",
          expect.objectContaining({
            attributeValues: [
              {
                attributeId: "3",
                value: expected,
              },
            ],
          }),
        ),
      );
    },
  );

  it("omits an existing boolean Attribute when Not set is selected", async () => {
    mocks.list.mockResolvedValue([
      {
        ...variant,
        attributeValues: [
          {
            attributeId: "3",
            name: "Enabled",
            slug: "enabled",
            dataType: "boolean",
            value: false,
          },
        ],
      },
    ]);

    render(
      <ProductVariantsManager
        productId="7"
        productVersion={product.updatedAt}
        onProductVersion={vi.fn()}
      />,
    );

    await screen.findByText("SERUM-01");

    fireEvent.click(
      screen.getByRole("button", { name: "Edit" }),
    );

    fireEvent.change(screen.getByLabelText("Enabled"), {
      target: { value: "" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Save Changes" }),
    );

    await waitFor(() =>
      expect(mocks.update).toHaveBeenCalledWith(
        "7",
        "11",
        expect.objectContaining({
          attributeValues: [],
        }),
      ),
    );
  });

  it.each([
    ["invalid syntax", "{", "Metadata must contain valid JSON."],
    ["number scalar", "123", "Metadata must be a JSON object or array."],
    ["string scalar", '"hello"', "Metadata must be a JSON object or array."],
    ["boolean scalar", "true", "Metadata must be a JSON object or array."],
    ["null scalar", "null", "Metadata must be a JSON object or array."],
  ])("blocks %s JSON locally", async (_case, json, message) => {
    render(
      <ProductVariantsManager
        productId="7"
        productVersion={product.updatedAt}
        onProductVersion={vi.fn()}
      />,
    );

    await screen.findByText("SERUM-01");

    fireEvent.click(
      screen.getByRole("button", { name: "Add Variant" }),
    );

    fireEvent.change(screen.getByLabelText("Variant SKU"), {
      target: { value: "JSON" },
    });

    fireEvent.change(screen.getByLabelText("Variant name"), {
      target: { value: "JSON" },
    });

    fireEvent.change(screen.getByLabelText("Metadata"), {
      target: { value: json },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Create Variant" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(message);

    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("accepts a JSON array", async () => {
    render(
      <ProductVariantsManager
        productId="7"
        productVersion={product.updatedAt}
        onProductVersion={vi.fn()}
      />,
    );

    await screen.findByText("SERUM-01");

    fireEvent.click(
      screen.getByRole("button", { name: "Add Variant" }),
    );

    fireEvent.change(screen.getByLabelText("Variant SKU"), {
      target: { value: "ARRAY" },
    });

    fireEvent.change(screen.getByLabelText("Variant name"), {
      target: { value: "Array" },
    });

    fireEvent.change(screen.getByLabelText("Metadata"), {
      target: { value: '[{"tone":"warm"}]' },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Create Variant" }),
    );

    await waitFor(() =>
      expect(mocks.create).toHaveBeenCalledWith(
        "7",
        expect.objectContaining({
          attributeValues: [
            {
              attributeId: "5",
              value: [{ tone: "warm" }],
            },
          ],
        }),
      ),
    );
  });

  it("does not issue Variant requests without read permission and hides mutations without manage permission", async () => {
    mocks.permissions = [];

    const { rerender } = render(
      <ProductVariantsManager
        productId="7"
        productVersion={product.updatedAt}
        onProductVersion={vi.fn()}
      />,
    );

    expect(mocks.list).not.toHaveBeenCalled();
    expect(mocks.attributes).not.toHaveBeenCalled();

    mocks.permissions = ["products.view"];

    rerender(
      <ProductVariantsManager
        productId="8"
        productVersion={product.updatedAt}
        onProductVersion={vi.fn()}
      />,
    );

    await screen.findByText("SERUM-01");

    expect(
      screen.queryByRole("button", { name: "Add Variant" }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: "Edit" }),
    ).not.toBeInTheDocument();
  });
});