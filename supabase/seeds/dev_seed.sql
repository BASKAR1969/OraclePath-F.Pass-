-- ============================================================
-- OraclePath — Development Seed Data
-- This is SEPARATE from the schema. Resettable. Never required for production.
-- ============================================================
-- NOTE: Run this ONLY in development/demo environments.
-- Course IDs use deterministic UUIDs for referential integrity in seed data.
-- ============================================================

-- Demo student profile (created by auth trigger on signup, shown here for reference)
-- INSERT INTO public.profiles (id, email, full_name, role) VALUES
--   ('c657257e-ce96-4003-b6be-c77f59f656d5', 'student@oraclepath.com', 'Demo Student', 'student');

-- Courses
INSERT INTO public.courses (id, title, subtitle, slug, description, level, duration, lessons_count, rating, price, original_price, currency, tags, topics, instructor_name, students_count, featured, status) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Oracle SQL Fundamentals', 'From Zero to Hero in Database Querying', 'oracle-sql-fundamentals', 'Master the art of querying Oracle databases with hands-on projects.', 'Beginner', '8 weeks', 64, 4.9, 199, 349, 'USD', 'SQL,Database,Querying', 'SELECT statements & filtering,JOINs and set operations,Aggregate functions & GROUP BY,Subqueries & correlated queries,Data manipulation (DML),DDL & schema design', 'Dr. Maria Chen', 3840, true, 'active'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'PL/SQL Programming Masterclass', 'Build Powerful Database Applications', 'plsql-programming-masterclass', 'Unlock the full power of Oracle procedural language.', 'Intermediate', '10 weeks', 80, 4.8, 249, 399, 'USD', 'PL/SQL,Procedural,Development', 'PL/SQL block structure & variables,Control structures & loops,Cursors & cursor variables,Stored procedures & functions,Database triggers,Packages & modular design,Exception handling & debugging', 'James O''Connell', 2150, true, 'active'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'Advanced SQL Tuning & Optimization', 'Make Your Queries Lightning Fast', 'advanced-sql-tuning', 'Learn execution plans, indexing strategies, hints, partitioning, and the optimizer.', 'Advanced', '6 weeks', 48, 4.9, 299, 449, 'USD', 'Performance,Optimization,Tuning', 'Execution plan analysis,Index design & optimization,Query rewrite techniques,Partitioning strategies,Optimizer statistics & hints,Real-world case studies', 'Rajesh Patel', 1280, false, 'active'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'Oracle APEX Low-Code Development', 'Build Web Apps Without Traditional Coding', 'oracle-apex-development', 'Create enterprise web applications in record time using Oracle APEX.', 'Intermediate', '8 weeks', 56, 4.7, 229, 379, 'USD', 'APEX,Low-Code,Web Apps', 'APEX architecture & setup,Interactive grids & reports,Dynamic actions & validations,REST APIs & integration,Authentication & authorization,Deployment & production', 'Lisa Zhang', 1650, false, 'active'),
  ('a1b2c3d4-0005-4000-8000-000000000005', 'Oracle DBA Essentials', 'Master Database Administration', 'oracle-dba-essentials', 'Install, configure, secure, and maintain Oracle databases.', 'Intermediate', '12 weeks', 96, 4.8, 349, 499, 'USD', 'DBA,Administration,Infrastructure', 'Database installation & configuration,User & privilege management,Backup & recovery strategies,RAC & Data Guard,Performance monitoring,Cloud & Autonomous Database', 'Ahmed Hassan', 980, false, 'active'),
  ('a1b2c3d4-0006-4000-8000-000000000006', 'SQL for Data Analytics', 'Transform Data into Insights', 'sql-for-data-analytics', 'Leverage Oracle analytic functions to solve complex business problems.', 'Intermediate', '6 weeks', 42, 4.8, 189, 299, 'USD', 'Analytics,Window Functions,BI', 'Window functions & OVER clause,Running totals & moving averages,Rank, dense_rank, & ntile,Pivot & unpivot operations,Pattern matching (MATCH_RECOGNIZE),Time-series & trend analysis', 'Dr. Maria Chen', 1890, false, 'active');

-- Course Modules (representative — see actual DB for full set)
-- These are seeded via the application to maintain course_modules FK integrity.

-- Internships
INSERT INTO public.internships (title, company, location, type, duration, stipend, description, requirements, skills, openings, deadline, featured, status) VALUES
  ('Oracle Database Developer Intern', 'DataFlow Solutions', 'Remote', 'Remote', '3 months', '$2,500/month', 'Work on real enterprise database projects.', 'Strong SQL & PL/SQL knowledge,Basic understanding of database design,Problem-solving mindset,Available 20+ hours/week', 'SQL,PL/SQL,Oracle 19c,Git', 4, 'July 15, 2025', true, 'open'),
  ('PL/SQL Engineer Intern', 'Oracle Systems Inc.', 'Austin, TX', 'Hybrid', '6 months', '$3,200/month', 'Join the core database team at Oracle.', 'Completed PL/SQL coursework or equivalent,Understanding of Oracle architecture,Familiarity with Linux environments,Pursuing CS/IT/related degree', 'PL/SQL,Oracle Cloud,Linux,Performance Tuning', 2, 'June 30, 2025', true, 'open');

-- FAQ
INSERT INTO public.faq (question, answer, category, sort_order) VALUES
  ('What is OraclePath?', 'OraclePath is a specialized learning platform under Ervion Technologies, dedicated to Oracle SQL and PL/SQL education.', 'General', 1),
  ('How do I enroll?', 'Browse courses, select one, and complete the secure checkout. Paid courses use Razorpay for payment.', 'Courses', 2),
  ('Are internships paid?', 'Yes, all internships are paid. Stipends range from $2,200 to $3,500/month.', 'Internships', 3);
