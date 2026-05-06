-- Ember Network seed data (run AFTER schema.sql)
-- This creates a few published courses and modules.

insert into public.courses (id, title, description, instructor, duration, thumbnail_url, published)
values
  (
    '7a2e3a0b-7b5b-4c90-9c56-7bde8e6ed1a1',
    'Founder Foundations',
    'A practical start-to-clarity course that helps you define a problem, validate demand, and craft a focused first offer.',
    'The Ember Network',
    '4 weeks',
    null,
    true
  ),
  (
    '2f3c0f74-7d74-4c0a-92d6-6a1b0f86c7b2',
    'Market Validation Sprint',
    'Learn how to interview customers, test assumptions, and build evidence before you build product.',
    'The Ember Network',
    '3 weeks',
    null,
    true
  )
on conflict (id) do nothing;

insert into public.modules (course_id, title, description, position, content)
values
  (
    '7a2e3a0b-7b5b-4c90-9c56-7bde8e6ed1a1',
    'Define Your Problem',
    'Clarify the problem, the audience, and the urgency.',
    1,
    jsonb_build_object(
      'sections', jsonb_build_array(
        jsonb_build_object('type','text','value','Identify a painful problem you can explain in one sentence.'),
        jsonb_build_object('type','task','value','Write a one-page problem brief and share it with your mentor.')
      )
    )
  ),
  (
    '7a2e3a0b-7b5b-4c90-9c56-7bde8e6ed1a1',
    'Design a Simple Offer',
    'Turn the problem into a clear offer and expected outcomes.',
    2,
    jsonb_build_object(
      'sections', jsonb_build_array(
        jsonb_build_object('type','text','value','Define who it is for, what you deliver, and what success looks like.'),
        jsonb_build_object('type','task','value','Draft a simple offer statement and validate with 3 target users.')
      )
    )
  ),
  (
    '2f3c0f74-7d74-4c0a-92d6-6a1b0f86c7b2',
    'Interview Planning',
    'Plan interviews that reveal real behaviors and constraints.',
    1,
    jsonb_build_object(
      'sections', jsonb_build_array(
        jsonb_build_object('type','text','value','Use open-ended questions; avoid pitching during interviews.'),
        jsonb_build_object('type','task','value','Schedule 5 interviews and prepare a 10-question script.')
      )
    )
  ),
  (
    '2f3c0f74-7d74-4c0a-92d6-6a1b0f86c7b2',
    'Evidence & Next Steps',
    'Summarize what you learned and decide what to build next.',
    2,
    jsonb_build_object(
      'sections', jsonb_build_array(
        jsonb_build_object('type','text','value','Cluster interview notes into themes; look for repeated signals.'),
        jsonb_build_object('type','task','value','Write a validation memo and decide the next experiment.')
      )
    )
  )
on conflict (course_id, position) do nothing;

