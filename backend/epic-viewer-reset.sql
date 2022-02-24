\echo "Delete and recreate epic_viewer db?"
\prompt "Return for yes or control-C to cancel > " foo

DROP DATABASE epic_viewer_db;
CREATE DATABASE epic_viewer_db;
\connect epic_viewer_db;

\i epic-viewer-schema.sql
\i epic-viewer-seed.sql

\echo "Delete and recreate epic_viewer_test db?"
\prompt "Return for yes or control-C to cancel > " foo

DROP DATABASE epic_viewer_test_db;
CREATE DATABASE epic_viewer_test_db;
\connect epic_viewer_test_db;

\i epic-viewer-schema.sql