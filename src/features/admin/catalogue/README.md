# Catalogue feature boundary

This directory owns Admin Catalogue view contracts, route metadata, permission metadata, API adapters, and Catalogue-specific composition.

Generic layout, tables, KPI cards, status badges, tabs, decision dialogs, workflow timelines, and states remain in `components/admin/common`. Supplier, Inventory, Audit, Files, and sector-pack information appears here only as read-only summaries or references.

CAT-02 must provide tenant-certified command-center and approval read APIs and extend the existing Admin product resources. Until then, unsupported adapter methods fail with `CatalogueEndpointUnavailableError`; they never return fixtures.
