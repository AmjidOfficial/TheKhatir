import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import About from "@/components/About";
import Portfolio from "@/components/Portfolio";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SEO from "@/components/SEO";
import SponsoredPlacements from "@/components/SponsoredPlacements";

const Index = () => {
  return (
    <div className="min-h-screen">
      <SEO
        title="Khatir Real Estate & Builders — Peshawar"
        description="Property consultancy, development and construction services in Peshawar. Browse property information and contact Khatir to confirm availability, approvals and documents."
        path="/"
      />
      <Navigation />
      <Hero />
      <SponsoredPlacements placementTypes={["homepage_placement", "promoted_business"]} title="Featured partners" />
      <Services />
      <About />
      <Portfolio />
      <Contact />
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
