-- Let authors manage their own content while keeping tenant managers in control.
-- Hard deletes are supported for the author's own records; audit triggers retain the action.
-- Public content still requires the existing verification/moderation workflow.

drop policy if exists "properties_update_authorised" on public.properties;
create policy "properties_update_authorised" on public.properties
for update to authenticated
using (
  public.can_manage_tenant(tenant_id)
  or (created_by = auth.uid() and public.is_tenant_member(tenant_id))
)
with check (
  public.can_manage_tenant(tenant_id)
  or (created_by = auth.uid() and public.is_tenant_member(tenant_id))
);

drop policy if exists "properties_delete_manager" on public.properties;
create policy "properties_delete_manager" on public.properties
for delete to authenticated
using (
  public.can_manage_tenant(tenant_id)
  or (created_by = auth.uid() and public.is_tenant_member(tenant_id))
);

drop policy if exists "projects_update_authorised" on public.projects;
create policy "projects_update_authorised" on public.projects
for update to authenticated
using (
  public.can_manage_tenant(tenant_id)
  or (created_by = auth.uid() and public.is_tenant_member(tenant_id))
)
with check (
  public.can_manage_tenant(tenant_id)
  or (created_by = auth.uid() and public.is_tenant_member(tenant_id))
);

drop policy if exists "projects_delete_manager" on public.projects;
create policy "projects_delete_manager" on public.projects
for delete to authenticated
using (
  public.can_manage_tenant(tenant_id)
  or (created_by = auth.uid() and public.is_tenant_member(tenant_id))
);

drop policy if exists "events_update_editor" on public.events;
create policy "events_update_editor" on public.events
for update to authenticated
using (
  public.can_manage_tenant(tenant_id)
  or (created_by = auth.uid() and public.is_tenant_member(tenant_id))
  or public.is_platform_admin()
)
with check (
  public.can_manage_tenant(tenant_id)
  or (created_by = auth.uid() and public.is_tenant_member(tenant_id))
  or public.is_platform_admin()
);

drop policy if exists "events_delete_manager" on public.events;
create policy "events_delete_manager" on public.events
for delete to authenticated
using (
  public.can_manage_tenant(tenant_id)
  or (created_by = auth.uid() and public.is_tenant_member(tenant_id))
  or public.is_platform_admin()
);

drop policy if exists "content_update_editor" on public.content_pages;
create policy "content_update_editor" on public.content_pages
for update to authenticated
using (
  (tenant_id is not null and (
    public.can_manage_tenant(tenant_id)
    or (created_by = auth.uid() and public.is_tenant_member(tenant_id))
  ))
  or public.is_platform_admin()
)
with check (
  (tenant_id is not null and (
    public.can_manage_tenant(tenant_id)
    or (created_by = auth.uid() and public.is_tenant_member(tenant_id))
  ))
  or public.is_platform_admin()
);

drop policy if exists "content_delete_manager" on public.content_pages;
create policy "content_delete_manager" on public.content_pages
for delete to authenticated
using (
  (tenant_id is not null and (
    public.can_manage_tenant(tenant_id)
    or (created_by = auth.uid() and public.is_tenant_member(tenant_id))
  ))
  or public.is_platform_admin()
);
