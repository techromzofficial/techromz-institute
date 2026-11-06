import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuthorizationDetailView } from "@/components/admin/verification/authorization-detail/AuthorizationDetailView";
import { getAuthorizationDetailMock } from "@/mocks/admin/authorizationDetail.mock";
import { authorizations } from "@/mocks/admin/fixtures";

describe("AuthorizationDetailView", () => {
  it("opens a reason-required confirmation for an approval decision", () => {
    const authorizationCase = getAuthorizationDetailMock(authorizations[1]);
    render(<AuthorizationDetailView initialCase={authorizationCase} />);

    fireEvent.click(screen.getAllByRole("button", { name: "Approve Authorization" })[0]);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Confirm Approve Authorization")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Confirm action" }));
    expect(screen.getByText("A reason is required for the audit record.")).toBeInTheDocument();
  });
});

