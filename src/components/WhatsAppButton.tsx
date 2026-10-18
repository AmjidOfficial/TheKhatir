import { MessageCircle } from "lucide-react";
import { waLink } from "@/lib/company";

const WhatsAppButton = () => {
  return (
    <a
      href={waLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-4 right-4 z-50 flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-full bg-[#25D366] p-3 text-white shadow-architectural transition-transform duration-300 hover:scale-105 hover:shadow-gold sm:bottom-6 sm:right-6 sm:px-5 sm:py-4"
    >
      <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
      <span className="hidden text-sm font-medium tracking-wide sm:inline">
        Chat on WhatsApp
      </span>
    </a>
  );
};

export default WhatsAppButton;
