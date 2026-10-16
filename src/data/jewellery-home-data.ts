export interface HomeImageCard {
    title: string;
    text?: string;
    image: string;
    href: string;
}

export const homeHero = {
    title: "Golden Legacy",
    images: [
        "/assets/img/jewellery/home-hero-saree.jpg",
        "/assets/img/jewellery/home-hero-model.jpg",
        "/assets/img/jewellery/home-hero-model-osariya.jpg",

    ],
    cards: [
        {
            eyebrow: "New season",
            title: "The Gift of Strength",
            text: "Bold sculptural hoops cast in recycled gold – made to be passed down.",
            cta: "Shop now",
            href: "/shop",
        },
        {
            eyebrow: "The edit",
            title: "Discover the Collection",
            text: "Statement earrings, stacking rings and fine chains for every day.",
            cta: "Explore",
            href: "/shop",
        },
    ],
};

export const homeCollections: HomeImageCard[] = [
    { title: "Rings", image: "/assets/img/jewellery/collection-rings.jpg", href: "/shop" },
    { title: "Necklaces", image: "/assets/img/jewellery/collection-necklaces.jpg", href: "/shop" },
    { title: "Bracelets", image: "/assets/img/jewellery/collection-bracelets.jpg", href: "/shop" },
    { title: "Earrings", image: "/assets/img/jewellery/collection-earrings.jpg", href: "/shop" },
];

export const homeLovedPromo = {
    eyebrow: "The",
    title: "Solitaire",
    titleItalic: "Edit",
    text: "Timeless single-stone rings, hand-set in solid gold.",
    image: "/assets/img/jewellery/story-statement-v2.jpg",
    href: "/shop",
};

/** Product ids from jewellery-data shown in "Most loved designs" */
export const homeLovedProductIds = [9, 24];

export const homeStories: HomeImageCard[] = [
    {
        title: "Natural Jewellery",
        text: "Pearls, shells and raw stones shaped by nature, finished by hand in our studio.",
        image: "/assets/img/jewellery/story-natural-theme.jpg",
        href: "/shop",
    },
    {
        title: "Sophisticated Statements",
        text: "Sculptural pieces designed to be noticed – bold silhouettes in warm recycled gold.",
        image: "/assets/img/jewellery/story-statement-theme.jpg",
        href: "/shop",
    },
    {
        title: "Everyday Engagement",
        text: "Delicate bands and solitaires you will never want to take off.",
        image: "/assets/img/jewellery/story-engagement-theme.jpg",
        href: "/shop",
    },
];

export const homeFeatureStories: HomeImageCard[] = [
    {
        title: "For Him",
        text: "Signet rings, chains and cuffs with a quiet, confident edge.",
        image: "/assets/img/jewellery/feature-him-theme.jpg",
        href: "/shop",
    },
    {
        title: "Gold Bangles",
        text: "Stack them, mix them, wear them forever.",
        image: "/assets/img/jewellery/feature-bangles-theme.jpg",
        href: "/shop",
    },
];

export const homeBenefits = [
    {
        icon: "gem",
        title: "Ethically Sourced Materials",
        text: "Recycled gold and silver, and conflict-free stones traced to their origin.",
    },
    {
        icon: "box",
        title: "Enquire & Collect",
        text: "Enquire about a piece, confirm the price on WhatsApp, then pay in store or by transfer and collect in Colombo.",
    },
    {
        icon: "shield",
        title: "Lifetime Guarantee",
        text: "Every piece is guaranteed against manufacturing defects – for life.",
    },
] as const;

export const homePurpose = {
    eyebrow: "Colombo",
    title: "Contact us",
    text: "Message us on WhatsApp for rates, jewellery, or a question. Visit the shop when you need a purity test or to sell or exchange old gold.",
    cta: "Chat on WhatsApp",
    href: "/testing",
    image: "/assets/img/jewellery/purpose-hero-v2.jpg",
    gallery: [
        { title: "Book a purity test", image: "/assets/img/jewellery/purpose-testing-v2.jpg" },
        { title: "Sell old gold", image: "/assets/img/jewellery/purpose-sell-v2.jpg" },
    ],
};
