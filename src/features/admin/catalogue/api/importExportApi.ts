import { api, uploadApi, withQuery } from "@/lib/api";

export type ImportCounts = {
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  create_rows: number;
  update_rows: number;
  unchanged_rows: number;
  applied_rows: number;
  failed_rows: number;
};

export type ImportError = {
  id: string;
  status: string;
  row_number: number;
  error_field: string | null;
  error_code: string;
  error_message: string;
};

export type ImportJob = {
  id: string;
  uuid: string;
  status: string;
  checksum: string | null;
  counts: ImportCounts;
  summary: Record<string, unknown> | null;
  file: { id: number; name: string } | null;
  created_by: { id: number; name: string } | null;
  created_at: string | null;
  completed_at: string | null;
  capabilities: { apply: boolean };
  errors?: ImportError[];
  errors_page?: number;
  errors_last_page?: number;
};

type HistoryResponse = {
  data: ImportJob[];
  current_page: number;
  last_page: number;
  total: number;
  analytics: ImportAnalytics;
};

export type ImportAnalytics = { status_distribution: { status: string; count: number }[]; trend: { date: string; jobs: number; records: number; applied: number; rejected: number }[] };

const adaptJob = (raw: any): ImportJob => ({
  ...raw,
  id: String(raw.id),
  errors: raw.errors?.map((error: any) => ({ ...error, id: String(error.id), status: "error" })),
});

export const importExportApi = {
  async template(): Promise<Blob> {
    return api.download("/admin/catalogue/imports/products/template");
  },
  async export(filters: { search?: string; status?: string; category?: string } = {}): Promise<Blob> {
    return api.download(withQuery("/admin/catalogue/exports/products", filters));
  },
  async upload(file: File): Promise<number> {
    const response: any = await uploadApi.uploadDocument(file, "catalogue_import");
    return Number((response.data ?? response).id);
  },
  async validate(uploadId: number): Promise<ImportJob> {
    const response: any = await api.post("/admin/catalogue/imports/products", { upload_id: uploadId });
    return adaptJob(response.data);
  },
  async apply(job: ImportJob): Promise<ImportJob> {
    const response: any = await api.post(`/admin/catalogue/imports/${job.id}/apply`, {
      expected_checksum: job.checksum,
    });
    return adaptJob(response.data);
  },
  async history(page = 1): Promise<HistoryResponse> {
    const response: any = await api.get(withQuery("/admin/catalogue/imports", { page }));
    return { ...response, data: (response.data ?? []).map(adaptJob), analytics: response.analytics ?? { status_distribution: [], trend: [] } };
  },
  async detail(id: string, errorsPage = 1): Promise<ImportJob> {
    const response: any = await api.get(withQuery(`/admin/catalogue/imports/${id}`, { page: errorsPage }));
    return adaptJob(response.data);
  },
};

export function saveCsv(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
