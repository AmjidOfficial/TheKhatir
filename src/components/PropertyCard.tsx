import { MapPin, Bed, Bath, Maximize, MessageCircle, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Property } from "@/data/properties";
import { waLink } from "@/lib/company";

const PropertyCard = ({ property }: { property: Property }) => {
  const message = `Assalam-o-Alaikum! I'm interested in "${property.title}" (${property.location}) listed at ${property.price}. Please share more details.`;

  return (
    <article className="group overflow-hidden rounded-lg border border-border bg-card transition-all duration-500 hover:border-gold hover:shadow-elegant">
      <div className="relative overflow-hidden">
        {property.image ? (
          <img
            src={property.image}
            alt={property.title}
            loading="lazy"
            className="h-72 w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-72 w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-primary/10 via-muted to-gold/10 text-muted-foreground">
            <Building2 aria-hidden="true" className="h-12 w-12 text-gold/80" />
            <span className="text-xs font-medium uppercase tracking-widest">Listing photo not provided</span>
          </div>
        )}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {property.isSample && (
            <span className="rounded bg-amber-100 px-3 py-1 text-xs font-semibold tracking-wider text-amber-950">
              SAMPLE ONLY
            </span>
          )}
          <span className="bg-gold text-gold-foreground px-3 py-1 text-xs font-semibold tracking-wider rounded">
            {property.status}
          </span>
          <span className="bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold tracking-wider rounded">
            {property.category}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-medium text-primary mb-1">{property.title}</h3>
        <p className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
          <MapPin className="h-4 w-4 text-gold" />
          {property.location}
        </p>

        <p className="text-2xl font-light text-gold mb-2">{property.price}</p>
        {property.isSample && (
          <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
            Illustrative example only. Price and availability have not been confirmed.
          </p>
        )}

        <div className="flex items-center gap-5 text-sm text-muted-foreground mb-4 pb-4 border-b border-border">
          {property.beds !== undefined && (
            <span className="flex items-center gap-1.5">
              <Bed className="h-4 w-4" /> {property.beds}
            </span>
          )}
          {property.baths !== undefined && (
            <span className="flex items-center gap-1.5">
              <Bath className="h-4 w-4" /> {property.baths}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Maximize className="h-4 w-4" /> {property.area}
          </span>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-5 line-clamp-2">
          {property.description}
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            to={`/property/${property.id}`}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-border px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:border-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
          >
            View details
          </Link>
          <a
            href={waLink(message)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#25D366] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1ebe57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
};

export default PropertyCard;
