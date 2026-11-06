import {DashboardOverview} from "@/components/admin/dashboard/DashboardOverview";import {PageHeader} from "@/components/admin/layout/PageHeader";
export default function Dashboard(){return <><PageHeader title="Executive Command Center" description="Welcome back — here is how the SL Beauty ecosystem is performing today." crumbs={["Admin","Dashboard"]}/><DashboardOverview/></>}
