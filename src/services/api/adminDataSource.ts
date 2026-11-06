import { authorizations, batches, orders, products, returns, suppliers } from "@/mocks/admin/fixtures";
import { api, withQuery } from "@/lib/api";

export const useAdminMocks = process.env.NEXT_PUBLIC_USE_ADMIN_MOCKS === "true";
const collections = { suppliers, authorizations, products, batches, orders, returns };
export type Collection = keyof typeof collections;

export async function listAdminData<K extends Collection>(key: K) {
  if (useAdminMocks) return collections[key];
  
  let endpoint = "";
  switch(key) {
    case "suppliers": endpoint = "/admin/suppliers"; break;
    case "products": endpoint = "/admin/products"; break;
    case "authorizations": endpoint = "/supplier/sl-beauty/brand-authorizations"; break;
    default:
      throw new Error(`Live ${key} service is not configured.`);
  }

  const response = await api.get(withQuery(endpoint));
  const data = response.data || response;

  // We map basic fields to prevent the table crashing
  return data.map((item: any) => ({
    ...item,
    id: String(item.id), // Ensure ID is a string for UI components
    name: item.name || item.company_name || item.title || `Item ${item.id}`,
  }));
}

export async function getAdminRecord<K extends Collection>(key: K, id: string) {
  const rows = await listAdminData(key);
  return rows.find((row: any) => row.id === id);
}

export async function submitAdminAction(entity: string, id: string, action: string, reason: string) {
  if (!reason.trim()) throw new Error("A reason is required");
  // For now, this just simulates the action being accepted
  return {
    event: { id: crypto.randomUUID(), title: `${action} submitted`, detail: `${entity} ${id}`, createdAt: new Date().toISOString() },
    status: "accepted"
  };
}
