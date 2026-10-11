import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, BadgeCheck, Building2, CalendarDays, CircleAlert, FileText, FolderKanban, LoaderCircle, Megaphone, RefreshCw, ShieldCheck, XCircle } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getSupabaseClient, isSupabaseConfigured } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";

type QueueRow = Record<string, unknown> & { id: string; tenant_id?: string | null };
type TenantRow = { id: string; name: string; slug: string; status: string; is_public: boolean; business_type: string; city: string };
type QueueKey = "tenants" | "properties" | "projects" | "events" | "ads" | "content";

const queueMeta: Record<QueueKey, { title: string; table: string; icon: typeof Building2; description: string }> = {
  tenants: { title: "Business verification", table: "tenants", icon: Building2, description: "Activate and publish business workspaces after checks." },
  properties: { title: "Property verification", table: "properties", icon: Building2, description: "Verify ownership and listing details before public publishing." },
  projects: { title: "Developer projects", table: "projects", icon: FolderKanban, description: "Record an approval reference before publishing a verified project." },
  events: { title: "Events", table: "events", icon: CalendarDays, description: "Review event details before they appear publicly." },
  ads: { title: "Advertising", table: "ad_campaigns", icon: Megaphone, description: "Review paid placements before a business can activate a campaign." },
  content: { title: "SEO content", table: "content_pages", icon: FileText, description: "Review editorial pages before publishing and indexing." },
};

const PlatformAdmin = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<QueueKey>("tenants");
  const [userId, setUserId] = useState("");
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [queues, setQueues] = useState<Record<QueueKey, QueueRow[]>>({
    tenants: [], properties: [], projects: [], events: [], ads: [], content: [],
  });
  const [approvalRefs, setApprovalRefs] = useState<Record<string, string>>({});
  const [rejectionNotes, setRejectionNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setError("Connect the approved Khatir Supabase project before platform moderation can run.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const client = getSupabaseClient() as unknown as SupabaseClient;
      const { data: authData, error: authError } = await client.auth.getUser();
      if (authError || !authData.user) {
        navigate("/login?next=/dashboard/admin", { replace: true });
        return;
      }
      setUserId(authData.user.id);
      const { data: profile, error: profileError } = await client.from("user_profiles")
        .select("platform_role").eq("id", authData.user.id).maybeSingle();
      if (profileError) throw new Error("The Khatir database migration is not ready.");
      if (!profile || !["platform_admin", "super_admin"].includes(profile.platform_role)) {
        setError("Platform administrator access is required. This attempt has not been granted elevated access.");
        setLoading(false);
        return;
      }

      const [tenantResult, propertyResult, projectResult, eventResult, adResult, contentResult] = await Promise.all([
        client.from("tenants").select("id,name,slug,status,is_public,business_type,city").order("created_at", { ascending: false }),
        client.from("properties").select("*").eq("publication_status", "pending_review").order("updated_at", { ascending: false }),
        client.from("projects").select("*").eq("publication_status", "pending_review").order("updated_at", { ascending: false }),
        client.from("events").select("*").eq("publication_status", "pending_review").order("updated_at", { ascending: false }),
        client.from("ad_campaigns").select("*").eq("moderation_status", "pending_review").order("updated_at", { ascending: false }),
        client.from("content_pages").select("*").eq("publication_status", "pending_review").order("updated_at", { ascending: false }),
      ]);
      const results = [tenantResult, propertyResult, projectResult, eventResult, adResult, contentResult];
      const failed = results.find((result) => result.error);
      if (failed?.error) throw new Error("The moderation queue could not be loaded. Check the schema and platform-admin policies.");

      const tenantRows = (tenantResult.data ?? []) as TenantRow[];
      const propertyRows = (propertyResult.data ?? []) as QueueRow[];
      const projectRows = (projectResult.data ?? []) as QueueRow[];
      const eventRows = (eventResult.data ?? []) as QueueRow[];
      const adRows = (adResult.data ?? []) as QueueRow[];
      const contentRows = (contentResult.data ?? []) as QueueRow[];

      setTenants(tenantRows);
      setQueues({
        tenants: tenantRows.filter((tenant) => tenant.status === "pending") as unknown as QueueRow[],
        properties: propertyRows,
        projects: projectRows,
        events: eventRows,
        ads: adRows,
        content: contentRows,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load platform moderation.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { void load(); }, [load]);

  const tenantFor = (row: QueueRow) => tenants.find((tenant) => tenant.id === row.tenant_id);
  const canPublishForTenant = (row: QueueRow) => {
    const tenant = tenantFor(row);
    return Boolean(tenant && tenant.status === "active" && tenant.is_public);
  };

  const runAction = async (row: QueueRow, action: "approve" | "reject") => {
    setError("");
    setNotice("");
    setWorkingId(row.id);
    try {
      const client = getSupabaseClient() as unknown as SupabaseClient;
      const now = new Date().toISOString();
      let payload: Record<string, unknown> = {};
      const table = queueMeta[tab].table;
      const reason = rejectionNotes[row.id]?.trim() || "Not approved by platform review.";

      if (tab === "tenants") {
        payload = action === "approve" ? { status: "active", is_public: true } : { status: "suspended", is_public: false };
      } else if (tab === "properties") {
        payload = action === "approve"
          ? { verification_status: "verified", verified_by: userId, verified_at: now, availability_confirmed_at: now, publication_status: "published", published_at: now, expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() }
          : { verification_status: "rejected", verification_note: reason, publication_status: "rejected" };
        if (action === "approve" && !canPublishForTenant(row)) throw new Error("Activate and publish the business workspace before publishing this listing.");
      } else if (tab === "projects") {
        const reference = approvalRefs[row.id]?.trim();
        if (action === "approve" && !reference) throw new Error("Enter the approval reference from the relevant authority before approving this project.");
        payload = action === "approve"
          ? { approval_status: "verified", approval_reference: reference, approval_checked_at: now, publication_status: "published", published_at: now }
          : { approval_status: "rejected", publication_status: "archived" };
        if (action === "approve" && !canPublishForTenant(row)) throw new Error("Activate and publish the business workspace before publishing this project.");
      } else if (tab === "events") {
        payload = { publication_status: action === "approve" ? "published" : "archived" };
        if (action === "approve" && !canPublishForTenant(row)) throw new Error("Activate and publish the business workspace before publishing this event.");
      } else if (tab === "ads") {
        payload = action === "approve"
          ? { moderation_status: "approved", approved_by: userId, approved_at: now }
          : { moderation_status: "rejected", status: "paused" };
      } else {
        payload = action === "approve"
          ? { publication_status: "published", published_at: now, reviewed_by: userId }
          : { publication_status: "archived" };
        if (action === "approve" && row.tenant_id && !canPublishForTenant(row)) throw new Error("Activate and publish the business workspace before publishing this page.");
      }

      const { error: updateError } = await client.from(table).update(payload).eq("id", row.id);
      if (updateError) throw updateError;
      setNotice(action === "approve" ? "Review approved. The record's workflow status has been updated." : "Record rejected or taken out of public publishing.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the moderation status.");
    } finally {
      setWorkingId("");
    }
  };

  if (loading) return <main className="flex min-h-screen items-center justify-center gap-3 bg-background text-muted-foreground"><SEO title="Platform administration | Khatir" description="Private Khatir platform moderation." path="/dashboard/admin" robots="noindex,nofollow" /><LoaderCircle className="h-5 w-5 animate-spin" /> Loading moderation queues…</main>;

  const meta = queueMeta[tab];
  const Icon = meta.icon;

  return (
    <main className="min-h-screen bg-muted/30">
      <SEO title="Platform administration | Khatir" description="Private Khatir platform moderation." path="/dashboard/admin" robots="noindex,nofollow" />
      <header className="border-b border-border bg-background"><div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8"><Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" /> Workspace dashboard</Link><Button variant="outline" size="sm" onClick={() => void load()}><RefreshCw className="h-4 w-4" /> Refresh</Button></div></header>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">PLATFORM OPERATIONS</p><h1 className="mt-2 text-3xl font-light text-primary sm:text-4xl">Moderation centre</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Review businesses, listings, projects, events, campaigns and SEO content. Actions are recorded in the audit log; approval does not replace independent legal or ownership checks.</p></div><div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-xs"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Platform admin</div></div>

        {error && <div role="alert" className="mb-5 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"><CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />{error}</div>}
        {notice && <div role="status" className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm">{notice}</div>}

        <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {(Object.keys(queueMeta) as QueueKey[]).map((key) => {
            const QueueIcon = queueMeta[key].icon;
            return <button key={key} type="button" onClick={() => setTab(key)} className={"rounded-xl border p-3 text-left transition-colors " + (tab === key ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-muted")}><QueueIcon className="h-5 w-5 text-gold" /><p className="mt-2 text-xs font-medium">{queueMeta[key].title}</p><p className="mt-1 text-2xl font-light tabular-nums">{queues[key].length}</p></button>;
          })}
        </div>

        <Card className="bg-background">
          <CardHeader><CardTitle className="flex items-center gap-2"><Icon className="h-5 w-5 text-gold" />{meta.title}</CardTitle><CardDescription>{meta.description}</CardDescription></CardHeader>
          <CardContent>
            {queues[tab].length === 0 ? <div className="rounded-xl border border-dashed border-border px-5 py-12 text-center"><BadgeCheck className="mx-auto h-8 w-8 text-emerald-600" /><h2 className="mt-4 text-lg font-medium">Queue is clear</h2><p className="mt-2 text-sm text-muted-foreground">There are no records waiting for review in this section.</p></div> : (
              <div className="space-y-4">{queues[tab].map((row) => {
                const tenant = tab === "tenants" ? row as unknown as TenantRow : tenantFor(row);
                const title = String(row.name ?? row.title ?? "Untitled");
                const detail = String(row.description ?? row.summary ?? row.excerpt ?? row.message ?? "");
                const status = String(row.status ?? row.publication_status ?? row.verification_status ?? row.moderation_status ?? "pending");
                const rowBusy = workingId === row.id;
                return <article key={row.id} className="rounded-xl border border-border p-4 sm:p-5">
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2"><span className="rounded-full border border-border px-2.5 py-1 text-xs capitalize">{status.replaceAll("_"," ")}</span>{tenant && <span className="text-xs text-muted-foreground">{tenant.name} · {tenant.city}</span>}</div>
                      <h3 className="mt-3 text-lg font-medium text-primary">{title}</h3>
                      {tab === "projects" && <p className="mt-1 text-sm text-muted-foreground">Approval reference: {String(row.approval_reference ?? "Not recorded")}</p>}
                      {tab === "properties" && <p className="mt-1 text-sm text-muted-foreground">{String(row.reference_code ?? "")} · {String(row.city ?? "")} · {String(row.price ?? "Price not set")}</p>}
                      {tab === "ads" && <p className="mt-1 text-sm text-muted-foreground">{String(row.product_type ?? "")} · {String(row.destination_url ?? "No destination set")}</p>}
                      {detail && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{detail}</p>}
                      {tab === "tenants" && <p className="mt-2 text-sm text-muted-foreground">{String(row.business_type ?? "").replaceAll("_"," ")} · {String(row.slug ?? "")}</p>}
                    </div>
                    <div className="flex w-full flex-col gap-2 lg:w-72">
                      {tab === "projects" && <div className="space-y-1"><Label htmlFor={"approval-" + row.id} className="text-xs">Authority approval reference</Label><Input id={"approval-" + row.id} value={approvalRefs[row.id] ?? ""} onChange={(event) => setApprovalRefs({ ...approvalRefs, [row.id]: event.target.value })} placeholder="Enter verified reference" /></div>}
                      {(tab === "properties" || tab === "projects" || tab === "events" || tab === "content") && <div className="space-y-1"><Label htmlFor={"reason-" + row.id} className="text-xs">Rejection note (optional)</Label><Textarea id={"reason-" + row.id} value={rejectionNotes[row.id] ?? ""} onChange={(event) => setRejectionNotes({ ...rejectionNotes, [row.id]: event.target.value })} rows={2} maxLength={1000} placeholder="Why is this being rejected?" /></div>}
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" onClick={() => void runAction(row, "approve")} disabled={rowBusy || (tab === "projects" && !approvalRefs[row.id]?.trim()) || ((["properties","projects","events"].includes(tab) || (tab === "content" && Boolean(row.tenant_id))) && !canPublishForTenant(row))}><BadgeCheck className="h-4 w-4" />{tab === "tenants" ? "Activate & publish" : tab === "properties" ? "Verify & publish" : tab === "projects" ? "Verify & publish" : tab === "events" ? "Publish event" : tab === "ads" ? "Approve ad" : "Publish content"}</Button>
                        <Button size="sm" variant="outline" onClick={() => void runAction(row, "reject")} disabled={rowBusy}><XCircle className="h-4 w-4" />{tab === "tenants" ? "Suspend" : "Reject / archive"}</Button>
                      </div>
                    </div>
                  </div>
                </article>;
              })}</div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default PlatformAdmin;
