export type ServiceIcon = "custom" | "handwriting" | "melt";

export interface JewelleryService {
    id: string;
    title: string;
    titleEm?: string;
    summary: string;
    points: string[];
    href?: string;
    cta?: string;
    featured?: boolean;
    icon?: ServiceIcon;
}

/** In-shop services beyond the retail collection — adapted for K.T.S Jewellery, Colombo. */
export const jewelleryServices: JewelleryService[] = [
    {
        id: "forex",
        title: "Foreign exchange",
        summary:
            "Alongside fine jewellery, we offer reliable foreign exchange at the counter — competitive rates and secure handling for travel or international needs.",
        points: [
            "Buying and selling of major foreign currencies",
            "Issuance of foreign drafts",
            "Fast, secure transactions with clear rates",
        ],
    },
    {
        id: "engraving",
        title: "Engraving",
        titleEm: "hand & machine",
        summary:
            "Personalise rings, pendants and keepsakes with a message that lasts. Our artisans offer both hand and machine engraving.",
        points: [
            "Names, dates and short dedications",
            "Scripts suited to gold and silver",
            "Finished in the shop with care",
        ],
    },
    {
        id: "repair",
        title: "Repair & restoration",
        summary:
            "Bring treasured pieces back to life — from a simple clasp to a full remodel. Every job is handled with precision in Colombo.",
        points: [
            "Ring resizing and clasp replacement",
            "Stone resetting and chain repair",
            "Redesign and remodelling of existing jewellery",
        ],
    },
    {
        id: "corporate",
        title: "Corporate jewellery",
        summary:
            "Refined pieces for recognition and workplace pride — cufflinks, brooches, lapel pins and fine chains crafted with subtle brand colour or motif.",
        points: [
            "Cufflinks, brooches and lapel pins",
            "Necklaces and bracelets for staff or clients",
            "Quiet logo or symbolic detail on request",
        ],
    },
    {
        id: "custom",
        title: "Custom jewellery design",
        summary:
            "One-of-a-kind pieces shaped around your vision. Sit with our goldsmiths, refine the design, and we handcraft it for you.",
        points: [
            "Consultation on metal, stone and silhouette",
            "3D design studio for selected pieces",
            "Made in our workshop with a clear timeline",
        ],
        href: "/customise",
        cta: "Open the design studio",
        featured: true,
        icon: "custom",
    },
    {
        id: "handwriting",
        title: "Handwriting jewellery",
        summary:
            "Turn a treasured note into jewellery. From a photograph we extract the handwriting and engrave it onto a necklace, bracelet or custom piece.",
        points: [
            "Engraved from a clear photo of the writing",
            "Necklaces, bracelets or a piece you choose",
            "A keepsake for love, memory or legacy",
        ],
        featured: true,
        icon: "handwriting",
    },
    {
        id: "thali",
        title: "Gold melting & thali making",
        titleEm: "for Hindu weddings",
        summary:
            "Ponnurukkal and custom thali-making for traditional Hindu wedding preparations — ancestral gold or new, melted and crafted with purity and care.",
        points: [
            "Gold melting (ponnurukkal) in the shop",
            "Custom thali designed for the ceremony",
            "Purity checked and confirmed before work begins",
        ],
        featured: true,
        icon: "melt",
    },
];

export const serviceWhatsAppMessage = (service: JewelleryService) =>
    `Hello K.T.S Jewellery — I would like to ask about ${service.title}${service.titleEm ? ` (${service.titleEm})` : ""}.`;
