import { Helmet } from "react-helmet-async";

const SITE_URL = "https://khatir.netlify.app";

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
  const absoluteImage = safeHttpUrl(image);
  const canonical = safeHttpUrl(canonicalUrl) ?? url;
  const robotsContent = robots ? robots.replaceAll(",", ", ") : "index, follow, max-image-preview:large";

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robotsContent} />
      <link rel="canonical" href={canonical} />
      <meta property="og:site_name" content="Khater Property Consultant & Builders" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content="en_PK" />
      <meta name="twitter:card" content={absoluteImage ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {absoluteImage && <meta property="og:image" content={absoluteImage} />}
      {absoluteImage && <meta name="twitter:image" content={absoluteImage} />}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
};

export default SEO;
