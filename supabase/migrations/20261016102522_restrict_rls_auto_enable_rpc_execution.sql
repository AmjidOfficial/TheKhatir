-- Reconcile the already-applied Supabase migration version 20261016102522.
-- The function is project-managed and may not exist in every local environment.
-- Keep this migration idempotent for clean local setup and future environments.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated';
  end if;
end
$$;
