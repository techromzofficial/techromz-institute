import type {Authorization,Batch,Order,Product,ReturnCase,Supplier} from "@/types/admin";
const capabilities={permissions:{canApprove:true,canReject:true,canOverride:false,canRefund:true},availableActions:["approve","reject","request-information"]};
export const suppliers:Supplier[]=[
 {id:"supplier-uuid-001",publicReference:"SUP-2026-001",companyName:"Serene Botanics Lanka",country:"Sri Lanka",status:"Under Review",risk:"Medium",assigned:"me",documents:8,brandAuthorizationId:"authorization-uuid-001",supplierType:"Brand Owner",applicationDate:"Jul 18, 2026",progress:85,capabilities},
 {id:"supplier-uuid-002",publicReference:"SUP-2026-002",companyName:"Ceylon Glow Exports",country:"Sri Lanka",status:"Additional Info Required",risk:"High",assigned:"team",documents:5,brandAuthorizationId:"authorization-uuid-002",supplierType:"Authorized Distributor",applicationDate:"Jul 16, 2026",progress:40,capabilities},
 {id:"supplier-uuid-003",publicReference:"SUP-2026-003",companyName:"Velvet Botanics Ltd.",country:"United Kingdom",status:"Approved",risk:"Low",assigned:"me",documents:10,brandAuthorizationId:"authorization-uuid-001",supplierType:"Brand Owner",applicationDate:"Jul 12, 2026",progress:100,capabilities},
 {id:"supplier-uuid-004",publicReference:"SUP-2026-004",companyName:"LuxeSkin Wholesale",country:"Singapore",status:"Approved",risk:"High",assigned:"team",documents:9,brandAuthorizationId:"authorization-uuid-002",supplierType:"Wholesaler",applicationDate:"Jul 09, 2026",progress:90,capabilities},
 {id:"supplier-uuid-005",publicReference:"SUP-2026-005",companyName:"Ceylon Botanicals",country:"Sri Lanka",status:"Rejected",risk:"High",assigned:"me",documents:4,brandAuthorizationId:"authorization-uuid-001",supplierType:"Manufacturer",applicationDate:"Jul 04, 2026",progress:20,capabilities},
 {id:"supplier-uuid-006",publicReference:"SUP-2026-006",companyName:"Tokyo Beauty Co.",country:"Japan",status:"Under Review",risk:"Medium",assigned:"team",documents:7,brandAuthorizationId:"authorization-uuid-002",supplierType:"Authorized Distributor",applicationDate:"Jul 01, 2026",progress:75,capabilities}
];
export const authorizations:Authorization[]=[
 {id:"authorization-uuid-001",publicReference:"AUTH-2026-041",brand:"Aurora Skin",supplier:"Serene Botanics Lanka",territory:"Sri Lanka",type:"Exclusive",expiry:"2027-06-30",conflictStatus:"Clear",status:"Pending Review",risk:"Low",assigned:"me",productId:"product-uuid-001",capabilities},
 {id:"authorization-uuid-002",publicReference:"AUTH-2026-042",brand:"Lumière Labs",supplier:"Ceylon Glow Exports",territory:"South Asia",type:"Distributor",expiry:"2026-09-15",conflictStatus:"Potential overlap",status:"Escalated",risk:"High",assigned:"team",productId:"product-uuid-002",capabilities}
];
export const products:Product[]=[
 {id:"product-uuid-001",publicReference:"PRD-2026-101",name:"Barrier Repair Serum",variant:"30 ml",supplier:"Serene Botanics Lanka",brand:"Aurora Skin",authorizationId:"authorization-uuid-001",completeness:96,compliance:"Pending Review",status:"Pending Review",risk:"Low",assigned:"me",batchId:"batch-uuid-001",capabilities},
 {id:"product-uuid-002",publicReference:"PRD-2026-102",name:"Mineral Daily SPF",variant:"50 ml",supplier:"Ceylon Glow Exports",brand:"Lumière Labs",authorizationId:"authorization-uuid-002",completeness:82,compliance:"Safety blocker",status:"On Hold",risk:"High",assigned:"team",batchId:"batch-uuid-002",capabilities}
];
export const batches:Batch[]=[
 {id:"batch-uuid-001",publicReference:"BAT-2026-301",productId:"product-uuid-001",product:"Barrier Repair Serum",location:"Colombo FC",available:1240,reserved:180,quarantined:0,recalled:0,expiry:"2027-11-30",status:"Active",risk:"Low",capabilities},
 {id:"batch-uuid-002",publicReference:"BAT-2026-302",productId:"product-uuid-002",product:"Mineral Daily SPF",location:"Kandy Hub",available:320,reserved:45,quarantined:80,recalled:0,expiry:"2026-10-15",status:"Quarantined",risk:"High",capabilities}
];
export const orders:Order[]=[
 {id:"order-uuid-001",publicReference:"ORD-2026-501",customer:"N. Perera",paymentStatus:"Paid",orderStatus:"Processing",fulfilmentStatus:"Partially Allocated",allocationStatus:"Partial",deliveryStatus:"Not Dispatched",supplier:"2 suppliers",returnId:"return-uuid-001",status:"Processing",risk:"Medium",assigned:"me",capabilities},
 {id:"order-uuid-002",publicReference:"ORD-2026-502",customer:"A. Fernando",paymentStatus:"Paid",orderStatus:"Shipped",fulfilmentStatus:"Completed",allocationStatus:"Complete",deliveryStatus:"In Transit",supplier:"Serene Botanics Lanka",returnId:"return-uuid-002",status:"Shipped",risk:"Low",assigned:"team",capabilities}
];
export const returns:ReturnCase[]=[
 {id:"return-uuid-001",publicReference:"RET-2026-701",orderId:"order-uuid-001",orderReference:"ORD-2026-501",returnStatus:"Eligibility Review",eligibilityStatus:"Pending",inspectionStatus:"Pending",refundStatus:"Pending Review",disputeStatus:"None",sla:"6h 20m",batchId:"batch-uuid-001",status:"Eligibility Review",risk:"High",assigned:"me",capabilities},
 {id:"return-uuid-002",publicReference:"RET-2026-702",orderId:"order-uuid-002",orderReference:"ORD-2026-502",returnStatus:"Received",eligibilityStatus:"Eligible",inspectionStatus:"Passed",refundStatus:"Approved",disputeStatus:"Under Review",sla:"18h 05m",batchId:"batch-uuid-002",status:"Received",risk:"Medium",assigned:"team",capabilities}
];
export const dashboardMetrics=[{label:"Pending supplier reviews",value:"18",href:"/admin/verification-compliance/supplier-verification?status=pending"},{label:"Authorization reviews",value:"12",href:"/admin/brands-suppliers/authorizations?status=submitted"},{label:"Product approvals",value:"27",href:"/admin/catalogue/product-approvals?status=pending"},{label:"At-risk returns",value:"6",href:"/admin/marketplace/returns?risk=high"}];
