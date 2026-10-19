import PropertyCard from "@/components/PropertyCard";
import { Link } from "react-router-dom";
import { properties } from "@/data/properties";

const Portfolio = () => {
  const featured = properties.slice(0, 3);
  return (
    <section id="work" className="py-32 bg-muted/40">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h2 className="text-minimal text-gold mb-4">FEATURED LISTINGS</h2>
              <h3 className="text-4xl md:text-6xl font-light text-architectural text-primary">
                Featured Properties
              </h3>
            </div>
            <Link
              to="/work"
              className="text-minimal text-primary hover:text-gold transition-colors"
            >
              VIEW ALL PROPERTIES →
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featured.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
