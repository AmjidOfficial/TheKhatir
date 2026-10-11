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
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(normalizedPath, SITE_URL).toString();
  const absoluteImage = image ? new URL(image, SITE_URL).toString() : undefined;
  const canonical = canonicalUrl && (canonicalUrl.startsWith("https://") || canonicalUrl.startsWith("http://")) ? canonicalUrl : url;
  const robotsContent = robots ? robots.replaceAll(",", ", ") : "index, follow, max-image-preview:large";

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robotsContent} />
      <link rel="canonical" href={canonical} />
      <meta property="og:site_name" content="Khatir Real Estate & Builders" />
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
