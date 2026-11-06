export const BRANDS_SUPPLIERS_PERMISSIONS = {
  view: "suppliers.view",
  verify: "suppliers.verify",
  manage: "suppliers.manage",

  // Brand administration remains owned by the Catalogue domain.
  catalogueBrandsManage: "catalogue.brands.manage",
} as const;