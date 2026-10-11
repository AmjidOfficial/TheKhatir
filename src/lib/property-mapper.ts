import type { Property } from "@/data/properties";

export type MarketplaceProperty = {
  id: string;
  reference_code: string;
  title: string;
  description: string | null;
  listing_type: string;
  intent: string;
  price: number | null;
  currency: string | null;
  price_period: string | null;
  area_value: number | null;
  area_unit: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  province: string | null;
  city: string | null;
  locality: string | null;
  society: string | null;
  block_sector: string | null;
};

const categoryFor = (listingType: string): Property["category"] => {
  if (listingType === "house") return "HOUSE";
  if (listingType === "plot" || listingType === "land") return "PLOT";
  if (listingType === "apartment") return "APARTMENT";
  if (["commercial", "shop", "office", "warehouse"].includes(listingType)) return "COMMERCIAL";
  return "OTHER";
};

const areaUnitLabel: Record<string, string> = {
  sq_ft: "sq ft",
  sq_yd: "sq yd",
  marla: "Marla",
  kanal: "Kanal",
  acre: "Acre",
};

export function mapMarketplaceProperty(row: MarketplaceProperty): Property {
  const currency = row.currency || "PKR";
  let price = "Price on request";
  if (row.price !== null) {
    try {
      price = new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(row.price);
    } catch {
      price = currency + " " + new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 }).format(row.price);
    }
  }
  if (row.price_period && row.intent === "rent") {
    price += " / " + row.price_period;
  }

  const area = row.area_value === null
    ? "Area not specified"
    : String(row.area_value) + " " + (areaUnitLabel[row.area_unit || ""] || row.area_unit || "");

  return {
    id: row.id,
    isSample: false,
    image: "",
    title: row.title,
    location: [row.locality, row.society, row.block_sector, row.city, row.province].filter(Boolean).join(", "),
    category: categoryFor(row.listing_type),
    status: row.intent === "rent" || row.intent === "lease" ? "FOR RENT" : "FOR SALE",
    price,
    beds: row.bedrooms ?? undefined,
    baths: row.bathrooms ?? undefined,
    area,
    description: row.description || "Contact Khatir to confirm the current property details.",
  };
}
