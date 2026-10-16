import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import About from "@/components/About";
import Portfolio from "@/components/Portfolio";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SEO from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen">
      <SEO
        title="Khater Property Consultant & Builders — Peshawar"
        description="Trusted property dealers and builders in Peshawar. Verified houses, plots and commercial properties — consultancy, construction and projects."
        path="/"
      />
      <Navigation />
      <Hero />
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
