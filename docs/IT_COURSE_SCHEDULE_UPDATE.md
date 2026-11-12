# IT course schedule update — deployment follow-up

The public catalogue is static (`demoCourses.ts` via `LocalEducationCourseService`).
Department membership comes from `instituteContent.ts`, not just the catalogue's
subject filter. The IT department contains nine public courses: three AI, three
Retail and three Mobile courses. AI now uses 18:00–20:00 and Retail uses
20:00–22:00 Asia/Colombo on the original December 1, 2 and 3, 2026 dates.
Mobile start dates remain unannounced. The provisioning manifest agrees.
All nine specify a maximum of 30 students. AI Kickstart, Retail Kickstart and
Mobile Kickstart now override the conflicting 20-student beginner notice.
The shared beginner policy used outside this department has not changed.

No production database was accessed or changed. Do not rerun the whole catalogue
provisioner to update these six existing records: it also touches other courses
and registration dates. A database operator should inspect the exact existing
intakes below, take the normal backup, and apply this narrow transaction only
after confirming the IDs, titles and expected values. Missing or unexpected
records require investigation, not replacement inserts.

Database DATETIME values are UTC (the project's mysql2 connections use `timezone: 'Z'`).
17:30 Sri Lanka = 12:00 UTC; 18:00 = 12:30 UTC; 19:30 = 14:00 UTC;
20:00 = 14:30 UTC. The schema stores
`starts_at` but has no session end-time column; the end time is catalogue data.

```sql
START TRANSACTION;
SELECT c.slug, i.id, i.starts_at, i.max_seats
FROM institute_course_intakes i
JOIN institute_courses c ON c.id = i.course_id
WHERE (c.slug, i.id) IN (
  ('build-your-first-ai-assistant', '9b769aa1-fd40-4b64-a999-60413681de67'),
  ('build-an-ai-knowledge-assistant', 'a972c9e2-3a2e-48ae-8360-3bbe3cb91661'),
  ('build-and-launch-your-ai-assistant', 'de993e20-6f49-4873-9734-bbb2dd0b6dc1'),
  ('retail-kickstart', 'd6f4b4be-befa-4c65-bb25-6477ea9eac98'),
  ('retail-developer-lab', 'e0eff01c-a23a-4166-a942-410d54d0d284'),
  ('retail-launchpad', '5c017bf2-74f8-4c44-9274-8e11b3453228')
) FOR UPDATE;

UPDATE institute_course_intakes i
JOIN institute_courses c ON c.id = i.course_id
SET i.starts_at = CASE i.id
  WHEN '9b769aa1-fd40-4b64-a999-60413681de67' THEN '2026-12-01 12:30:00'
  WHEN 'a972c9e2-3a2e-48ae-8360-3bbe3cb91661' THEN '2026-12-02 12:30:00'
  WHEN 'de993e20-6f49-4873-9734-bbb2dd0b6dc1' THEN '2026-12-03 12:30:00'
  WHEN 'd6f4b4be-befa-4c65-bb25-6477ea9eac98' THEN '2026-12-01 14:30:00'
  WHEN 'e0eff01c-a23a-4166-a942-410d54d0d284' THEN '2026-12-02 14:30:00'
  WHEN '5c017bf2-74f8-4c44-9274-8e11b3453228' THEN '2026-12-03 14:30:00'
END, i.max_seats = 30
WHERE
  (c.slug = 'build-your-first-ai-assistant' AND i.id = '9b769aa1-fd40-4b64-a999-60413681de67' AND i.starts_at IN ('2026-12-01 12:00:00', '2026-12-01 12:30:00')) OR
  (c.slug = 'build-an-ai-knowledge-assistant' AND i.id = 'a972c9e2-3a2e-48ae-8360-3bbe3cb91661' AND i.starts_at IN ('2026-12-02 12:00:00', '2026-12-02 12:30:00')) OR
  (c.slug = 'build-and-launch-your-ai-assistant' AND i.id = 'de993e20-6f49-4873-9734-bbb2dd0b6dc1' AND i.starts_at IN ('2026-12-03 12:00:00', '2026-12-03 12:30:00')) OR
  (c.slug = 'retail-kickstart' AND i.id = 'd6f4b4be-befa-4c65-bb25-6477ea9eac98' AND i.starts_at IN ('2026-12-01 14:00:00', '2026-12-01 14:30:00')) OR
  (c.slug = 'retail-developer-lab' AND i.id = 'e0eff01c-a23a-4166-a942-410d54d0d284' AND i.starts_at IN ('2026-12-02 14:00:00', '2026-12-02 14:30:00')) OR
  (c.slug = 'retail-launchpad' AND i.id = '5c017bf2-74f8-4c44-9274-8e11b3453228' AND i.starts_at IN ('2026-12-03 14:00:00', '2026-12-03 14:30:00'));

-- Repeat the SELECT above and verify all six starts and capacities.
-- COMMIT only after verification; otherwise ROLLBACK.
```

For the three Mobile intake IDs in the manifest, inspect `max_seats` separately.
They already provision with 30. If an existing record differs, update only
`max_seats` to 30 for that exact `id` and matching `course_id`, after inspection;
do not change its null/unannounced `starts_at`. These IDs are
`bb0dc67b-6843-4ee8-98cc-a64694a7e56d`,
`e37f1a28-c023-485b-8902-7e1c82b7b87c`, and
`cfe904f9-b065-4dbd-a6bd-49b775cc1359`.

Use the same inspect/lock/verify/commit procedure for this capacity-only change:

```sql
SELECT c.slug, i.id, i.starts_at, i.max_seats
FROM institute_course_intakes i JOIN institute_courses c ON c.id = i.course_id
WHERE (c.slug, i.id) IN (
  ('mobile-kickstart', 'bb0dc67b-6843-4ee8-98cc-a64694a7e56d'),
  ('mobile-developer-lab', 'e37f1a28-c023-485b-8902-7e1c82b7b87c'),
  ('mobile-launchpad', 'cfe904f9-b065-4dbd-a6bd-49b775cc1359')
) FOR UPDATE;
UPDATE institute_course_intakes i JOIN institute_courses c ON c.id = i.course_id
SET i.max_seats = 30
WHERE i.max_seats <> 30 AND (c.slug, i.id) IN (
  ('mobile-kickstart', 'bb0dc67b-6843-4ee8-98cc-a64694a7e56d'),
  ('mobile-developer-lab', 'e37f1a28-c023-485b-8902-7e1c82b7b87c'),
  ('mobile-launchpad', 'cfe904f9-b065-4dbd-a6bd-49b775cc1359')
);
```
Four legacy IT demonstration concepts have no scheduled intakes and are excluded
from public discovery and direct course routes; their publication is unchanged.

Staging still needs a real verified-email enquiry, database/outbox confirmation,
and delivery-worker checks using the existing controlled enquiry E2E workflow.
Frontend response simulations cannot establish production persistence or delivery.
