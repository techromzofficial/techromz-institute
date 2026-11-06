import type {ActionCapabilities} from "@/types/admin";export const canDecide=(c:ActionCapabilities)=>c.permissions.canApprove||c.permissions.canReject;
