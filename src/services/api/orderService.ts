import {
  mockPaymentSummary,
  mockPriorityAlerts,
  mockQuickQueue,
  mockOfficers,
  getMockOrderDetail,
} from "@/mocks/admin/orders.mock";
import type {
  PaymentSummaryMetrics,
  PriorityAlertItem,
  QuickQueueItem,
  OrderDetail,
} from "@/types/admin";

export async function fetchPriorityAlerts(): Promise<PriorityAlertItem[]> {
  return mockPriorityAlerts;
}

export async function fetchPaymentSummary(): Promise<PaymentSummaryMetrics> {
  return mockPaymentSummary;
}

export async function fetchQuickQueue(): Promise<QuickQueueItem[]> {
  return mockQuickQueue;
}

export async function fetchOfficersList() {
  return mockOfficers;
}

export async function fetchOrderDetail(orderIdOrRef: string): Promise<OrderDetail | null> {
  const detail = getMockOrderDetail(orderIdOrRef);
  return detail;
}

export async function updateOrderStatus(orderId: string, newStatus: string, reason: string): Promise<{ success: boolean; message: string }> {
  if (!reason.trim()) {
    throw new Error("A reason is required to update order status.");
  }
  const detail = getMockOrderDetail(orderId);
  if (detail) {
    detail.orderStatus = newStatus;
    detail.auditHistory.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }),
      actor: "Current User",
      action: "Status Updated",
      detail: `Order status updated to ${newStatus}`,
      reason,
    });
  }
  return { success: true, message: `Order status updated to ${newStatus}.` };
}

export async function holdOrder(orderId: string, reason: string, note?: string): Promise<{ success: boolean; message: string }> {
  if (!reason.trim()) {
    throw new Error("A mandatory reason is required to place an order on hold.");
  }
  const detail = getMockOrderDetail(orderId);
  if (detail) {
    detail.orderStatus = "On Hold";
    detail.auditHistory.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }),
      actor: "Current User",
      action: "Order Held",
      detail: `Order placed on hold. ${note ? `Note: ${note}` : ""}`,
      reason,
    });
  }
  return { success: true, message: "Order placed on hold." };
}

export async function cancelOrder(orderId: string, reason: string): Promise<{ success: boolean; message: string }> {
  if (!reason.trim()) {
    throw new Error("A mandatory cancellation reason is required.");
  }
  const detail = getMockOrderDetail(orderId);
  if (detail) {
    detail.orderStatus = "Cancelled";
    detail.auditHistory.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }),
      actor: "Current User",
      action: "Order Cancelled",
      detail: "Order was cancelled by officer",
      reason,
    });
  }
  return { success: true, message: "Order has been cancelled." };
}

export async function startRefundReview(orderId: string, reason: string): Promise<{ success: boolean; message: string }> {
  if (!reason.trim()) {
    throw new Error("A reason is required to initiate a refund review.");
  }
  const detail = getMockOrderDetail(orderId);
  if (detail) {
    detail.returnSummary.refundStatus = "Pending Review";
    detail.auditHistory.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }),
      actor: "Current User",
      action: "Refund Review Started",
      detail: "Initiated refund review workflow",
      reason,
    });
  }
  return { success: true, message: "Refund review initiated." };
}

export async function startReturnReview(orderId: string, reason: string, overrideInspection = false): Promise<{ success: boolean; message: string }> {
  if (!reason.trim()) {
    throw new Error("A reason is required to initiate a return review.");
  }
  const detail = getMockOrderDetail(orderId);
  if (detail) {
    detail.returnSummary.returnStatus = "Eligibility Review";
    if (overrideInspection) {
      detail.returnSummary.inspectionStatus = "Overridden";
    }
    detail.auditHistory.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }),
      actor: "Current User",
      action: overrideInspection ? "Return Review Started (Inspection Overridden)" : "Return Review Started",
      detail: "Initiated return review workflow",
      reason,
    });
  }
  return { success: true, message: "Return review initiated." };
}

export async function escalateOrder(orderId: string, category: string, priority: string, reason: string, assignedTo?: string): Promise<{ success: boolean; message: string }> {
  if (!reason.trim()) {
    throw new Error("A reason is required to escalate an order.");
  }
  const detail = getMockOrderDetail(orderId);
  if (detail) {
    detail.riskLevel = priority === "Critical" || priority === "High" ? "High" : "Medium";
    detail.auditHistory.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }),
      actor: "Current User",
      action: "Order Escalated",
      detail: `Escalated under category '${category}' with priority '${priority}'${assignedTo ? ` assigned to ${assignedTo}` : ""}`,
      reason,
    });
  }
  return { success: true, message: `Order escalated (${priority} priority).` };
}

export async function contactCustomer(orderId: string, subject: string, message: string): Promise<{ success: boolean; message: string }> {
  if (!subject.trim() || !message.trim()) {
    throw new Error("Subject and message content are required.");
  }
  const detail = getMockOrderDetail(orderId);
  if (detail) {
    detail.auditHistory.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }),
      actor: "Current User",
      action: "Customer Contacted",
      detail: `Subject: ${subject} | Content: ${message.substring(0, 60)}...`,
    });
  }
  return { success: true, message: "Message sent to customer successfully." };
}

export async function contactSuppliers(orderId: string, supplierIds: string[], subject: string, message: string): Promise<{ success: boolean; message: string }> {
  if (!supplierIds.length || !subject.trim() || !message.trim()) {
    throw new Error("Suppliers, subject, and message are required.");
  }
  const detail = getMockOrderDetail(orderId);
  if (detail) {
    detail.auditHistory.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }),
      actor: "Current User",
      action: "Suppliers Contacted",
      detail: `Contacted ${supplierIds.length} supplier(s). Subject: ${subject}`,
    });
  }
  return { success: true, message: `Message sent to ${supplierIds.length} supplier(s).` };
}

export { getAdminRecord, listAdminData, submitAdminAction } from "./adminDataSource";
