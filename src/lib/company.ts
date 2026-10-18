// Central company config — edit values here or via Visual Edits
export const COMPANY = {
  name: "Khater Property Consultant & Builders",
  shortName: "KHATER PROPERTY",
  tagline: "Khater Property Consultant & Builders",
  services: "Property Consultancy · Construction · Development Projects",
  address: "Office #17, Commercial Area, AWT Housing Scheme, Kohat Road, Peshawar",
  city: "Peshawar, Pakistan",
  
  contacts: [
    { name: "Ikhtiar Khater", phone: "+92 301 8934165", phoneRaw: "+923018934165" },
    { name: "Badam Sher", phone: "+92 300 5898080", phoneRaw: "+923005898080" },
  ],
  email: "info@khatirrealestate.com",
  whatsapp: {
    number: "923018934165",
    defaultMessage:
      "Assalam-o-Alaikum! I'm interested in Khater Property Consultant & Builders. Please share more details.",
  },
  social: {
    facebook: "https://www.facebook.com/KhaterPropertyConsultantBuilders",
    instagram: "",
    youtube: "",
    tiktok: "",
    linkedin: "",
  },
};

export const waLink = (message?: string) =>
  `https://wa.me/${COMPANY.whatsapp.number}?text=${encodeURIComponent(
    message || COMPANY.whatsapp.defaultMessage
  )}`;
