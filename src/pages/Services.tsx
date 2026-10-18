import Navigation from "@/components/Navigation";
import Services from "@/components/Services";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SEO from "@/components/SEO";

const ServicesPage = () => {
  return (
    <div className="min-h-screen">
      <SEO
        title="Services — Consultancy, Construction & Projects | Khater Property Consultant & Builders"
        description="End-to-end real estate services in Peshawar: property consultancy, turn-key construction and project development by Khater Property Consultant & Builders."
        path="/services"
      />
      <Navigation />
      <section className="pt-32 pb-16 bg-background">
        <div className="container mx-auto px-6 max-w-7xl">
          <p className="text-minimal text-gold mb-4">OUR SERVICES</p>
          <h1 className="text-5xl md:text-7xl font-light text-architectural text-primary mb-6">
            Consultancy · Construction · <span className="text-gold">Projects</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Whether you're investing in a plot, buying your dream home, or building from scratch —
            Khater Property Consultant &amp; Builders handles every step end-to-end.
          </p>
        </div>
      </section>
      <Services />
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default ServicesPage;
