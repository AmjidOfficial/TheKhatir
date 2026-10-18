import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Archive, Building2, CircleAlert, Edit3, LoaderCircle, Plus, RefreshCw, Search, Send, Trash2, X } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getSupabaseClient, isSupabaseConfigured } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";

type Workspace = { id: string; name: string; role: string; status: string };
type PropertyRow = {
  id: string;
  tenant_id: string;
  created_by: string | null;
  reference_code: string;
  title: string;
  slug: string;
  description: string;
  listing_type: string;
  intent: string;
  price: number | null;
  currency: string;
  area_value: number | null;
  area_unit: string | null;
  city: string;
  locality: string | null;
  verification_status: string;
  publication_status: string;
  updated_at: string;
};

type PropertyForm = {
  reference_code: string;
  title: string;
  description: string;
  listing_type: string;
  intent: string;
  price: string;
  area_value: string;
  area_unit: string;
  city: string;
  locality: string;
};

const emptyForm: PropertyForm = {
  reference_code: "",
  title: "",
  description: "",
  listing_type: "house",
  intent: "sale",
  price: "",
  area_value: "",
  area_unit: "marla",
  city: "Peshawar",
  locality: "",
};

const slugify = (value: string) =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100);

const formatPrice = (price: number | null, currency: string) =>
  price === null ? "Price on request" : new Intl.NumberFormat("en-PK", {
    style: "currency", currency, maximumFractionDigits: 0,
  }).format(price);

const PropertiesAdmin = () => {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceId, setWorkspaceId] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [form, setForm] = useState<PropertyForm>(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const activeWorkspace = workspaces.find((workspace) => workspace.id === workspaceId) ?? workspaces[0];
  const canEdit = Boolean(activeWorkspace && [
    "owner", "tenant_admin", "branch_manager", "sales_manager", "agent",
    "listing_editor", "marketer", "developer_manager", "builder_manager",
    "platform_admin", "super_admin",
  ].includes(activeWorkspace.role));
  const managerRoles = ["owner", "tenant_admin", "branch_manager", "platform_admin", "super_admin"];
  const canArchive = Boolean(activeWorkspace && managerRoles.includes(activeWorkspace.role));
  const canEditProperty = (property: PropertyRow) => Boolean(canEdit && (managerRoles.includes(activeWorkspace?.role ?? "") || property.created_by === currentUserId));
  const canDeleteProperty = (property: PropertyRow) => Boolean(canArchive || (property.created_by && property.created_by === currentUserId));

  const load = useCallback(async (showSpinner = true) => {
    if (!isSupabaseConfigured) {
      setError("The approved Khatir Supabase project is not configured. This editor will not use local demo data.");
      setLoading(false);
      return;
    }
    if (showSpinner) setLoading(true);
    setError("");
    try {
      const client = getSupabaseClient() as unknown as SupabaseClient;
      const { data: authData, error: authError } = await client.auth.getUser();
      if (authError || !authData.user) {
        navigate("/login?next=/dashboard/properties", { replace: true });
        return;
      }
      const { data: profile, error: profileError } = await client
        .from("user_profiles")
        .select("platform_role")
        .eq("id", authData.user.id)
        .maybeSingle();
      if (profileError) throw new Error("The Khatir database is not ready. Apply the reviewed migration to the approved project.");

      let workspaceList: Workspace[] = [];
      if (profile?.platform_role === "platform_admin" || profile?.platform_role === "super_admin") {
        const { data, error: tenantError } = await client.from("tenants").select("id,name,status");
        if (tenantError) throw new Error("Could not load business workspaces.");
        workspaceList = (data ?? []).map((row) => ({ id: row.id, name: row.name, status: row.status, role: profile.platform_role }));
      } else {
        const { data: memberships, error: membershipError } = await client
          .from("tenant_memberships")
          .select("tenant_id,role,status")
          .eq("user_id", authData.user.id)
          .eq("status", "active");
        if (membershipError) throw new Error("Business memberships are not available. Check the database migration.");
        const ids = (memberships ?? []).map((membership) => membership.tenant_id);
        if (ids.length) {
          const { data, error: tenantError } = await client.from("tenants").select("id,name,status").in("id", ids);
          if (tenantError) throw new Error("Could not load your business workspaces.");
          workspaceList = (data ?? []).map((row) => ({
            id: row.id,
            name: row.name,
            status: row.status,
            role: memberships?.find((membership) => membership.tenant_id === row.id)?.role ?? "user",
          }));
        }
      }

      setWorkspaces(workspaceList);
      const chosen = workspaceList.find((workspace) => workspace.id === workspaceId) ?? workspaceList[0];
      setWorkspaceId(chosen?.id ?? "");
      if (!chosen) {
        setProperties([]);
        return;
      }
      const { data: rows, error: propertyError } = await client
        .from("properties")
        .select("id,tenant_id,created_by,reference_code,title,slug,description,listing_type,intent,price,currency,area_value,area_unit,city,locality,verification_status,publication_status,updated_at")
        .eq("tenant_id", chosen.id)
        .order("updated_at", { ascending: false });
      if (propertyError) throw new Error("Property inventory could not be loaded. Check your role and database policies.");
      setProperties((rows ?? []) as PropertyRow[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load property inventory.");
    } finally {
      setLoading(false);
    }
  }, [navigate, workspaceId]);

  useEffect(() => { void load(); }, [load]);

  const filteredProperties = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return properties;
    return properties.filter((property) =>
      [property.title, property.reference_code, property.city, property.locality ?? "", property.listing_type]
        .join(" ").toLowerCase().includes(q)
    );
  }, [properties, query]);

  const openNewForm = () => {
    setEditingId("");
    setForm({ ...emptyForm, reference_code: `KH-${Date.now().toString().slice(-8)}` });
    setShowForm(true);
    setError("");
    setNotice("");
  };

  const openEditForm = (property: PropertyRow) => {
    setEditingId(property.id);
    setForm({
      reference_code: property.reference_code,
      title: property.title,
      description: property.description,
      listing_type: property.listing_type,
      intent: property.intent,
      price: property.price === null ? "" : String(property.price),
      area_value: property.area_value === null ? "" : String(property.area_value),
      area_unit: property.area_unit ?? "marla",
      city: property.city,
      locality: property.locality ?? "",
    });
    setShowForm(true);
    setError("");
    setNotice("");
  };

  const saveProperty = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!canEdit || !activeWorkspace) {
      setError("Your current role cannot edit property listings in this workspace.");
      return;
    }
    if (form.price && Number(form.price) < 0) {
      setError("Price cannot be negative.");
      return;
    }
    if (form.area_value && Number(form.area_value) < 0) {
      setError("Area cannot be negative.");
      return;
    }
    if (form.title.trim().length < 5) {
      setError("Use a clear property title with at least 5 characters.");
      return;
    }

    setSaving(true);
    try {
      const client = getSupabaseClient() as unknown as SupabaseClient;
      const { data: authData, error: authError } = await client.auth.getUser();
      if (authError || !authData.user) throw new Error("Your session has expired. Please sign in again.");

      const payload = {
        reference_code: form.reference_code.trim(),
        title: form.title.trim(),
        slug: slugify(form.title) || slugify(form.reference_code) || ("listing-" + Date.now().toString(36)),
        description: form.description.trim(),
        listing_type: form.listing_type,
        intent: form.intent,
        price: form.price.trim() ? Number(form.price) : null,
        currency: "PKR",
        area_value: form.area_value.trim() ? Number(form.area_value) : null,
        area_unit: form.area_unit || null,
        city: form.city.trim(),
        locality: form.locality.trim() || null,
      };

      if (editingId) {
        const { error: updateError } = await client.from("properties").update(payload).eq("id", editingId).eq("tenant_id", activeWorkspace.id);
        if (updateError) throw updateError;
        setNotice("Property details saved. Verification and publishing status were not changed.");
      } else {
        const { error: insertError } = await client.from("properties").insert({
          ...payload,
          tenant_id: activeWorkspace.id,
          created_by: authData.user.id,
          verification_status: "unverified",
          publication_status: "draft",
        });
        if (insertError) throw insertError;
        setNotice("Draft listing created. Submit it for review when the details are ready.");
      }
      setShowForm(false);
      setEditingId("");
      await load(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the property.");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (property: PropertyRow, status: "pending_review" | "archived") => {
    setError("");
    setNotice("");
    if (!activeWorkspace) return;
    if (status === "archived" && !canArchive) {
      setError("Only workspace managers can archive listings.");
      return;
    }
    try {
      const client = getSupabaseClient() as unknown as SupabaseClient;
      const { error: updateError } = await client.from("properties")
        .update({ publication_status: status })
        .eq("id", property.id)
        .eq("tenant_id", activeWorkspace.id);
      if (updateError) throw updateError;
      setNotice(status === "pending_review" ? "Listing submitted for review. It is not public yet." : "Listing archived. Its history remains in the workspace.");
      await load(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update listing status.");
    }
  };

  const deleteProperty = async (property: PropertyRow) => {
    setError("");
    setNotice("");
    if (!activeWorkspace || !canDeleteProperty(property)) {
      setError("You can delete only your own listings. Workspace managers can manage all listings.");
      return;
    }
    const confirmed = window.confirm(`Permanently delete "${property.title}"? This cannot be undone.`);
    if (!confirmed) return;
    try {
      const client = getSupabaseClient() as unknown as SupabaseClient;
      const { error: deleteError } = await client.from("properties")
        .delete()
        .eq("id", property.id)
        .eq("tenant_id", activeWorkspace.id);
      if (deleteError) throw deleteError;
      setNotice("Listing deleted. The audit record is retained.");
      await load(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete the listing.");
    }
  };

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center gap-3 bg-background text-muted-foreground"><SEO title="Property inventory | Khatir Workspace" description="Private property operations." path="/dashboard/properties" robots="noindex,nofollow" /><LoaderCircle className="h-5 w-5 animate-spin" /> Loading property inventory…</main>;
  }

  return (
    <main className="min-h-screen bg-muted/30">
      <SEO title="Property inventory | Khatir Workspace" description="Private property operations." path="/dashboard/properties" robots="noindex,nofollow" />
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" /> Workspace dashboard</Link>
          <Button variant="outline" size="sm" onClick={() => void load()}><RefreshCw className="h-4 w-4" /> Refresh</Button>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">PROPERTY OPERATIONS</p>
            <h1 className="mt-2 text-3xl font-light text-primary sm:text-4xl">Property inventory</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Create and maintain listings for your business. New listings remain drafts until the required verification and approval steps are complete.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            {workspaces.length > 1 && (
              <select aria-label="Business workspace" value={activeWorkspace?.id ?? ""} onChange={(event) => setWorkspaceId(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                {workspaces.map((workspace) => <option key={workspace.id} value={workspace.id}>{workspace.name}</option>)}
              </select>
            )}
            <Button onClick={openNewForm} disabled={!canEdit || !activeWorkspace}><Plus className="h-4 w-4" /> Add property</Button>
          </div>
        </div>

        {error && <div role="alert" className="mb-5 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"><CircleAlert className="mt-0.5 h-5 w-5 shrink-0" /><span>{error}</span></div>}
        {notice && <div role="status" className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm">{notice}</div>}

        {!isSupabaseConfigured && (
          <Card className="mb-6 border-amber-300 bg-amber-50 text-amber-950">
            <CardHeader><CardTitle className="text-lg">Database connection required</CardTitle><CardDescription className="text-amber-900">This page will not save to browser-only demo data. Connect the approved Khatir Supabase project and apply the reviewed migration before using this editor.</CardDescription></CardHeader>
          </Card>
        )}

        {showForm && (
          <Card className="mb-7 border-primary/20 bg-background">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div><CardTitle>{editingId ? "Edit property draft" : "Create a property draft"}</CardTitle><CardDescription>Only enter details confirmed by the responsible owner or agent.</CardDescription></div>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)} aria-label="Close form"><X className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={saveProperty} className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="reference">Reference code</Label><Input id="reference" value={form.reference_code} onChange={(e) => setForm({ ...form, reference_code: e.target.value })} required maxLength={40} /></div>
                <div className="space-y-2"><Label htmlFor="title">Listing title</Label><Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required minLength={5} maxLength={220} placeholder="e.g. 10 Marla House in Hayatabad" /></div>
                <div className="space-y-2"><Label htmlFor="listing-type">Property type</Label><select id="listing-type" value={form.listing_type} onChange={(e) => setForm({ ...form, listing_type: e.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">{["house","plot","apartment","commercial","shop","office","warehouse","land","room","other"].map((item) => <option key={item} value={item}>{item.replaceAll("_"," ")}</option>)}</select></div>
                <div className="space-y-2"><Label htmlFor="intent">Listing intent</Label><select id="intent" value={form.intent} onChange={(e) => setForm({ ...form, intent: e.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="sale">For sale</option><option value="rent">For rent</option><option value="lease">For lease</option><option value="project">Project inventory</option></select></div>
                <div className="space-y-2"><Label htmlFor="price">Price (PKR)</Label><Input id="price" type="number" min="0" step="1" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Leave blank for price on request" /></div>
                <div className="grid grid-cols-[1fr_1fr] gap-3">
                  <div className="space-y-2"><Label htmlFor="area-value">Area</Label><Input id="area-value" type="number" min="0" step="0.001" value={form.area_value} onChange={(e) => setForm({ ...form, area_value: e.target.value })} /></div>
                  <div className="space-y-2"><Label htmlFor="area-unit">Area unit</Label><select id="area-unit" value={form.area_unit} onChange={(e) => setForm({ ...form, area_unit: e.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="marla">Marla</option><option value="kanal">Kanal</option><option value="sq_ft">Sq ft</option><option value="sq_yd">Sq yd</option><option value="acre">Acre</option></select></div>
                </div>
                <div className="space-y-2"><Label htmlFor="city">City</Label><Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required maxLength={100} /></div>
                <div className="space-y-2"><Label htmlFor="locality">Area / society / sector</Label><Input id="locality" value={form.locality} onChange={(e) => setForm({ ...form, locality: e.target.value })} maxLength={160} placeholder="e.g. Hayatabad Phase 3" /></div>
                <div className="space-y-2 md:col-span-2"><Label htmlFor="description">Description</Label><Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} maxLength={10000} placeholder="Describe confirmed features, access and relevant details. Avoid unsupported claims." /></div>
                <div className="flex flex-wrap gap-3 md:col-span-2"><Button type="submit" disabled={saving || !canEdit}>{saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}{editingId ? "Save changes" : "Save draft"}</Button><Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card className="bg-background">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><CardTitle className="text-lg">{activeWorkspace?.name ?? "Choose a workspace"}</CardTitle><CardDescription>{properties.length} listing{properties.length === 1 ? "" : "s"} in this workspace</CardDescription></div>
            <div className="relative w-full sm:max-w-xs"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Search property listings" className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, reference, area…" /></div>
          </CardHeader>
          <CardContent>
            {filteredProperties.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border px-5 py-12 text-center">
                <Building2 className="mx-auto h-8 w-8 text-muted-foreground" />
                <h2 className="mt-4 text-lg font-medium">{properties.length ? "No matching listings" : "No property listings yet"}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{properties.length ? "Try another search term." : "Create your first draft when the business workspace and database are ready."}</p>
                {!properties.length && <Button className="mt-5" onClick={openNewForm} disabled={!canEdit || !activeWorkspace}><Plus className="h-4 w-4" /> Add first property</Button>}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProperties.map((property) => (
                  <article key={property.id} className="rounded-xl border border-border p-4 transition-colors hover:bg-muted/20 sm:p-5">
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary">{property.reference_code}</span>
                          <span className="rounded-full border border-border px-2.5 py-1 text-xs capitalize">{property.publication_status.replaceAll("_"," ")}</span>
                          <span className="rounded-full border border-border px-2.5 py-1 text-xs capitalize">{property.verification_status.replaceAll("_"," ")}</span>
                        </div>
                        <h2 className="mt-3 truncate text-lg font-medium text-primary">{property.title}</h2>
                        <p className="mt-1 text-sm text-muted-foreground">{[property.locality, property.city].filter(Boolean).join(", ")} · {property.listing_type.replaceAll("_"," ")} · {property.intent}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                          <span className="font-semibold">{formatPrice(property.price, property.currency)}</span>
                          {property.area_value !== null && <span className="text-muted-foreground">{property.area_value} {property.area_unit?.replaceAll("_"," ")}</span>}
                          <span className="text-xs text-muted-foreground">Updated {new Date(property.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditForm(property)} disabled={!canEditProperty(property)}><Edit3 className="h-4 w-4" /> Edit</Button>
                        {property.publication_status === "draft" && <Button variant="secondary" size="sm" onClick={() => void updateStatus(property, "pending_review")} disabled={!canEditProperty(property)}><Send className="h-4 w-4" /> Submit for review</Button>}
                        {property.publication_status !== "archived" && canArchive && <Button variant="ghost" size="sm" onClick={() => void updateStatus(property, "archived")}><Archive className="h-4 w-4" /> Archive</Button>}\n                        {canDeleteProperty(property) && <Button variant="ghost" size="sm" onClick={() => void deleteProperty(property)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /> Delete</Button>}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default PropertiesAdmin;
