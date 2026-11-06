export const dashboardStats=[
 {id:"revenue",label:"Total Revenue",value:"LKR 45.2M",trend:"+12%",direction:"up",icon:"wallet"},
 {id:"payouts",label:"Total Payouts",value:"LKR 8.4M",trend:"+8%",direction:"up",icon:"landmark"},
 {id:"orders",label:"Total Orders",value:"12,450",trend:"+15.3%",direction:"up",icon:"cart"},
 {id:"customers",label:"Active Customers",value:"8,200",trend:"+9.7%",direction:"up",icon:"users"},
 {id:"brands",label:"Active Brands",value:"142",trend:"+6 new",direction:"up",icon:"tags"},
 {id:"approvals",label:"Pending Approvals",value:"215",trend:"Needs review",direction:"down",icon:"clipboard"}
] as const;
export const salesTrend=[2.9,2.6,2.35,2.3,2.6,3,3.35,3.5,3.4,3.3,3.5,3.95,4.45,4.8,5.25].map((value,index)=>({day:`D${index+1}`,value:value*1_000_000}));
export const ecosystem=[{label:"Skincare",value:40,color:"#741d35"},{label:"Haircare",value:30,color:"#c96686"},{label:"Cosmetics",value:20,color:"#c9a227"},{label:"Tools",value:10,color:"#ead9ce"}];
export const dashboardOrders=[{id:"order-uuid-001",reference:"ORD-2026-501",brand:"Aurora Skin",amount:"LKR 12,400",status:"Processing"},{id:"order-uuid-002",reference:"ORD-2026-502",brand:"Lumière Labs",amount:"LKR 8,900",status:"Shipped"}];
export const verificationAlerts=[{id:"supplier-uuid-001",supplier:"Serene Botanics Lanka",issue:"Document expires in 3 days",tone:"warning"},{id:"supplier-uuid-002",supplier:"Ceylon Glow Exports",issue:"Verification audit pending",tone:"audit"}];
export const dashboardRiskAlert={title:"High-Risk Alert",message:"Supplier compliance evidence requires immediate review",href:"/admin/verification-compliance/supplier-verification"};
export const dashboardActions=[{label:"Review Supplier",href:"/admin/verification-compliance/supplier-verification"},{label:"Review Brand",href:"/admin/brands-suppliers/authorizations"},{label:"Review Product",href:"/admin/catalogue/product-approvals"},{label:"Inventory",href:"/admin/catalogue/inventory"},{label:"Orders",href:"/admin/marketplace/orders"},{label:"Returns",href:"/admin/marketplace/returns"}];
export const dashboardMetrics=[{label:"Pending supplier reviews",value:"18",href:"/admin/verification-compliance/supplier-verification?status=under_review"},{label:"Authorization reviews",value:"12",href:"/admin/brands-suppliers/authorizations?status=submitted"},{label:"Product approvals",value:"27",href:"/admin/catalogue/product-approvals?status=pending"},{label:"At-risk returns",value:"6",href:"/admin/marketplace/returns?risk=high"}];
