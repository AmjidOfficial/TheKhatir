import Navigation from "@/components/Navigation";
import About from "@/components/About";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SEO from "@/components/SEO";

const AboutPage = () => {
  return (
    <div className="min-h-screen">
      <SEO
        title="About Khater Property Consultant & Builders | Peshawar since 2005"
        description="Learn about Khater Property Consultant & Builders — Peshawar's trusted property and construction partner since 2005."
        path="/about"
      />
      <Navigation />
      <div className="pt-20">
        <About />
      </div>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default AboutPage;
