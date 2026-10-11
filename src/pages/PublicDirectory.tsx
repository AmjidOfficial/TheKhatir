import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, CalendarDays, CircleAlert, FileText, FolderKanban, LoaderCircle, MapPin } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SEO from "@/components/SEO";
import { getSupabaseClient, isSupabaseConfigured } from "@/integrations/supabase/client";

type DirectoryRow = Record<string, unknown> & { id: string; title: string; slug: string };
type Section = {
  table: string; title: string; eyebrow: string; description: string; path: string;
  select: string; icon: typeof CalendarDays; emptyTitle: string; emptyDescription: string;
};

const sections: Record<string, Section> = {
  events: {
    table: "marketplace_events", title: "Events & site visits", eyebrow: "KHATIR EVENTS",
    description: "Discover approved property launches, open houses, investor sessions and construction site visits.",
    path: "/events", select: "id,title,slug,event_type,description,starts_at,ends_at,timezone,venue,cover_image_url,capacity",
    icon: CalendarDays, emptyTitle: "No public events yet", emptyDescription: "Check back soon or contact Khatir to ask about upcoming launches and site visits.",
  },
  developments: {
    table: "marketplace_projects", title: "Developments & projects", eyebrow: "PROJECT DIRECTORY",
    description: "Explore public development and construction projects. Always confirm approvals, inventory and payment terms independently.",
    path: "/developments", select: "id,title,slug,project_type,summary,description,province,city,locality,approval_status,approval_reference,approval_checked_at,published_at",
    icon: FolderKanban, emptyTitle: "No public projects yet", emptyDescription: "Approved project profiles will appear here when a developer has published them.",
  },
  guides: {
    table: "marketplace_content", title: "Property guides & insights", eyebrow: "KHATIR JOURNAL",
    description: "Read property guides, local area information and development insights published by Khatir and approved business partners.",
    path: "/guides", select: "id,title,slug,content_type,excerpt,meta_title,meta_description,published_at",
    icon: FileText, emptyTitle: "No guides published yet", emptyDescription: "New guides and articles will appear here after editorial review.",
  },
};

const asText = (value: unknown) => typeof value === "string" ? value : "";
const PublicDirectory = () => {
  const location = useLocation();
  const sectionKey = location.pathname.split("/")[1] || "events";
  const section = sections[sectionKey] ?? sections.events;
  const Icon = section.icon;
  const [rows, setRows] = useState<DirectoryRow[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setRows([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const client = getSupabaseClient() as unknown as SupabaseClient;
        let query = client.from(section.table).select(section.select);
        if (sectionKey === "events") query = query.gte("ends_at", new Date().toISOString()).order("starts_at", { ascending: true });
        else query = query.order("published_at", { ascending: false });
        const { data, error: queryError } = await query;
        if (queryError) throw queryError;
        if (!cancelled) setRows((data ?? []) as DirectoryRow[]);
      } catch {
        if (!cancelled) {
          setRows([]);
          setError("Published information could not be loaded right now. Please try again later.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [section, sectionKey]);

  return (
    <div className="min-h-screen bg-background">
      <SEO title={section.title + " | Khatir"} description={section.description} path={section.path} />
      <Navigation />
      <main className="container mx-auto px-6 pb-24 pt-32 md:pt-36">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">{section.eyebrow}</p>
          <h1 className="mt-3 text-4xl font-light text-primary md:text-6xl">{section.title}</h1>
          <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">{section.description}</p>

          {!isSupabaseConfigured && <div role="status" className="mt-8 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">Live publishing is not connected in this deployment yet. No sample events, projects or articles are shown as real content.</div>}
          {error && <div role="alert" className="mt-8 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"><CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />{error}</div>}

          {loading ? <div className="flex min-h-56 items-center justify-center gap-3 text-muted-foreground"><LoaderCircle className="h-5 w-5 animate-spin" /> Loading published content…</div> : rows.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
              <Icon className="mx-auto h-10 w-10 text-gold" />
              <h2 className="mt-4 text-2xl font-light text-primary">{section.emptyTitle}</h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{section.emptyDescription}</p>
              <Link to="/contact" className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground">Contact Khatir <ArrowRight className="h-4 w-4" /></Link>
            </div>
          ) : (
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rows.map((row) => {
                const subtitle = asText(row.event_type ?? row.project_type ?? row.content_type).replaceAll("_", " ");
                const description = asText(row.description ?? row.summary ?? row.excerpt ?? row.meta_description);
                const place = [asText(row.locality), asText(row.city), asText(row.province)].filter(Boolean).join(", ");
                const date = asText(row.starts_at);
                const detailPath = sectionKey === "guides" ? "/guides/" + row.slug : "/contact";
                return (
                  <article key={row.id} className="flex flex-col rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-elegant">
                    <div className="flex items-center justify-between gap-3"><span className="rounded-full bg-primary/5 px-3 py-1 text-xs font-medium capitalize text-primary">{subtitle || "Khatir"}</span>{sectionKey === "projects" && row.approval_status === "verified" ? <span className="rounded-full border border-emerald-600/30 px-3 py-1 text-xs text-emerald-700">Approval checked</span> : null}</div>
                    <h2 className="mt-5 text-xl font-medium leading-snug text-primary">{row.title}</h2>
                    {place && <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />{place}</p>}
                    {date && <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground"><CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-gold" />{new Date(date).toLocaleString()}</p>}
                    {description && <p className="mt-4 line-clamp-4 flex-1 text-sm leading-6 text-muted-foreground">{description}</p>}
                    {sectionKey === "projects" && row.approval_reference ? <p className="mt-4 text-xs text-muted-foreground">Approval reference: {asText(row.approval_reference)} · Confirm with the relevant authority.</p> : null}
                    <Link to={detailPath} className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border px-4 py-3 text-sm font-medium text-primary transition-colors hover:border-gold">{sectionKey === "guides" ? "Read guide" : sectionKey === "events" ? "Ask about this event" : "Enquire about project"} <ArrowRight className="h-4 w-4" /></Link>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer /><WhatsAppButton />
    </div>
  );
};

export default PublicDirectory;
