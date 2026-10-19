import { Helmet } from "react-helmet-async";
import { COMPANY } from "@/lib/company";

const SITE_URL = "https://khatir.netlify.app";
const DEFAULT_DESCRIPTION = "Property consultancy, real estate, construction and development services in Peshawar, Pakistan. Contact Khatir Property Consultant & Builders for local guidance.";

interface SEOProps {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  image?: string;
  jsonLd?: Record<string, unknown>;
  robots?: string;
  canonicalUrl?: string;
}

const SEO = ({ title, description, path, type = "website", image, jsonLd, robots, canonicalUrl }: SEOProps) => {
  const normalizedPath = path.startsWith("/") ? path : "/" + path;
  const safeHttpUrl = (value?: string) => {
    if (!value) return undefined;
    try {
      const parsed = new URL(value, SITE_URL);
      return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : undefined;
    } catch {
      return undefined;
    }
  };
  const url = safeHttpUrl(normalizedPath) ?? SITE_URL;
  const absoluteImage = safeHttpUrl(image) ?? safeHttpUrl("/favicon.png");
  const canonical = safeHttpUrl(canonicalUrl) ?? url;
  const robotsContent = robots ? robots.replaceAll(",", ", ") : "index, follow, max-image-preview:large";
  const cleanDescription = description.trim() || DEFAULT_DESCRIPTION;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={cleanDescription} />
      <meta name="robots" content={robotsContent} />
      <link rel="canonical" href={canonical} />
      <meta property="og:site_name" content={COMPANY.name} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={cleanDescription} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content="en_PK" />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:image:alt" content={COMPANY.name} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={cleanDescription} />
      <meta name="twitter:image" content={absoluteImage} />
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
};

export default SEO;
