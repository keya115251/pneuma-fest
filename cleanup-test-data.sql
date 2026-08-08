-- Run this in the Supabase SQL editor after running the Playwright suite.
-- Order matters where foreign keys exist: delete child rows before parents.

-- Dance
delete from dance_participants
where email like '%@playwright-test.com';

delete from dance_registrations
where email like '%@playwright-test.com';

-- Crew (3T's)
delete from crew_members
where email like '%@playwright-test.com';

delete from crew_registrations
where id in (
  select registration_id from crew_members
  where email like '%@playwright-test.com'
);
-- crew_registrations itself has no email column (only crew_members does),
-- so this subquery approach is required - run crew_members delete AFTER
-- this, not before, or the subquery will find nothing.

-- Band (Round 1 + Round 2, and any seeded Round 2 test bands)
delete from band_participants
where email like '%@playwright-test.com';

delete from band_registrations
where poc_email like '%@playwright-test.com';

-- Audience
delete from audience_registrations
where email like '%@playwright-test.com';

-- Storage cleanup (payment screenshots, ID proofs uploaded during tests)
-- must be done separately - raw SQL can't delete Storage objects. Ask
-- Claude for a cleanup script using supabaseAdmin.storage.from(...).remove()
-- if you want this automated too, or delete manually via the Supabase
-- dashboard's Storage browser (folders will be named after each test
-- registration's UUID, created just now, easy to spot by timestamp).
