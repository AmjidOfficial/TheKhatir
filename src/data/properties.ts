import p1 from "@/assets/property-1.jpg";
import p2 from "@/assets/property-2.jpg";
import p3 from "@/assets/property-3.jpg";
import c1 from "@/assets/project-construction-1.jpg";
import c2 from "@/assets/project-construction-2.jpg";

export interface Property {
  id: string;
  isSample?: boolean;
  image: string;
  title: string;
  location: string;
  category: "HOUSE" | "PLOT" | "COMMERCIAL" | "APARTMENT";
  status: "FOR SALE" | "FOR RENT" | "SOLD";
  price: string;
  beds?: number;
  baths?: number;
  area: string;
  description: string;
}

export const properties: Property[] = [
  {
    id: "awt-villa-10marla",
    isSample: true,
    image: p1,
    title: "Modern 10 Marla Villa",
    location: "AWT Housing Scheme, Kohat Road, Peshawar",
    category: "HOUSE",
    status: "FOR SALE",
    price: "PKR 4.5 Crore",
    beds: 5,
    baths: 6,
    area: "10 Marla",
    description:
      "Brand new double-story villa with premium finishes, attached baths, modern kitchen, and landscaped lawn.",
  },
  {
    id: "kohat-road-plaza",
    isSample: true,
    image: p2,
    title: "Commercial Plaza — Ground + 3",
    location: "Commercial Area, Kohat Road, Peshawar",
    category: "COMMERCIAL",
    status: "FOR SALE",
    price: "PKR 12 Crore",
    area: "8 Marla",
    description:
      "Prime commercial plaza on main Kohat Road. Ground floor shops, three upper floors of office space. Excellent rental yield.",
  },
  {
    id: "awt-plot-7marla",
    isSample: true,
    image: p3,
    title: "Residential Plot — 7 Marla",
    location: "AWT Phase II, Peshawar",
    category: "PLOT",
    status: "FOR SALE",
    price: "PKR 95 Lakh",
    area: "7 Marla",
    description:
      "Corner plot in a developed block. Ready for construction. All utilities available, possession on file.",
  },
  {
    id: "hayatabad-apartment",
    isSample: true,
    image: c2,
    title: "Luxury 3-Bed Apartment",
    location: "Hayatabad Phase 6, Peshawar",
    category: "APARTMENT",
    status: "FOR RENT",
    price: "PKR 85,000 / month",
    beds: 3,
    baths: 3,
    area: "1,800 sq ft",
    description:
      "Fully furnished apartment with marble floors, double-height living, and premium kitchen. Secure complex with parking.",
  },
  {
    id: "awt-villa-1kanal",
    isSample: true,
    image: c1,
    title: "1 Kanal Custom Built Home",
    location: "AWT Housing Scheme, Peshawar",
    category: "HOUSE",
    status: "FOR SALE",
    price: "PKR 9 Crore",
    beds: 6,
    baths: 7,
    area: "1 Kanal",
    description:
      "Spacious family home with separate guest wing, drawing/dining, modern kitchen, and beautifully landscaped lawn.",
  },
  {
    id: "kohat-road-shop",
    isSample: true,
    image: p2,
    title: "Ground Floor Shop",
    location: "Main Kohat Road, Peshawar",
    category: "COMMERCIAL",
    status: "FOR RENT",
    price: "PKR 1.2 Lakh / month",
    area: "400 sq ft",
    description:
      "High-footfall commercial shop on main road. Glass front, attached storage, washroom. Perfect for retail or office.",
  },
];
