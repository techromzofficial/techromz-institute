import type {ReturnCase} from "@/types/admin";export const canApproveFullRefund=(r:ReturnCase)=>r.inspectionStatus!=="Pending"||r.capabilities.permissions.canOverride;
