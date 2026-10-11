import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Archive, CalendarDays, CircleAlert, FileText, FolderKanban, LoaderCircle, Megaphone, Plus, RefreshCw, Send, X } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getSupabaseClient, isSupabaseConfigured } from "@/integrations/supabase/client";

type FieldType = "text" | "url" | "number" | "textarea" | "select" | "datetime-local";
type FieldDef = { key: string; label: string; type: FieldType; required?: boolean; maxLength?: number; options?: { value: string; label: string }[]; placeholder?: string };
type ModuleConfig = {
  table: string; title: string; eyebrow: string; description: string; icon: typeof FolderKanban;
  createRoles: string[]; archiveRoles: string[]; archiveField: string; archiveValue: string;
  reviewable: boolean; fields: FieldDef[];
};
type Workspace = { id: string; name: string; role: string };
type RowRecord = Record<string, unknown>;

const options = (items: string[]) => items.map((value) => ({ value, label: value.replaceAll("_", " ") }));
const managerRoles = ["owner", "tenant_admin", "branch_manager", "platform_admin", "super_admin"];

const configs: Record<string, ModuleConfig> = {
  projects: {
    table: "projects", title: "Developer & construction projects", eyebrow: "DEVELOPMENT WORKSPACE",
    description: "Manage project profiles and construction/development information. Approval claims must be supported by current evidence.",
    icon: FolderKanban, createRoles: [...managerRoles, "developer_manager", "builder_manager"],
    archiveRoles: managerRoles, archiveField: "publication_status", archiveValue: "archived", reviewable: true,
    fields: [
      { key: "title", label: "Project name", type: "text", required: true, maxLength: 220 },
      { key: "project_type", label: "Project type", type: "select", required: true, options: options(["residential","commercial","mixed_use","industrial","infrastructure","other"]) },
      { key: "summary", label: "Short summary", type: "textarea", maxLength: 1200 },
      { key: "description", label: "Project description", type: "textarea", maxLength: 12000 },
      { key: "city", label: "City", type: "text", required: true, maxLength: 100 },
      { key: "locality", label: "Area / society / sector", type: "text", maxLength: 160 },
    ],
  },
  events: {
    table: "events", title: "Events & site visits", eyebrow: "EVENT MANAGEMENT",
    description: "Create open houses, launches, expos, investor sessions and site visits. Registration details remain private to authorised organisers.",
    icon: CalendarDays, createRoles: [...managerRoles, "marketer", "listing_editor"],
    archiveRoles: managerRoles, archiveField: "publication_status", archiveValue: "cancelled", reviewable: true,
    fields: [
      { key: "title", label: "Event title", type: "text", required: true, maxLength: 220 },
      { key: "event_type", label: "Event type", type: "select", required: true, options: options(["open_house","launch","expo","site_visit","investor_meeting","webinar","construction_showcase","other"]) },
      { key: "description", label: "Description", type: "textarea", maxLength: 12000 },
      { key: "starts_at", label: "Start date & time", type: "datetime-local", required: true },
      { key: "ends_at", label: "End date & time", type: "datetime-local", required: true },
      { key: "timezone", label: "Timezone", type: "text", required: true, maxLength: 80, placeholder: "Asia/Karachi" },
      { key: "venue", label: "Venue / location", type: "text", maxLength: 300 },
      { key: "capacity", label: "Registration capacity", type: "number" },
      { key: "cover_image_url", label: "Cover image URL", type: "url", maxLength: 2000 },
    ],
  },
  ads: {
    table: "ad_campaigns", title: "Advertising campaigns", eyebrow: "ADVERTISING & PROMOTIONS",
    description: "Create sponsored placements and promotions. Campaigns stay inactive until approved. Paid placement must be labelled as sponsored.",
    icon: Megaphone, createRoles: managerRoles, archiveRoles: managerRoles,
    archiveField: "status", archiveValue: "paused", reviewable: false,
    fields: [
      { key: "name", label: "Campaign name", type: "text", required: true, maxLength: 180 },
      { key: "product_type", label: "Placement type", type: "select", required: true, options: options(["featured_property","promoted_project","promoted_business","sponsored_search","homepage_placement","area_placement","sponsored_content","event_promotion"]) },
      { key: "destination_url", label: "Destination URL", type: "url", maxLength: 2000 },
      { key: "budget", label: "Budget (PKR)", type: "number" },
      { key: "starts_at", label: "Campaign start", type: "datetime-local" },
      { key: "ends_at", label: "Campaign end", type: "datetime-local" },
      { key: "creative_title", label: "Ad title", type: "text", maxLength: 180 },
      { key: "creative_description", label: "Ad description", type: "textarea", maxLength: 1000 },
      { key: "creative_image_url", label: "Image URL", type: "url", maxLength: 2000 },
      { key: "creative_alt_text", label: "Image alt text", type: "text", maxLength: 300 },
    ],
  },
  content: {
    table: "content_pages", title: "SEO & editorial publishing", eyebrow: "CONTENT STUDIO",
    description: "Prepare area guides, articles, FAQs and landing pages. Drafts remain private until reviewed and published.",
    icon: FileText, createRoles: [...managerRoles, "marketer", "listing_editor"],
    archiveRoles: managerRoles, archiveField: "publication_status", archiveValue: "archived", reviewable: true,
    fields: [
      { key: "title", label: "Page / article title", type: "text", required: true, maxLength: 220 },
      { key: "content_type", label: "Content type", type: "select", required: true, options: options(["page","article","area_guide","faq","project_page","developer_page"]) },
      { key: "excerpt", label: "Short summary", type: "textarea", maxLength: 1200 },
      { key: "body", label: "Content", type: "textarea", maxLength: 30000, required: true },
      { key: "meta_title", label: "SEO title", type: "text", maxLength: 70 },
      { key: "meta_description", label: "SEO description", type: "textarea", maxLength: 170 },
      { key: "canonical_url", label: "Canonical URL (optional)", type: "url", maxLength: 2000 },
      { key: "social_image_url", label: "Social share image URL", type: "url", maxLength: 2000 },
      { key: "robots_directive", label: "Search engine visibility", type: "select", required: true, options: [{ value: "index,follow", label: "Index and follow links" }, { value: "noindex,follow", label: "Do not index, follow links" }, { value: "noindex,nofollow", label: "Do not index or follow links" }] },
    ],
  },
};

const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100);
const toLocalDateTime = (value: unknown) => {
  if (typeof value !== "string" || !value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const BusinessOpsAdmin = () => {
  const { module } = useParams<{ module: string }>();
  const config = module ? configs[module] : undefined;
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceId, setWorkspaceId] = useState("");
  const [rows, setRows] = useState<RowRecord[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const activeWorkspace = workspaces.find((workspace) => workspace.id === workspaceId) ?? workspaces[0];
  const canCreate = Boolean(config && activeWorkspace && config.createRoles.includes(activeWorkspace.role));
  const canArchive = Boolean(config && activeWorkspace && config.archiveRoles.includes(activeWorkspace.role));

  const load = useCallback(async () => {
    if (!config) {
      setError("This workspace module does not exist.");
      setLoading(false);
      return;
    }
    if (!isSupabaseConfigured) {
      setError("Connect the approved Khatir Supabase project before using this module. No demo records are shown.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const client = getSupabaseClient() as unknown as SupabaseClient;
      const { data: authData, error: authError } = await client.auth.getUser();
      if (authError || !authData.user) {
        navigate("/login?next=/dashboard/" + module, { replace: true });
        return;
      }
      const { data: profile, error: profileError } = await client.from("user_profiles").select("platform_role").eq("id", authData.user.id).maybeSingle();
      if (profileError) throw new Error("The Khatir database is not ready. Apply the reviewed migration to the approved project.");

      let workspaceList: Workspace[] = [];
      if (profile?.platform_role === "platform_admin" || profile?.platform_role === "super_admin") {
        const { data, error: tenantError } = await client.from("tenants").select("id,name");
        if (tenantError) throw new Error("Could not load business workspaces.");
        workspaceList = (data ?? []).map((row) => ({ id: row.id, name: row.name, role: profile.platform_role }));
      } else {
        const { data: memberships, error: membershipError } = await client.from("tenant_memberships").select("tenant_id,role,status").eq("user_id", authData.user.id).eq("status", "active");
        if (membershipError) throw new Error("Business memberships are not available.");
        const ids = (memberships ?? []).map((membership) => membership.tenant_id);
        if (ids.length) {
          const { data, error: tenantError } = await client.from("tenants").select("id,name").in("id", ids);
          if (tenantError) throw new Error("Could not load your business workspaces.");
          workspaceList = (data ?? []).map((row) => ({ id: row.id, name: row.name, role: memberships?.find((membership) => membership.tenant_id === row.id)?.role ?? "user" }));
        }
      }
      setWorkspaces(workspaceList);
      const chosen = workspaceList.find((workspace) => workspace.id === workspaceId) ?? workspaceList[0];
      setWorkspaceId(chosen?.id ?? "");
      if (!chosen) {
        setRows([]);
        return;
      }
      const { data, error: rowsError } = await client.from(config.table).select("*").eq("tenant_id", chosen.id).order("updated_at", { ascending: false });
      if (rowsError) throw new Error("This module could not load its records. Check the database migration and your role permissions.");
      setRows((data ?? []) as RowRecord[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load this module.");
    } finally {
      setLoading(false);
    }
  }, [config, module, navigate, workspaceId]);

  useEffect(() => { void load(); }, [load]);

  const startCreate = () => {
    if (!config) return;
    const initial: Record<string, string> = {};
    config.fields.forEach((field) => {
      initial[field.key] = field.key === "timezone" ? "Asia/Karachi" : field.key === "city" ? "Peshawar" : field.type === "select" ? field.options?.[0]?.value ?? "" : "";
    });
    setForm(initial);
    setEditingId("");
    setShowForm(true);
    setError("");
    setNotice("");
  };

  const startEdit = (row: RowRecord) => {
    if (!config) return;
    const initial: Record<string, string> = {};
    const creative = (row.creative && typeof row.creative === "object" ? row.creative : {}) as Record<string, unknown>;
    config.fields.forEach((field) => {
      const value = field.key.startsWith("creative_") ? creative[field.key.replace("creative_", "")] : row[field.key];
      initial[field.key] = field.type === "datetime-local" ? toLocalDateTime(value) : value === null || value === undefined ? "" : String(value);
    });
    setForm(initial);
    setEditingId(String(row.id ?? ""));
    setShowForm(true);
    setError("");
    setNotice("");
  };

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!config || !activeWorkspace || !canCreate) {
      setError("Your role cannot manage this module in the selected workspace.");
      return;
    }
    setError("");
    setNotice("");
    for (const field of config.fields) {
      if (field.required && !form[field.key]?.trim()) {
        setError(field.label + " is required.");
        return;
      }
    }
    if ((module === "events" || module === "ads") && form.starts_at && form.ends_at && new Date(form.ends_at) <= new Date(form.starts_at)) {
      setError("The end time must be after the start time.");
      return;
    }

    setSaving(true);
    try {
      const client = getSupabaseClient() as unknown as SupabaseClient;
      const { data: authData, error: authError } = await client.auth.getUser();
      if (authError || !authData.user) throw new Error("Your session has expired. Please sign in again.");
      const payload: Record<string, unknown> = {};
      const creative: Record<string, unknown> = {};
      config.fields.forEach((field) => {
        const raw = form[field.key]?.trim() ?? "";
        if (field.key.startsWith("creative_")) {
          creative[field.key.replace("creative_", "")] = raw || null;
        } else if (field.type === "number") {
          payload[field.key] = raw ? Number(raw) : null;
        } else if (field.type === "datetime-local") {
          payload[field.key] = raw ? new Date(raw).toISOString() : null;
        } else {
          payload[field.key] = raw || null;
        }
      });
      if (module === "ads") payload.creative = creative;
      const titleValue = String(payload.title ?? payload.name ?? "");
      if (payload.title !== undefined) payload.slug = slugify(titleValue);
      if (!editingId) {
        payload.tenant_id = activeWorkspace.id;
        payload.created_by = authData.user.id;
        if (module === "projects") {
          payload.approval_status = "not_verified";
          payload.publication_status = "draft";
        } else if (module === "events") {
          payload.publication_status = "draft";
          payload.timezone = payload.timezone || "Asia/Karachi";
        } else if (module === "ads") {
          payload.currency = "PKR";
          payload.moderation_status = "pending_review";
          payload.status = "draft";
        } else if (module === "content") {
          payload.publication_status = "draft";
          payload.robots_directive = payload.robots_directive || "index,follow";
        }
      }
      if (editingId) {
        const { error: updateError } = await client.from(config.table).update(payload).eq("id", editingId).eq("tenant_id", activeWorkspace.id);
        if (updateError) throw updateError;
        setNotice("Changes saved.");
      } else {
        const { error: insertError } = await client.from(config.table).insert(payload);
        if (insertError) throw insertError;
        setNotice("Draft saved. Complete review and approval before public publishing.");
      }
      setShowForm(false);
      setEditingId("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save changes.");
    } finally {
      setSaving(false);
    }
  };

  const updateWorkflow = async (row: RowRecord, value: string) => {
    if (!config || !activeWorkspace) return;
    setError("");
    setNotice("");
    try {
      const client = getSupabaseClient() as unknown as SupabaseClient;
      const { error: updateError } = await client.from(config.table).update({ [config.archiveField]: value }).eq("id", String(row.id)).eq("tenant_id", activeWorkspace.id);
      if (updateError) throw updateError;
      setNotice(value === "pending_review" ? "Submitted for platform review. It is not public yet." : "Status updated.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the status.");
    }
  };

  const sortedRows = useMemo(() => rows, [rows]);
  if (loading) return <main className="flex min-h-screen items-center justify-center gap-3 bg-background text-muted-foreground"><LoaderCircle className="h-5 w-5 animate-spin" /> Loading workspace module…</main>;
  if (!config) return <main className="p-10"><h1 className="text-2xl">Module not found</h1><Link to="/dashboard">Return to workspace</Link></main>;
  const Icon = config.icon;

  return (
    <main className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-background"><div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8"><Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" /> Workspace dashboard</Link><Button variant="outline" size="sm" onClick={() => void load()}><RefreshCw className="h-4 w-4" /> Refresh</Button></div></header>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">{config.eyebrow}</p><h1 className="mt-2 flex items-center gap-3 text-3xl font-light text-primary sm:text-4xl"><Icon className="h-7 w-7 text-gold" />{config.title}</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{config.description}</p></div>
          <div className="flex flex-col gap-3 sm:flex-row">{workspaces.length > 1 && <select aria-label="Business workspace" value={activeWorkspace?.id ?? ""} onChange={(event) => setWorkspaceId(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">{workspaces.map((workspace) => <option key={workspace.id} value={workspace.id}>{workspace.name}</option>)}</select>}<Button onClick={startCreate} disabled={!canCreate}><Plus className="h-4 w-4" /> Create new</Button></div>
        </div>
        {error && <div role="alert" className="mb-5 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"><CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />{error}</div>}
        {notice && <div role="status" className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm">{notice}</div>}
        {!isSupabaseConfigured && <Card className="mb-6 border-amber-300 bg-amber-50 text-amber-950"><CardHeader><CardTitle>Database connection required</CardTitle><CardDescription className="text-amber-900">This module will not create fake records. Connect the approved Khatir database and apply the reviewed migration first.</CardDescription></CardHeader></Card>}

        {showForm && <Card className="mb-7 bg-background"><CardHeader className="flex flex-row items-start justify-between gap-4"><div><CardTitle>{editingId ? "Edit draft" : "Create draft"}</CardTitle><CardDescription>Saving does not publish content or bypass platform review.</CardDescription></div><Button variant="ghost" size="icon" onClick={() => setShowForm(false)} aria-label="Close form"><X className="h-4 w-4" /></Button></CardHeader><CardContent><form onSubmit={submitForm} className="grid gap-5 md:grid-cols-2">{config.fields.map((field) => <div key={field.key} className={"space-y-2 " + (field.type === "textarea" ? "md:col-span-2" : "")}><Label htmlFor={field.key}>{field.label}{field.required ? " *" : ""}</Label>{field.type === "select" ? <select id={field.key} required={field.required} value={form[field.key] ?? ""} onChange={(event) => setForm({ ...form, [field.key]: event.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">{(field.options ?? []).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : field.type === "textarea" ? <Textarea id={field.key} required={field.required} maxLength={field.maxLength} rows={field.key === "body" || field.key === "description" ? 6 : 3} value={form[field.key] ?? ""} onChange={(event) => setForm({ ...form, [field.key]: event.target.value })} placeholder={field.placeholder} /> : <Input id={field.key} type={field.type} required={field.required} maxLength={field.maxLength} min={field.type === "number" ? 0 : undefined} step={field.type === "number" ? "any" : undefined} value={form[field.key] ?? ""} onChange={(event) => setForm({ ...form, [field.key]: event.target.value })} placeholder={field.placeholder} />}</div>)}<div className="flex flex-wrap gap-3 md:col-span-2"><Button type="submit" disabled={saving || !canCreate}>{saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}{editingId ? "Save changes" : "Save draft"}</Button><Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div></form></CardContent></Card>}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{sortedRows.length === 0 ? <Card className="bg-background md:col-span-2 xl:col-span-3"><CardContent className="py-16 text-center"><Icon className="mx-auto h-8 w-8 text-muted-foreground" /><h2 className="mt-4 text-lg font-medium">Nothing here yet</h2><p className="mt-2 text-sm text-muted-foreground">Create the first draft when your workspace is ready.</p><Button className="mt-5" onClick={startCreate} disabled={!canCreate}><Plus className="h-4 w-4" /> Create new</Button></CardContent></Card> : sortedRows.map((row) => {
          const title = String(row.title ?? row.name ?? "Untitled");
          const status = String(row.publication_status ?? row.status ?? row.moderation_status ?? "draft");
          const subtitle = String(row.city ?? row.venue ?? row.product_type ?? row.content_type ?? row.event_type ?? row.project_type ?? "");
          const rowId = String(row.id ?? "");
          return <Card key={rowId} className="bg-background"><CardHeader className="pb-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><CardTitle className="line-clamp-2 text-base">{title}</CardTitle><CardDescription className="mt-1 capitalize">{subtitle.replaceAll("_"," ")}</CardDescription></div><span className="shrink-0 rounded-full border border-border px-2.5 py-1 text-xs capitalize">{status.replaceAll("_"," ")}</span></div></CardHeader><CardContent><p className="line-clamp-3 min-h-12 text-sm leading-6 text-muted-foreground">{String(row.summary ?? row.excerpt ?? row.description ?? "")}</p><div className="mt-4 flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => startEdit(row)} disabled={!canCreate}>Edit</Button>{config.reviewable && status === "draft" && <Button variant="secondary" size="sm" onClick={() => void updateWorkflow(row,"pending_review")} disabled={!canCreate}><Send className="h-4 w-4" /> Submit for review</Button>}{status !== config.archiveValue && <Button variant="ghost" size="sm" onClick={() => void updateWorkflow(row,config.archiveValue)} disabled={!canArchive}><Archive className="h-4 w-4" /> {config.archiveValue === "cancelled" ? "Cancel" : config.archiveValue === "paused" ? "Pause" : "Archive"}</Button>}</div><p className="mt-4 text-xs text-muted-foreground">Updated {row.updated_at ? new Date(String(row.updated_at)).toLocaleDateString() : row.created_at ? new Date(String(row.created_at)).toLocaleDateString() : "—"}</p></CardContent></Card>;
        })}</div>
      </div>
    </main>
  );
};

export default BusinessOpsAdmin;
