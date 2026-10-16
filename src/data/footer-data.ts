import { FooterSectionDT } from "@/types/custom-dt";

export const QUICK_LINKS = [
    "About",
    "Who we are",
    "Services",
    "Projects",
    "Blog",
    "Pricing",
    "Contact Us",
];

export const SOCIAL_LINKS = [
    "Facebook",
    "Twitter",
    "Dribbble",
    "Instagram",
    "YouTube",
];

export const OFFICE_LOCATIONS = [
    "New York",
    "France",
    "German",
    "Italy",
    "Mexico",
];

//shop footer section data
export const footerMenuData: FooterSectionDT[] = [
    {
        id: 1,
        title: "SHOP",
        delay: ".3",
        links: [
            { label: "Rings", href: "/shop" },
            { label: "Necklaces", href: "/shop" },
            { label: "Bracelets", href: "/shop" },
            { label: "Earrings", href: "/shop" },
        ],
    },
    {
        id: 2,
        title: "COLLECTIONS",
        delay: ".5",
        links: [
            { label: "Classic", href: "/shop" },
            { label: "Natural Gems", href: "/shop" },
            { label: "Natural Pearls", href: "/shop" },
            { label: "Sculptural", href: "/shop" },
        ],
    },
    {
        id: 3,
        title: "ABOUT",
        delay: ".7",
        links: [
            { label: "Our Story", href: "/about-us" },
            { label: "Sustainability", href: "#" },
            { label: "Jewellery Care", href: "#" },
            { label: "Journal", href: "/blog" },
        ],
    },
    {
        id: 4,
        title: "HELP",
        delay: ".9",
        links: [
            { label: "Contact", href: "/contact-us" },
            { label: "Delivery & Returns", href: "#" },
            { label: "Ring Size Guide", href: "#" },
            { label: "Privacy Policy", href: "#" },
        ],
    },
];
