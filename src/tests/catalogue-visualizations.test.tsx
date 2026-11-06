import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import CategoriesPage from "@/app/admin/catalogue/categories/page";
import BrandsPage from "@/app/admin/catalogue/brands/page";
import QualityPage from "@/app/admin/catalogue/quality/page";

const api=vi.hoisted(()=>({categories:vi.fn(),brands:vi.fn(),dashboard:vi.fn(),findings:vi.fn()}));
const navigation=vi.hoisted(()=>({params:new URLSearchParams()}));
vi.mock("next/navigation",()=>({useSearchParams:()=>navigation.params,usePathname:()=>"/admin/catalogue",useRouter:()=>({replace:vi.fn()})}));
vi.mock("@/contexts/AdminContext",()=>({useAdminContext:()=>({hasPermission:()=>true})}));
vi.mock("@/components/admin/common/PermissionGuard",()=>({PermissionGuard:({children}:{children:React.ReactNode})=><>{children}</>}));
vi.mock("@/features/admin/catalogue/api/catalogueApi",()=>({
  metadataApi:{listCategories:api.categories},brandApi:{list:api.brands},qualityApi:{dashboard:api.dashboard,findings:api.findings,refresh:vi.fn()}
}));

afterEach(()=>cleanup());

describe("Catalogue database-backed visualizations",()=>{
  it("renders category governance and Brand readiness charts from API summaries",async()=>{
    api.categories.mockResolvedValue({data:[],page:1,pageSize:20,total:1,summary:{root_categories:1,active_categories:1,subcategories:0,empty_categories:0,categories_missing_attributes:0,uncategorized_products:0,product_links:2,attribute_links:3,governance_trend:[{date:"2026-09-10",changes:1}]}});
    const categoryView=render(<CategoriesPage/>);
    expect(await screen.findByTestId("category-governance-trend")).toBeInTheDocument();
    categoryView.unmount();

    api.brands.mockResolvedValue({data:[],page:1,pageSize:20,total:2,summary:{active_brands:2,verified_brands:1,verified_active_brands:1,unverified_active_brands:1,inactive_brands:0,media_links:1}});
    render(<BrandsPage/>);
    expect(await screen.findByTestId("brand-readiness-distribution")).toBeInTheDocument();
  });

  it("renders quality trend, issue and status charts from API aggregates",async()=>{
    api.dashboard.mockResolvedValue({totalProducts:2,productsWithQualityIssues:1,criticalFindings:1,warningFindings:0,missingCategory:0,missingRequiredAttributes:0,missingMedia:1,issueDistribution:[{type:"missing_media",count:1}],statusDistribution:[{status:"open",count:1}],trend:[{date:"2026-09-10",detected:1,critical:1,resolved:0}]});
    api.findings.mockResolvedValue({data:[],page:1,pageSize:20,total:0});
    render(<QualityPage/>);
    expect(await screen.findByTestId("quality-trend-chart")).toBeInTheDocument();
    expect(screen.getByTestId("quality-issue-distribution")).toBeInTheDocument();
    expect(screen.getByTestId("quality-status-distribution")).toBeInTheDocument();
  });
});
