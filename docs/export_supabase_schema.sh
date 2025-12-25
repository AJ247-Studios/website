#!/usr/bin/env bash
# export_supabase_schema.sh
DB_HOST="db.nayiqxwlwmupqsrfzyvy.supabase.co"
DB_PORT=5432
DB_USER="postgres"
DB_NAME="postgres"
OUT_DIR="./supabase_exports"
mkdir -p "$OUT_DIR"


# Full schema
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -s -f "$OUT_DIR/schema.sql" "$DB_NAME"


# Helpful lists
psql "postgresql://$DB_USER@${DB_HOST}:${DB_PORT}/${DB_NAME}" -c "\copy (SELECT table_schema, table_name FROM information_schema.tables WHERE table_type='BASE TABLE' AND table_schema NOT IN ('pg_catalog','information_schema') ORDER BY table_schema, table_name) TO STDOUT WITH CSV HEADER" > "$OUT_DIR/tables.csv"


# RLS policies
psql "postgresql://$DB_USER@${DB_HOST}:${DB_PORT}/${DB_NAME}" -c "\copy (SELECT n.nspname as schemaname, c.relname as tablename, p.polname as policyname, p.polcmd as cmd, pg_get_expr(p.polqual, p.polrelid) as using_expression, pg_get_expr(p.polwithcheck, p.polrelid) as with_check_expression, p.polroles as roles FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid JOIN pg_namespace n ON c.relnamespace = n.oid WHERE n.nspname NOT IN ('pg_catalog','information_schema') ORDER BY n.nspname, c.relname, p.polname) TO STDOUT WITH CSV HEADER" > "$OUT_DIR/rls_policies.csv"


# Storage lists
psql "postgresql://$DB_USER@${DB_HOST}:${DB_PORT}/${DB_NAME}" -c "\copy (SELECT * FROM storage.buckets ORDER BY id) TO STDOUT WITH CSV HEADER" > "$OUT_DIR/storage_buckets.csv"
psql "postgresql://$DB_USER@${DB_HOST}:${DB_PORT}/${DB_NAME}" -c "\copy (SELECT bucket_id, name, id, updated_at FROM storage.objects ORDER BY bucket_id, name LIMIT 10000) TO STDOUT WITH CSV HEADER" > "$OUT_DIR/storage_objects.csv"


echo "Exports written to $OUT_DIR"