import { useEffect, useState } from "react";
import { ArrowUpRight, BadgeCheck, Megaphone } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient, isSupabaseConfigured } from "@/integrations/supabase/client";

type Placement = {
  id: string;
  product_type: string;
  advertiser_name: string;
  advertiser_slug: string;
  destination_url: string | null;
  property_id: string | null;
  project_id: string | null;
  event_id: string | null;
  creative: unknown;
};

type Props = { placementTypes: string[]; title?: string; currentLocation?: string };

const textValue = (value: unknown) => typeof value === "string" ? value : "";

const SponsoredPlacements = ({ placementTypes, title = "Featured partners", currentLocation }: Props) => {
  const placementTypeKey = placementTypes.join(",");
  const [placements, setPlacements] = useState<Placement[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured || !placementTypeKey) {
      setPlacements([]);
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        const client = getSupabaseClient() as unknown as SupabaseClient;
        const { data, error } = await client.from("marketplace_ad_placements")
          .select("id,product_type,advertiser_name,advertiser_slug,destination_url,property_id,project_id,event_id,target_locations,creative")
          .in("product_type", placementTypeKey.split(","))
          .limit(4);
        if (error) throw error;
        if (!cancelled) setPlacements((data ?? []) as Placement[]);
      } catch {
        if (!cancelled) setPlacements([]);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [placementTypeKey]);

  if (!placements.length) return null;

  return (
    <section aria-label={title} className="container mx-auto px-6 py-10 md:py-14">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">SPONSORED</p><h2 className="mt-2 text-2xl font-light text-primary md:text-3xl">{title}</h2></div>
        <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:inline-flex"><Megaphone className="h-4 w-4" /> Paid placements</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {visiblePlacements.map((placement) => {
          const creative = (placement.creative && typeof placement.creative === "object" ? placement.creative : {}) as Record<string, unknown>;
          const adTitle = textValue(creative.title) || "Featured property partner";
          const description = textValue(creative.description);
          const imageUrl = textValue(creative.image_url);
          const altText = textValue(creative.alt_text) || adTitle;
          const destination = placement.destination_url
            || (placement.property_id ? "/property/" + placement.property_id : placement.project_id ? "/developments" : placement.event_id ? "/events" : "");
          if (!destination) return null;
          const external = destination.startsWith("https://");
          return (
            <a key={placement.id} href={destination} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer sponsored" : "sponsored"} className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-elegant">
              {imageUrl.startsWith("https://") ? <img src={imageUrl} alt={altText} loading="lazy" className="h-40 w-full object-cover" /> : <div className="flex h-28 items-center justify-center bg-gradient-to-br from-primary/10 via-muted to-gold/10"><Megaphone className="h-8 w-8 text-gold/80" /></div>}
              <div className="flex flex-1 flex-col p-4">
                <div className="flex flex-wrap items-center justify-between gap-2"><span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">Sponsored</span><span className="text-[10px] uppercase tracking-wide text-muted-foreground">{placement.product_type.replaceAll("_", " ")}</span></div>
                <h3 className="mt-3 line-clamp-2 font-medium text-primary">{adTitle}</h3>
                {description && <p className="mt-2 line-clamp-3 flex-1 text-sm leading-5 text-muted-foreground">{description}</p>}
                <p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground"><BadgeCheck className="h-3.5 w-3.5 text-gold" /> {placement.advertiser_name}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">Explore <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
};

export default SponsoredPlacements;
