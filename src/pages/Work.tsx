import { useEffect, useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Search, RotateCcw } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import PropertyCard from "@/components/PropertyCard";
import SEO from "@/components/SEO";
import { properties as sampleProperties, type Property } from "@/data/properties";
import { getSupabaseClient, isSupabaseConfigured } from "@/integrations/supabase/client";
import { mapMarketplaceProperty, type MarketplaceProperty } from "@/lib/property-mapper";
import SponsoredPlacements from "@/components/SponsoredPlacements";

const categories = ["ALL", "HOUSE", "PLOT", "COMMERCIAL", "APARTMENT"] as const;
const statuses = ["ANY", "FOR SALE", "FOR RENT"] as const;

const Work = () => {
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>("ALL");
  const [activeStatus, setActiveStatus] = useState<(typeof statuses)[number]>("ANY");
  const [searchQuery, setSearchQuery] = useState("");
  const [listingProperties, setListingProperties] = useState<Property[]>(isSupabaseConfigured ? [] : sampleProperties);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [loadError, setLoadError] = useState("");
  const usingSamples = !isSupabaseConfigured;

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    const loadListings = async () => {
      try {
        const client = getSupabaseClient() as unknown as SupabaseClient;
        const { data, error } = await client.from("marketplace_properties").select(
          "id,reference_code,title,description,listing_type,intent,price,currency,price_period,area_value,area_unit,bedrooms,bathrooms,province,city,locality,society,block_sector"
        );
        if (error) throw error;
        if (!cancelled) setListingProperties(((data ?? []) as unknown as MarketplaceProperty[]).map(mapMarketplaceProperty));
      } catch {
        if (!cancelled) {
          setListingProperties([]);
          setLoadError("Live property listings could not be loaded. Please try again later or contact Khatir.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void loadListings();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    return listingProperties.filter((property) => {
      const categoryMatches = activeCategory === "ALL" || property.category === activeCategory;
      const statusMatches = activeStatus === "ANY" || property.status === activeStatus;
      const searchableText = [
        property.title,
        property.location,
        property.area,
        property.category,
        property.description,
      ].join(" ").toLocaleLowerCase();
      const queryMatches = !query || searchableText.includes(query);
      return categoryMatches && statusMatches && queryMatches;
    });
  }, [activeCategory, activeStatus, searchQuery, listingProperties]);

  const resetFilters = () => {
    setActiveCategory("ALL");
    setActiveStatus("ANY");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Properties for Sale & Rent in Peshawar | Khatir"
        description="Explore houses, plots, apartments and commercial property opportunities in Peshawar. Contact Khatir to confirm current availability, price and documents."
        path="/work"
        robots={usingSamples || (isSupabaseConfigured && listingProperties.length === 0) ? "noindex,follow" : undefined}
      />
      <Navigation />

      <section className="pt-32 pb-12">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <p className="text-minimal text-gold mb-4">PROPERTY COLLECTION</p>
            <h1 className="text-5xl md:text-7xl font-light text-architectural text-primary mb-6">
              Find your next <span className="text-gold">opportunity.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              Explore property opportunities across Peshawar. Prices and availability can change, so please
              confirm the latest details and property documents with our team before making a decision.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-10">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto rounded-2xl border border-border bg-card p-5 md:p-7 space-y-6">
            <div className="space-y-2">
              <label htmlFor="property-search" className="text-sm font-medium text-primary">
                Search by property, area or location
              </label>
              <div className="relative">
                <Search aria-hidden="true" className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="property-search"
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Try Hayatabad, AWT, Kohat Road, house..."
                  className="w-full rounded-xl border border-border bg-background py-3.5 pl-12 pr-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-gold focus:ring-2 focus:ring-gold/20"
                />
              </div>
            </div>

            <fieldset className="space-y-3">
              <legend className="mb-3 text-sm font-medium text-primary">Property type</legend>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    aria-pressed={activeCategory === category}
                    onClick={() => setActiveCategory(category)}
                    className={`min-h-10 rounded-full px-4 py-2 text-xs tracking-wider font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 ${
                      activeCategory === category
                        ? "bg-primary text-primary-foreground"
                        : "border border-border text-muted-foreground hover:border-gold hover:text-primary"
                    }`}
                  >
                    {category === "ALL" ? "All types" : category}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <fieldset className="space-y-3">
                <legend className="mb-3 text-sm font-medium text-primary">Listing type</legend>
                <div className="flex flex-wrap gap-2">
                  {statuses.map((status) => (
                    <button
                      key={status}
                      type="button"
                      aria-pressed={activeStatus === status}
                      onClick={() => setActiveStatus(status)}
                      className={`min-h-10 rounded-full px-4 py-2 text-xs tracking-wider font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 ${
                        activeStatus === status
                          ? "bg-gold text-gold-foreground"
                          : "border border-border text-muted-foreground hover:border-gold hover:text-primary"
                      }`}
                    >
                      {status === "ANY" ? "Sale & rent" : status}
                    </button>
                  ))}
                </div>
              </fieldset>
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-gold hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 sm:self-auto"
              >
                <RotateCcw aria-hidden="true" className="h-4 w-4" />
                Reset filters
              </button>
            </div>
          </div>
        </div>
      </section>

      <SponsoredPlacements placementTypes={["featured_property", "sponsored_search", "area_placement"]} title="Sponsored property opportunities" />

      <section className="pb-28 md:pb-32">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground" aria-live="polite">
                {loading ? "Loading current listings…" : <><span className="font-semibold text-primary">{filtered.length}</span>{" "}{filtered.length === 1 ? "property" : "properties"} found</>}
              </p>
            </div>
            {loadError && <div role="alert" className="mb-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">{loadError}</div>}
            {usingSamples && <div role="status" className="mb-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">This preview uses illustrative SAMPLE ONLY listings because live inventory is not connected. Prices and availability are not confirmed offers.</div>}
            {loading ? (
              <div className="rounded-2xl border border-border bg-card px-6 py-16 text-center text-muted-foreground">Loading verified property listings…</div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card px-6 py-16 text-center">
                <h2 className="text-2xl font-medium text-primary">No matching properties yet</h2>
                <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                  Try a different location or property type, or contact our team and tell us what you are looking for.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {filtered.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Work;
