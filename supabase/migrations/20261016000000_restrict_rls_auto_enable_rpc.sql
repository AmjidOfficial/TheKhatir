-- Restrict the platform's automatic RLS event-trigger function from being called as an RPC.
-- This function is managed by the Supabase project and may not exist in every environment.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke all on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end
$$;
