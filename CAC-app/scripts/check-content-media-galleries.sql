-- Read-only check of the three gallery relationship columns in the current database.
-- Resolve tables in public explicitly so another schema cannot produce a false positive.
WITH expected(table_name, column_name) AS (
  VALUES
    ('svc_cat_rels', 'media_id'),
    ('services_rels', 'media_id'),
    ('projects_rels', 'media_id')
)
SELECT
  expected.table_name,
  expected.column_name,
  CASE WHEN columns.column_name IS NULL THEN 'MISSING' ELSE 'PRESENT' END AS status,
  columns.data_type,
  columns.is_nullable
FROM expected
LEFT JOIN information_schema.columns AS columns
  ON columns.table_schema = 'public'
 AND columns.table_name = expected.table_name
 AND columns.column_name = expected.column_name
ORDER BY expected.table_name;
