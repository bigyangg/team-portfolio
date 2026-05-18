-- 03_reload_schema_cache.sql
-- Refresh PostgREST schema cache after migrations.

notify pgrst, 'reload schema';
