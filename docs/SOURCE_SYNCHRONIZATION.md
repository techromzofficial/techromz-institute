# Source synchronization policy

This repository is the deployment repository for Techromz Institute. The Retail Eco System worktree remains the development source until the Institute is deliberately separated.

For every future Institute change:

1. Make and validate the change in the existing Retail Eco System worktree without changing its remote.
2. Use `docs/institute-release-scope.md` as the allow-list. Copy Institute-owned paths and named shared integration files only; do not copy unrelated marketplace, catalogue, admin, marketing, build, environment, backup or media-source changes.
3. Apply the same change to a branch in this repository and review `git diff --stat`, `git diff --check`, and `git ls-files`.
4. Verify the feature flags remain fail-closed, scan the staged files for secrets, and run the full validation sequence from this repository root.
5. Commit both repositories with cross-references to the matching commit or change request. Push this repository only after its standalone build passes.
6. Deploy only through the separately authorized Hostinger staging workflow. Promote to production only after a distinct production approval.

Do not bulk-copy the original worktree or use ZIP exports. If a shared integration file has unrelated edits, port only the Institute hunk. If the clean repository cannot build independently, stop and fix the extraction before publishing.
