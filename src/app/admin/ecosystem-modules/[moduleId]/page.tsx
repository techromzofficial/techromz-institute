import { ModuleDetailWorkspace } from "@/features/admin/ecosystem-modules/detail/ModuleDetailWorkspace";

export default async function EcosystemModuleRoute({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  return <ModuleDetailWorkspace moduleKey={moduleId} />;
}

