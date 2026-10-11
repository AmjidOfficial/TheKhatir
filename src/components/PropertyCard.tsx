import { MapPin, Bed, Bath, Maximize, MessageCircle } from "lucide-react";
import { Property } from "@/data/properties";
import { waLink } from "@/lib/company";

const PropertyCard = ({ property }: { property: Property }) => {
  const message = `Assalam-o-Alaikum! I'm interested in "${property.title}" (${property.location}) listed at ${property.price}. Please share more details.`;

  return (
    <article className="group overflow-hidden rounded-lg border border-border bg-card transition-all duration-500 hover:border-gold hover:shadow-elegant">
      <div className="relative overflow-hidden">
        <img
          src={property.image}
          alt={property.title}
          loading="lazy"
          className="h-72 w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
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

        <a
          href={waLink(message)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 w-full bg-[#25D366] text-white px-4 py-2.5 rounded-md font-medium hover:bg-[#1ebe57] transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          Inquire on WhatsApp
        </a>
      </div>
    </article>
  );
};

export default PropertyCard;
