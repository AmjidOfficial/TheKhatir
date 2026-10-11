import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CircleAlert, FileText, LoaderCircle } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SEO from "@/components/SEO";
import { getSupabaseClient, isSupabaseConfigured } from "@/integrations/supabase/client";

type PublicContent = {
  title: string;
  slug: string;
  content_type: string;
  excerpt: string | null;
  body: string;
  meta_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  social_image_url: string | null;
  robots_directive: string;
  published_at: string | null;
};

const ContentDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [content, setContent] = useState<PublicContent | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug || !isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const client = getSupabaseClient() as unknown as SupabaseClient;
        const { data, error: queryError } = await client.from("marketplace_content")
          .select("title,slug,content_type,excerpt,body,meta_title,meta_description,canonical_url,social_image_url,robots_directive,published_at")
          .eq("slug", slug)
          .maybeSingle();
        if (queryError) throw queryError;
        if (!cancelled) setContent((data ?? null) as PublicContent | null);
      } catch {
        if (!cancelled) {
          setContent(null);
          setError("We could not load this article. Please try again later.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [slug]);

  return (
    <div className="min-h-screen bg-background">
      <SEO title={(content?.meta_title || content?.title || "Property guide") + " | Khatir"} description={content?.meta_description || content?.excerpt || "Property and development insights from Khatir."} path={"/guides/" + (slug ?? "")} image={content?.social_image_url || undefined} robots={content?.robots_directive || "noindex,nofollow"} canonicalUrl={content?.canonical_url || undefined} type="article" />
      <Navigation />
      <main className="container mx-auto max-w-5xl px-6 pb-24 pt-32 md:pt-36">
        <Link to="/guides" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" /> All guides</Link>
        {loading ? <div className="flex min-h-64 items-center justify-center gap-3 text-muted-foreground"><LoaderCircle className="h-5 w-5 animate-spin" /> Loading article…</div> : !content ? (
          <div className="rounded-2xl border border-border bg-card px-6 py-16 text-center">
            {error ? <CircleAlert className="mx-auto h-8 w-8 text-amber-600" /> : <FileText className="mx-auto h-8 w-8 text-gold" />}
            <h1 className="mt-4 text-3xl font-light text-primary">Article not available</h1>
            <p className="mt-3 text-muted-foreground">{error || "This guide may not be published yet."}</p>
            <Link to="/guides" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground">Browse guides</Link>
          </div>
        ) : (
          <article>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">{content.content_type.replaceAll("_", " ")}</p>
            <h1 className="mt-3 text-4xl font-light leading-tight text-primary md:text-6xl">{content.title}</h1>
            {content.excerpt && <p className="mt-6 text-lg leading-8 text-muted-foreground">{content.excerpt}</p>}
            <div className="my-8 h-px bg-border" />
            <div className="whitespace-pre-wrap break-words text-base leading-8 text-foreground">{content.body}</div>
            <p className="mt-12 rounded-xl border border-border bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">This article is general information, not legal, financial or property verification advice. Confirm important details with qualified professionals and the relevant authorities.</p>
          </article>
        )}
      </main>
      <Footer /><WhatsAppButton />
    </div>
  );
};

export default ContentDetail;
