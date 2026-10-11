import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CircleAlert, LoaderCircle, MessageSquareText, Plus, RefreshCw, Search, Send, X } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getSupabaseClient, isSupabaseConfigured } from "@/integrations/supabase/client";

type Workspace = { id: string; name: string; role: string };
type Lead = {
  id: string;
  tenant_id: string;
  property_id: string | null;
  assigned_to: string | null;
  created_by: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  preferred_contact: string;
  source: string;
  status: string;
  priority: string;
  message: string;
  next_follow_up_at: string | null;
  last_contacted_at: string | null;
  created_at: string;
};
type LeadActivity = { id: string; lead_id: string; activity_type: string; body: string; occurred_at: string };
type PropertyOption = { id: string; title: string; reference_code: string };

const statuses = ["new", "contacted", "qualified", "visit_planned", "visited", "negotiation", "won", "lost", "unreachable"];
const statusLabels: Record<string, string> = {
  new: "New", contacted: "Contacted", qualified: "Qualified", visit_planned: "Visit planned",
  visited: "Visited", negotiation: "Negotiation", won: "Won", lost: "Lost", unreachable: "Unreachable",
};

const LeadsAdmin = () => {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceId, setWorkspaceId] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState("manual");
  const [message, setMessage] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const activeWorkspace = workspaces.find((workspace) => workspace.id === workspaceId) ?? workspaces[0];
  const canManage = Boolean(activeWorkspace && ["owner", "tenant_admin", "branch_manager", "sales_manager", "platform_admin", "super_admin"].includes(activeWorkspace.role));

  const load = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setError("Connect the approved Khatir Supabase project before using the lead CRM. No sample leads are shown.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const client = getSupabaseClient() as unknown as SupabaseClient;
      const { data: authData, error: authError } = await client.auth.getUser();
      if (authError || !authData.user) {
        navigate("/login?next=/dashboard/leads", { replace: true });
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
        setLeads([]);
        setProperties([]);
        return;
      }

      const [leadResult, propertyResult] = await Promise.all([
        client.from("leads").select("id,tenant_id,property_id,assigned_to,created_by,full_name,email,phone,preferred_contact,source,status,priority,message,next_follow_up_at,last_contacted_at,created_at").eq("tenant_id", chosen.id).order("created_at", { ascending: false }),
        client.from("properties").select("id,title,reference_code").eq("tenant_id", chosen.id).order("title"),
      ]);
      if (leadResult.error) throw new Error("Lead data could not be loaded. Check your workspace role and database policies.");
      if (propertyResult.error) throw new Error("Property references could not be loaded.");
      setLeads((leadResult.data ?? []) as Lead[]);
      setProperties((propertyResult.data ?? []) as PropertyOption[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load leads.");
    } finally {
      setLoading(false);
    }
  }, [navigate, workspaceId]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (!selectedLeadId || !isSupabaseConfigured) {
      setActivities([]);
      return;
    }
    let cancelled = false;
    const loadActivities = async () => {
      try {
        const client = getSupabaseClient() as unknown as SupabaseClient;
        const { data, error: activityError } = await client.from("lead_activities")
          .select("id,lead_id,activity_type,body,occurred_at")
          .eq("lead_id", selectedLeadId)
          .order("occurred_at", { ascending: false })
          .limit(30);
        if (activityError) throw activityError;
        if (!cancelled) setActivities((data ?? []) as LeadActivity[]);
      } catch {
        if (!cancelled) setActivities([]);
      }
    };
    void loadActivities();
    return () => { cancelled = true; };
  }, [selectedLeadId, leads]);

  const filteredLeads = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchesQuery = !q || [lead.full_name, lead.email ?? "", lead.phone ?? "", lead.message].join(" ").toLowerCase().includes(q);
      return matchesQuery && (statusFilter === "all" || lead.status === statusFilter);
    });
  }, [leads, query, statusFilter]);

  const createLead = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!activeWorkspace) return;
    if (!email.trim() && !phone.trim()) {
      setError("Add an email address or phone number so your team can contact this lead.");
      return;
    }
    setSaving(true);
    try {
      const client = getSupabaseClient() as unknown as SupabaseClient;
      const { data: authData, error: authError } = await client.auth.getUser();
      if (authError || !authData.user) throw new Error("Your session has expired. Please sign in again.");
      const { error: insertError } = await client.from("leads").insert({
        tenant_id: activeWorkspace.id,
        created_by: authData.user.id,
        assigned_to: authData.user.id,
        property_id: propertyId || null,
        full_name: fullName.trim(),
        email: email.trim().toLowerCase() || null,
        phone: phone.trim() || null,
        source,
        preferred_contact: phone.trim() ? "phone" : "email",
        message: message.trim(),
        status: "new",
        priority: "normal",
      });
      if (insertError) throw insertError;
      setNotice("Lead saved and assigned to you.");
      setFullName(""); setEmail(""); setPhone(""); setMessage(""); setPropertyId(""); setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the lead.");
    } finally {
      setSaving(false);
    }
  };

  const updateLeadStatus = async (lead: Lead, nextStatus: string) => {
    setError("");
    setNotice("");
    try {
      const client = getSupabaseClient() as unknown as SupabaseClient;
      const { error: updateError } = await client.from("leads").update({
        status: nextStatus,
        last_contacted_at: nextStatus === "contacted" ? new Date().toISOString() : lead.last_contacted_at,
      }).eq("id", lead.id).eq("tenant_id", lead.tenant_id);
      if (updateError) throw updateError;
      setNotice(`Lead moved to ${statusLabels[nextStatus] ?? nextStatus}.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the lead.");
    }
  };

  const addNote = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const lead = leads.find((item) => item.id === selectedLeadId);
    if (!lead || !activeWorkspace || !note.trim()) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const client = getSupabaseClient() as unknown as SupabaseClient;
      const { data: authData, error: authError } = await client.auth.getUser();
      if (authError || !authData.user) throw new Error("Your session has expired. Please sign in again.");
      const { error: insertError } = await client.from("lead_activities").insert({
        tenant_id: activeWorkspace.id,
        lead_id: lead.id,
        actor_id: authData.user.id,
        activity_type: "note",
        body: note.trim(),
      });
      if (insertError) throw insertError;
      setNote("");
      setNotice("Note added to the lead activity timeline.");
      const { data, error: activityError } = await client.from("lead_activities")
        .select("id,lead_id,activity_type,body,occurred_at")
        .eq("lead_id", lead.id).order("occurred_at", { ascending: false }).limit(30);
      if (activityError) throw activityError;
      setActivities((data ?? []) as LeadActivity[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add the note.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <main className="flex min-h-screen items-center justify-center gap-3 bg-background text-muted-foreground"><LoaderCircle className="h-5 w-5 animate-spin" /> Loading lead pipeline…</main>;

  return (
    <main className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" /> Workspace dashboard</Link>
          <Button variant="outline" size="sm" onClick={() => void load()}><RefreshCw className="h-4 w-4" /> Refresh</Button>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">SALES CRM</p><h1 className="mt-2 text-3xl font-light text-primary sm:text-4xl">Lead management</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Track enquiries, manage the pipeline, and keep notes in one place. Agents only see leads allowed by their assigned role.</p></div>
          <div className="flex flex-col gap-3 sm:flex-row">
            {workspaces.length > 1 && <select aria-label="Business workspace" value={activeWorkspace?.id ?? ""} onChange={(event) => setWorkspaceId(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">{workspaces.map((workspace) => <option key={workspace.id} value={workspace.id}>{workspace.name}</option>)}</select>}
            <Button onClick={() => setShowForm(true)} disabled={!activeWorkspace}><Plus className="h-4 w-4" /> Add lead</Button>
          </div>
        </div>

        {error && <div role="alert" className="mb-5 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"><CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />{error}</div>}
        {notice && <div role="status" className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm">{notice}</div>}
        {!isSupabaseConfigured && <Card className="mb-6 border-amber-300 bg-amber-50 text-amber-950"><CardHeader><CardTitle>Database connection required</CardTitle><CardDescription className="text-amber-900">This CRM will not create fake leads. Connect the approved Khatir database and apply the reviewed migration first.</CardDescription></CardHeader></Card>}

        {showForm && (
          <Card className="mb-7 bg-background">
            <CardHeader className="flex flex-row items-start justify-between"><div><CardTitle>Create a lead</CardTitle><CardDescription>Record an enquiry you have permission to store.</CardDescription></div><Button variant="ghost" size="icon" onClick={() => setShowForm(false)} aria-label="Close form"><X className="h-4 w-4" /></Button></CardHeader>
            <CardContent><form onSubmit={createLead} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="lead-name">Full name</Label><Input id="lead-name" value={fullName} onChange={(e) => setFullName(e.target.value)} required minLength={2} maxLength={160} /></div>
              <div className="space-y-2"><Label htmlFor="lead-source">Lead source</Label><select id="lead-source" value={source} onChange={(e) => setSource(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">{["manual","website","phone","whatsapp","event","advertisement","referral","other"].map((item) => <option key={item} value={item}>{item.replaceAll("_"," ")}</option>)}</select></div>
              <div className="space-y-2"><Label htmlFor="lead-email">Email (optional if phone is entered)</Label><Input id="lead-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={254} /></div>
              <div className="space-y-2"><Label htmlFor="lead-phone">Phone / WhatsApp</Label><Input id="lead-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={40} /></div>
              <div className="space-y-2 md:col-span-2"><Label htmlFor="lead-property">Related property (optional)</Label><select id="lead-property" value={propertyId} onChange={(e) => setPropertyId(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">No specific property</option>{properties.map((property) => <option key={property.id} value={property.id}>{property.reference_code} · {property.title}</option>)}</select></div>
              <div className="space-y-2 md:col-span-2"><Label htmlFor="lead-message">Enquiry details / consent note</Label><Textarea id="lead-message" value={message} onChange={(e) => setMessage(e.target.value)} rows={3} maxLength={5000} placeholder="What is the customer looking for? Record only necessary details." /></div>
              <div className="flex flex-wrap gap-3 md:col-span-2"><Button type="submit" disabled={saving}>{saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}Save lead</Button><Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
            </form></CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="bg-background">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><CardTitle>{activeWorkspace?.name ?? "Lead pipeline"}</CardTitle><CardDescription>{filteredLeads.length} lead{filteredLeads.length === 1 ? "" : "s"} shown</CardDescription></div><div className="flex flex-col gap-2 sm:flex-row"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Search leads" className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, email, phone…" /></div><select aria-label="Filter lead status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="all">All statuses</option>{statuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</select></div></div>
            </CardHeader>
            <CardContent>
              {filteredLeads.length === 0 ? <div className="rounded-xl border border-dashed border-border px-5 py-12 text-center"><MessageSquareText className="mx-auto h-8 w-8 text-muted-foreground" /><h2 className="mt-4 text-lg font-medium">No leads found</h2><p className="mt-2 text-sm text-muted-foreground">Create a lead or adjust your search and filters.</p><Button className="mt-5" onClick={() => setShowForm(true)} disabled={!activeWorkspace}><Plus className="h-4 w-4" /> Add lead</Button></div> : (
                <div className="space-y-3">{filteredLeads.map((lead) => <article key={lead.id} className={`rounded-xl border p-4 transition-colors ${selectedLeadId === lead.id ? "border-primary/50 bg-primary/5" : "border-border hover:bg-muted/20"}`}>
                  <button type="button" onClick={() => setSelectedLeadId(lead.id)} className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
                    <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-medium text-primary">{lead.full_name}</h3><p className="mt-1 text-sm text-muted-foreground">{lead.phone || lead.email || "No contact detail"} · {lead.source.replaceAll("_"," ")}</p></div><span className="rounded-full border border-border px-2.5 py-1 text-xs">{statusLabels[lead.status] ?? lead.status}</span></div>
                    {lead.message && <p className="mt-3 line-clamp-2 text-sm leading-5 text-muted-foreground">{lead.message}</p>}
                    <p className="mt-3 text-xs text-muted-foreground">Added {new Date(lead.created_at).toLocaleDateString()} {lead.next_follow_up_at ? `· Follow up ${new Date(lead.next_follow_up_at).toLocaleDateString()}` : ""}</p>
                  </button>
                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                    <Label htmlFor={`status-${lead.id}`} className="text-xs">Update stage</Label>
                    <select id={`status-${lead.id}`} value={lead.status} onChange={(e) => void updateLeadStatus(lead, e.target.value)} className="h-8 rounded-md border border-input bg-background px-2 text-xs">
                      {statuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
                    </select>
                    <Button size="sm" variant="ghost" onClick={() => setSelectedLeadId(lead.id)}><MessageSquareText className="h-4 w-4" /> Activity</Button>
                  </div>
                </article>)}</div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-background">
            <CardHeader><CardTitle>Lead activity</CardTitle><CardDescription>{leads.find((lead) => lead.id === selectedLeadId)?.full_name ?? "Select a lead to see its timeline"}</CardDescription></CardHeader>
            <CardContent>
              {!selectedLeadId ? <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">Choose a lead from the list to review its notes and activity.</p> : <>
                <form onSubmit={addNote} className="space-y-3"><Label htmlFor="lead-note">Add an internal note</Label><Textarea id="lead-note" value={note} onChange={(e) => setNote(e.target.value)} required rows={3} maxLength={3000} placeholder="Call result, next step, visit notes…" /><Button type="submit" disabled={saving || !note.trim()}><Send className="h-4 w-4" /> Add note</Button></form>
                <div className="mt-6 space-y-4">{activities.length === 0 ? <p className="text-sm text-muted-foreground">No activity recorded yet.</p> : activities.map((activity) => <div key={activity.id} className="border-l-2 border-gold/50 pl-4"><p className="text-xs uppercase tracking-wide text-muted-foreground">{activity.activity_type.replaceAll("_"," ")} · {new Date(activity.occurred_at).toLocaleString()}</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6">{activity.body}</p></div>)}</div>
              </>}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default LeadsAdmin;
