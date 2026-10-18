import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Work from "./pages/Work";
import PropertyDetail from "./pages/PropertyDetail";
import Services from "./pages/Services";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import PropertiesAdmin from "./pages/PropertiesAdmin";
import LeadsAdmin from "./pages/LeadsAdmin";
import BusinessOpsAdmin from "./pages/BusinessOpsAdmin";
import PublicDirectory from "./pages/PublicDirectory";
import ContentDetail from "./pages/ContentDetail";
import PlatformAdmin from "./pages/PlatformAdmin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/properties" element={<PropertiesAdmin />} />
          <Route path="/dashboard/leads" element={<LeadsAdmin />} />
          <Route path="/dashboard/admin" element={<PlatformAdmin />} />
          <Route path="/dashboard/:module" element={<BusinessOpsAdmin />} />
          <Route path="/events" element={<PublicDirectory />} />
          <Route path="/developments" element={<PublicDirectory />} />
          <Route path="/guides" element={<PublicDirectory />} />
          <Route path="/guides/:slug" element={<ContentDetail />} />
          <Route path="/work" element={<Work />} />
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
