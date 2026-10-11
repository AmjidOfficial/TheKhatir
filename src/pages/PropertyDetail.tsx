import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Bed, Bath, Building2, LoaderCircle, MapPin, Maximize, MessageCircle, ShieldAlert } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SEO from "@/components/SEO";
import { properties, type Property } from "@/data/properties";
import { getSupabaseClient, isSupabaseConfigured } from "@/integrations/supabase/client";
import { mapMarketplaceProperty, type MarketplaceProperty } from "@/lib/property-mapper";
import { waLink } from "@/lib/company";

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const sampleProperty = properties.find((item) => item.id === id);
  const [liveProperty, setLiveProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(Boolean(id && !sampleProperty && isSupabaseConfigured));
  const [lookupError, setLookupError] = useState("");

  useEffect(() => {
    if (!id || sampleProperty || !isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const loadProperty = async () => {
      setLoading(true);
      setLookupError("");
      try {
        const client = getSupabaseClient() as unknown as SupabaseClient;
        const { data, error } = await client.from("marketplace_properties")
          .select("id,reference_code,title,description,listing_type,intent,price,currency,price_period,area_value,area_unit,bedrooms,bathrooms,province,city,locality,society,block_sector")
          .eq("id", id)
          .maybeSingle();
        if (error) throw error;
        if (!cancelled) setLiveProperty(data ? mapMarketplaceProperty(data as unknown as MarketplaceProperty) : null);
      } catch {
        if (!cancelled) {
          setLiveProperty(null);
          setLookupError("We could not load this listing right now. Please try again later.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void loadProperty();
    return () => { cancelled = true; };
  }, [id, sampleProperty]);

  const property = sampleProperty ?? liveProperty;

  if (loading) {
    return <div className="min-h-screen bg-background"><Navigation /><main className="container mx-auto flex min-h-[60vh] items-center justify-center gap-3 px-6 pt-32 text-muted-foreground"><LoaderCircle className="h-5 w-5 animate-spin" /> Loading property details…</main><Footer /><WhatsAppButton /></div>;
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-6 pb-24 pt-36">
          <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8 text-center md:p-12">
            <h1 className="text-3xl font-light text-primary">Property not found</h1>
            <p className="mt-4 text-muted-foreground">{lookupError || "This listing may have been removed, archived or is no longer publicly available."}</p>
            <Link to="/work" className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"><ArrowLeft className="h-4 w-4" /> Browse properties</Link>
          </div>
        </main>
        <Footer /><WhatsAppButton />
      </div>
    );
  }

  const inquiry = "Assalam-o-Alaikum! I would like details about \"" + property.title + "\" (" + property.location + "). Please confirm current availability, price and documents.";

  return (
    <div className="min-h-screen bg-background">
      <SEO title={property.title + " | Khatir Real Estate, Peshawar"} description={"Property details for " + property.title + " in " + property.location + ". Contact Khatir to confirm current price, availability and documents."} path={"/property/" + property.id} image={property.image || undefined} robots={property.isSample ? "noindex,nofollow" : undefined} />
      <Navigation />
      <main className="container mx-auto px-6 pb-24 pt-32 md:pt-36">
        <div className="mx-auto max-w-7xl">
          <Link to="/work" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"><ArrowLeft className="h-4 w-4" /> Back to properties</Link>

          {property.isSample && (
            <div role="status" className="mb-6 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm leading-relaxed"><strong>Illustrative sample only.</strong> This is demo content, not a confirmed live offer. Price, availability, ownership and documents have not been verified.</p>
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12">
            <div className="flex aspect-[4/3] min-h-64 items-center justify-center overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-muted to-gold/10">
              {property.image ? <img src={property.image} alt={property.title} className="h-full w-full object-cover" /> : <div className="flex flex-col items-center gap-3 p-8 text-center text-muted-foreground"><Building2 className="h-14 w-14 text-gold/80" /><span className="text-xs font-medium uppercase tracking-widest">Listing photo not provided</span></div>}
            </div>

            <div className="flex flex-col">
              <div className="mb-4 flex flex-wrap gap-2"><span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold tracking-wide text-primary-foreground">{property.category}</span><span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold tracking-wide text-secondary-foreground">{property.status}</span></div>
              <h1 className="text-3xl font-light leading-tight text-primary md:text-5xl">{property.title}</h1>
              <p className="mt-4 flex items-start gap-2 text-muted-foreground"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gold" />{property.location}</p>
              <p className="mt-6 text-3xl font-light text-gold md:text-4xl">{property.price}</p>

              <div className="my-6 grid grid-cols-2 gap-3 border-y border-border py-5 sm:grid-cols-3">
                <div className="rounded-xl bg-muted/50 p-3"><Maximize className="mb-2 h-5 w-5 text-gold" /><p className="text-xs text-muted-foreground">Area</p><p className="mt-1 font-medium text-primary">{property.area}</p></div>
                {property.beds !== undefined && <div className="rounded-xl bg-muted/50 p-3"><Bed className="mb-2 h-5 w-5 text-gold" /><p className="text-xs text-muted-foreground">Bedrooms</p><p className="mt-1 font-medium text-primary">{property.beds}</p></div>}
                {property.baths !== undefined && <div className="rounded-xl bg-muted/50 p-3"><Bath className="mb-2 h-5 w-5 text-gold" /><p className="text-xs text-muted-foreground">Bathrooms</p><p className="mt-1 font-medium text-primary">{property.baths}</p></div>}
              </div>

              <h2 className="text-xl font-medium text-primary">About this property</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">{property.description}</p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href={waLink(inquiry)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 font-medium text-white transition-colors hover:bg-[#1ebe57]"><MessageCircle className="h-5 w-5" /> Ask on WhatsApp</a>
                <Link to="/contact" className="inline-flex min-h-12 items-center justify-center rounded-full border border-border px-5 py-3 font-medium text-primary transition-colors hover:border-gold">Contact our team</Link>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">Always independently confirm property ownership, approvals, transfer requirements, price and availability before paying any amount.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer /><WhatsAppButton />
    </div>
  );
};

export default PropertyDetail;
