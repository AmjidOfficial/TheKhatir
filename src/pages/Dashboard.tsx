import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity, ArrowRight, Building2, CalendarDays, CircleAlert, FileText, FolderKanban,
  LoaderCircle, LogOut, Megaphone, RefreshCw, Search, ShieldCheck, Users, UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseClient, isSupabaseConfigured } from "@/integrations/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import { COMPANY } from "@/lib/company";
import logo from "@/assets/khatir-logo.png";

type Workspace = {
  id: string;
  name: string;
  slug: string;
  business_type: string;
  status: string;
  role: string;
};

type ModuleMetric = {
  id: string;
  title: string;
  description: string;
  icon: typeof Building2;
  count: number | null;
  status: "ready" | "unavailable";
};

const moduleDefinitions = [
  { id: "properties", title: "Property listings", description: "Create, review and maintain property inventory.", icon: Building2 },
  { id: "leads", title: "Lead management", description: "Enquiries, assignments, follow-ups and activities.", icon: Users },
  { id: "projects", title: "Developments", description: "Developer portfolios, projects and construction updates.", icon: FolderKanban },
  { id: "events", title: "Events", description: "Launches, open houses, expos and site visits.", icon: CalendarDays },
  { id: "ad_campaigns", title: "Advertising & SEO", description: "Sponsored placements, campaigns and editorial content.", icon: Megaphone },
  { id: "content_pages", title: "SEO content", description: "Area guides, articles, landing pages and metadata.", icon: FileText },
] as const;

const roleLabels: Record<string, string> = {
  owner: "Business owner",
  tenant_admin: "Business admin",
  branch_manager: "Branch manager",
  sales_manager: "Sales manager",
  agent: "Property agent",
  listing_editor: "Listing editor",
  marketer: "Marketing",
  developer_manager: "Developer manager",
  builder_manager: "Builder manager",
  finance_manager: "Finance manager",
  support: "Support",
  platform_admin: "Platform admin",
  super_admin: "Super admin",
  user: "Member",
};

const slugify = (value: string) =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70);

const Dashboard = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [platformRole, setPlatformRole] = useState("user");
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState("");
  const [metrics, setMetrics] = useState<ModuleMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [backendError, setBackendError] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [businessType, setBusinessType] = useState("agency");
  const [creatingWorkspace, setCreatingWorkspace] = useState(false);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  const activeWorkspace = useMemo(
    () => workspaces.find((workspace) => workspace.id === activeWorkspaceId) ?? workspaces[0],
    [workspaces, activeWorkspaceId],
  );

  const loadDashboard = useCallback(async (showSpinner = true) => {
    if (!isSupabaseConfigured) {
      setBackendError("The approved Khatir Supabase project is not connected to this deployment yet. No sample metrics or fake accounts are shown.");
      setLoading(false);
      return;
    }

    if (showSpinner) setLoading(true);
    setBackendError("");
    try {
      const client = getSupabaseClient() as unknown as SupabaseClient;
      const { data: authData, error: authError } = await client.auth.getUser();
      if (authError || !authData?.user) {
        navigate("/login?next=/dashboard", { replace: true });
        return;
      }

      const user = authData.user;
      setUserEmail(user.email ?? "");
      const { data: profile, error: profileError } = await client
        .from("user_profiles")
        .select("display_name, platform_role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw new Error("The Khatir workspace database is not ready. Apply and verify the approved database migration first.");
      setDisplayName(profile?.display_name || user.user_metadata?.full_name || user.email || "Khatir user");
      setPlatformRole(profile?.platform_role || "user");

      const { data: membershipRows, error: membershipError } = await client
        .from("tenant_memberships")
        .select("tenant_id, role, status")
        .eq("user_id", user.id)
        .eq("status", "active");
      if (membershipError) throw new Error("Business memberships are not available yet. Check that the Khatir SaaS migration has been applied.");

      const membershipList = membershipRows ?? [];
      let workspaceList: Workspace[] = [];

      if (profile?.platform_role === "platform_admin" || profile?.platform_role === "super_admin") {
        const { data: allTenants, error: tenantsError } = await client
          .from("tenants")
          .select("id, name, slug, business_type, status")
          .order("name");
        if (tenantsError) throw new Error("Platform admin workspace access could not be loaded.");
        workspaceList = (allTenants ?? []).map((tenant) => ({
          ...tenant,
          role: profile.platform_role,
        }));
      } else if (membershipList.length) {
        const ids = membershipList.map((membership: any) => membership.tenant_id);
        const { data: tenantRows, error: tenantsError } = await client
          .from("tenants")
          .select("id, name, slug, business_type, status")
          .in("id", ids)
          .order("name");
        if (tenantsError) throw new Error("Your business workspaces could not be loaded.");
        workspaceList = (tenantRows ?? []).map((tenant) => ({
          ...tenant,
          role: membershipList.find((membership) => membership.tenant_id === tenant.id)?.role ?? "user",
        }));
      }

      setWorkspaces(workspaceList);
      const nextActive = workspaceList.find((workspace) => workspace.id === activeWorkspaceId) ?? workspaceList[0];
      setActiveWorkspaceId(nextActive?.id ?? "");

      if (nextActive) {
        const counts = await Promise.all(moduleDefinitions.map(async (module) => {
          const { count, error } = await client
            .from(module.id)
            .select("id", { count: "exact", head: true })
            .eq("tenant_id", nextActive.id);
          return {
            id: module.id,
            title: module.title,
            description: module.description,
            icon: module.icon,
            count: error ? null : (count ?? 0),
            status: error ? "unavailable" as const : "ready" as const,
          };
        }));
        setMetrics(counts);
      } else {
        setMetrics([]);
      }
    } catch (error) {
      setBackendError(error instanceof Error ? error.message : "We could not load the workspace. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeWorkspaceId, navigate]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const handleCreateWorkspace = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setNotice("");
    if (!workspaceName.trim()) {
      setFormError("Enter a business name.");
      return;
    }

    setCreatingWorkspace(true);
    try {
      const client = getSupabaseClient() as unknown as SupabaseClient;
      const { data: authData, error: authError } = await client.auth.getUser();
      if (authError || !authData?.user) {
        navigate("/login?next=/dashboard", { replace: true });
        return;
      }
      const baseSlug = slugify(workspaceName);
      if (!baseSlug) throw new Error("Choose a business name with letters or numbers.");

      const { error: insertError } = await client.from("tenants").insert({
        name: workspaceName.trim(),
        slug: baseSlug,
        business_type: businessType,
        created_by: authData.user.id,
        status: "pending",
        is_public: false,
      });
      if (insertError) throw insertError;

      setNotice("Your business workspace was created and is waiting for platform review before public publishing.");
      setWorkspaceName("");
      await loadDashboard(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not create the business workspace.");
    } finally {
      setCreatingWorkspace(false);
    }
  };

  const handleSignOut = async () => {
    if (isSupabaseConfigured) {
      try {
        await getSupabaseClient().auth.signOut();
      } finally {
        navigate("/login", { replace: true });
      }
    } else {
      navigate("/login", { replace: true });
    }
  };

  const activeRole = activeWorkspace?.role ?? platformRole;
  const isPlatformAdmin = platformRole === "platform_admin" || platformRole === "super_admin";
  const canManageWorkspace = ["owner", "tenant_admin", "branch_manager"].includes(activeRole);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="flex items-center gap-3 text-muted-foreground"><LoaderCircle className="h-5 w-5 animate-spin" /> Loading your secure workspace…</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <img src={logo} alt="" className="h-11 w-auto object-contain" />
            <span className="hidden border-l border-border pl-3 text-sm font-medium text-muted-foreground sm:block">Workspace</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/work" className="hidden text-sm text-muted-foreground hover:text-primary sm:inline">View properties</Link>
            <Button variant="outline" size="sm" onClick={() => { setRefreshing(true); void loadDashboard(false); }} disabled={refreshing}>
              {refreshing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut} aria-label="Sign out">
              <LogOut className="h-4 w-4" /><span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">KHATIR SAAS</p>
            <h1 className="mt-2 text-3xl font-light tracking-tight text-primary sm:text-4xl">Welcome, {displayName.split(" ")[0] || "back"}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{userEmail}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {workspaces.length > 1 && (
              <div className="min-w-[220px]">
                <Label htmlFor="active-workspace" className="sr-only">Choose workspace</Label>
                <select id="active-workspace" value={activeWorkspace?.id ?? ""} onChange={(event) => setActiveWorkspaceId(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                  {workspaces.map((workspace) => <option key={workspace.id} value={workspace.id}>{workspace.name}</option>)}
                </select>
              </div>
            )}
            {activeWorkspace && (
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-xs">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>{roleLabels[activeRole] ?? activeRole}</span>
                <span className="text-muted-foreground">· {activeWorkspace.status}</span>
              </div>
            )}
          </div>
        </div>

        {backendError && (
          <div role="alert" className="mb-7 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">Workspace setup required</p>
              <p className="mt-1">{backendError}</p>
              <p className="mt-2">No sample data is being presented as real business activity.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => { setRefreshing(true); void loadDashboard(); }} disabled={refreshing}>Retry</Button>
          </div>
        )}

        {!backendError && activeWorkspace && (
          <>
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {metrics.map((metric) => {
                const Icon = metric.icon;
                return (
                  <Card key={metric.id} className="border-border/80 bg-background transition-shadow hover:shadow-md">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                      <div className="space-y-1">
                        <CardTitle className="text-base font-semibold">{metric.title}</CardTitle>
                        <CardDescription className="max-w-xs leading-5">{metric.description}</CardDescription>
                      </div>
                      <div className="rounded-xl bg-primary/5 p-2.5 text-primary"><Icon className="h-5 w-5" /></div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-end justify-between gap-3">
                        <div className="text-3xl font-light tabular-nums">{metric.count === null ? "—" : metric.count}</div>
                        <span className={metric.status === "ready" ? "text-xs text-muted-foreground" : "text-xs text-amber-700"}>
                          {metric.status === "ready" ? "Live database count" : "Access not configured"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <Card className="bg-background">
                <CardHeader>
                  <CardTitle className="text-lg">Your workspace</CardTitle>
                  <CardDescription>Business information and access status.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Building2 className="mt-1 h-5 w-5 text-gold" />
                    <div>
                      <p className="font-medium">{activeWorkspace.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{activeWorkspace.business_type.replaceAll("_", " ")} · /{activeWorkspace.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Activity className="mt-1 h-5 w-5 text-gold" />
                    <div>
                      <p className="font-medium">Publishing status: {activeWorkspace.status}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        New workspaces start in review. Public listings and promotions should only go live after the required verification and approval checks.
                      </p>
                    </div>
                  </div>
                  {canManageWorkspace && (
                    <div className="rounded-xl border border-border bg-muted/40 p-4">
                      <p className="font-medium">Business owner controls</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">Team invitations, role management, branches, billing and detailed editors are being connected to the secured database foundation. They are not shown as active until their workflows are implemented.</p>
                    </div>
                  )}
                  {isPlatformAdmin && (
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                      <p className="font-medium">Platform administration</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">Your account has platform-level permissions. Moderation, tenant verification, advertising approvals and audit review require the corresponding admin tools before production launch.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-background">
                <CardHeader>
                  <CardTitle className="text-lg">Quick links</CardTitle>
                  <CardDescription>Public pages and account settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link to="/dashboard/properties" className="flex items-center justify-between rounded-lg border border-border p-3 text-sm transition-colors hover:bg-muted">
                    <span className="flex items-center gap-3"><Building2 className="h-4 w-4 text-gold" /> Manage property inventory</span><ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/work" className="flex items-center justify-between rounded-lg border border-border p-3 text-sm transition-colors hover:bg-muted">
                    <span className="flex items-center gap-3"><Search className="h-4 w-4 text-gold" /> Browse properties</span><ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/services" className="flex items-center justify-between rounded-lg border border-border p-3 text-sm transition-colors hover:bg-muted">
                    <span className="flex items-center gap-3"><FolderKanban className="h-4 w-4 text-gold" /> Construction & services</span><ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/contact" className="flex items-center justify-between rounded-lg border border-border p-3 text-sm transition-colors hover:bg-muted">
                    <span className="flex items-center gap-3"><UserRound className="h-4 w-4 text-gold" /> Contact Khatir</span><ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {!backendError && !activeWorkspace && (
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <Card className="bg-background">
              <CardHeader>
                <CardTitle className="text-xl">Create your business workspace</CardTitle>
                <CardDescription>For an agency, developer, builder, owner or investor. You can manage your own work after approval.</CardDescription>
              </CardHeader>
              <CardContent>
                {formError && <p role="alert" className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{formError}</p>}
                {notice && <p role="status" className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm">{notice}</p>}
                <form onSubmit={handleCreateWorkspace} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="workspace-name">Business or workspace name</Label>
                    <Input id="workspace-name" value={workspaceName} onChange={(event) => setWorkspaceName(event.target.value)} required minLength={2} maxLength={160} placeholder="e.g. Khatir Real Estate" />
                    {workspaceName && <p className="text-xs text-muted-foreground">Workspace URL slug: {slugify(workspaceName) || "add a name"}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business-type">Business type</Label>
                    <select id="business-type" value={businessType} onChange={(event) => setBusinessType(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                      <option value="agency">Real estate agency</option>
                      <option value="developer">Property developer</option>
                      <option value="builder">Construction / builder</option>
                      <option value="individual">Independent agent</option>
                      <option value="property_owner">Property owner / landlord</option>
                      <option value="investor">Investor</option>
                    </select>
                  </div>
                  <Button type="submit" className="w-full" disabled={creatingWorkspace}>
                    {creatingWorkspace ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                    Create workspace
                  </Button>
                </form>
              </CardContent>
            </Card>
            <Card className="flex flex-col justify-center bg-background">
              <CardHeader>
                <CardTitle className="text-xl">One account, your own workspace</CardTitle>
                <CardDescription className="leading-6">Every business has its own listings, team, enquiries, projects, events and marketing. Staff permissions are scoped to their business and enforced by the database.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>• Your workspace starts private and pending review.</p>
                <p>• Public publishing requires the right verification and moderation.</p>
                <p>• Customer enquiries and contact information are not public.</p>
                <p>• Plan limits and paid promotions will be enabled only after billing is tested.</p>
              </CardContent>
            </Card>
          </div>
        )}

        <footer className="mt-10 border-t border-border pt-5 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {COMPANY.name}. Keep customer data private and confirm property details before publication.
        </footer>
      </div>
    </main>
  );
};

export default Dashboard;
