export type JewelleryMaterial = "Gold Vermeil" | "Solid Gold" | "Sterling Silver" | "Recycled Gold";
export type JewelleryStyle = "Hoops" | "Studs" | "Drops" | "Huggies" | "Ear Cuffs";
export type JewelleryCollection = "Classic" | "Natural Gems" | "Natural Pearls" | "Sculptural";

export interface JewelleryProduct {
    id: number;
    title: string;
    subtitle: string;
    material: JewelleryMaterial;
    style: JewelleryStyle;
    collection: JewelleryCollection;
    price: number;
    image: string;
    isNew?: boolean;
}

export interface JewelleryFeature {
    id: string;
    title: string;
    titleItalic?: string;
    description: string;
    image: string;
    href: string;
    tone: "dark" | "light";
    /** Product index in the grid that this tile is placed before */
    insertBefore: number;
    side: "left" | "right";
}

export interface JewelleryHeroLink {
    title: string;
    description: string;
    href: string;
}

const productImage = (name: string) => `/assets/img/jewellery/products/${name}.jpg`;

const productImages = [
    "classic-hoops",
    "sculptural-hoops",
    "gold-studs",
    "pearl-drops",
    "huggies",
    "ear-cuff",
    "silver-hoops",
    "gem-studs",
    "baroque-pearl",
    "moonstone-drops",
].map(productImage);

const productImageByTitle: Record<string, string> = {
    "The Bold Sun Hoops": "classic-hoops",
    "The Venus Studs": "gold-studs",
    "The Florentine Hoops": "sculptural-hoops",
    "The Lena Huggies": "huggies",
    "The Twisted Drop": "pearl-drops",
    "The Riviera Hoops": "silver-hoops",
    "The Coral Leaf Studs": "gem-studs",
    "The Molten Hoops": "sculptural-hoops",
    "The Aria Drops": "pearl-drops",
    "The Mini Pebble": "gold-studs",
    "The Opal Ear Cuff": "ear-cuff",
    "The Classic Hoops": "classic-hoops",
    "The Pearl Huggies": "huggies",
    "The Seashell Studs": "gold-studs",
    "The Luna Drops": "moonstone-drops",
    "The Chunky Hoops": "classic-hoops",
    "The Baroque Pearl": "baroque-pearl",
    "The Dome Huggies": "huggies",
    "The Wave Ear Cuff": "ear-cuff",
    "The Garnet Studs": "gem-studs",
    "The Oval Hoops": "classic-hoops",
    "The Petal Drops": "pearl-drops",
    "The Seed Pearl Studs": "baroque-pearl",
    "The Signature Hoops": "classic-hoops",
};

/** Catalogue prices in LKR. */
const baseProducts: Omit<JewelleryProduct, "id" | "image">[] = [
    { title: "The Bold Sun Hoops", subtitle: "Earrings", material: "Gold Vermeil", style: "Hoops", collection: "Classic", price: 48000, isNew: true },
    { title: "The Venus Studs", subtitle: "Earrings", material: "Solid Gold", style: "Studs", collection: "Sculptural", price: 38000 },
    { title: "The Florentine Hoops", subtitle: "Earrings · Pair", material: "Recycled Gold", style: "Hoops", collection: "Classic", price: 56000 },
    { title: "The Lena Huggies", subtitle: "Earrings", material: "Gold Vermeil", style: "Huggies", collection: "Classic", price: 34000 },
    { title: "The Twisted Drop", subtitle: "Earrings", material: "Gold Vermeil", style: "Drops", collection: "Sculptural", price: 44000 },
    { title: "The Riviera Hoops", subtitle: "Earrings · Pair", material: "Sterling Silver", style: "Hoops", collection: "Classic", price: 36000 },
    { title: "The Coral Leaf Studs", subtitle: "Earrings", material: "Recycled Gold", style: "Studs", collection: "Natural Gems", price: 52000, isNew: true },
    { title: "The Molten Hoops", subtitle: "Earrings", material: "Gold Vermeil", style: "Hoops", collection: "Sculptural", price: 50000 },
    { title: "The Aria Drops", subtitle: "Earrings", material: "Solid Gold", style: "Drops", collection: "Natural Pearls", price: 72000 },
    { title: "The Mini Pebble", subtitle: "Earrings", material: "Sterling Silver", style: "Studs", collection: "Sculptural", price: 26000 },
    { title: "The Opal Ear Cuff", subtitle: "Ear Cuff · Single", material: "Gold Vermeil", style: "Ear Cuffs", collection: "Natural Gems", price: 30000 },
    { title: "The Classic Hoops", subtitle: "Earrings · Pair", material: "Recycled Gold", style: "Hoops", collection: "Classic", price: 46000 },
    { title: "The Pearl Huggies", subtitle: "Earrings", material: "Gold Vermeil", style: "Huggies", collection: "Natural Pearls", price: 39000, isNew: true },
    { title: "The Seashell Studs", subtitle: "Earrings", material: "Solid Gold", style: "Studs", collection: "Sculptural", price: 60000 },
    { title: "The Luna Drops", subtitle: "Earrings", material: "Sterling Silver", style: "Drops", collection: "Natural Gems", price: 42000 },
    { title: "The Chunky Hoops", subtitle: "Earrings · Pair", material: "Gold Vermeil", style: "Hoops", collection: "Classic", price: 54000 },
    { title: "The Baroque Pearl", subtitle: "Earrings", material: "Recycled Gold", style: "Drops", collection: "Natural Pearls", price: 64000 },
    { title: "The Dome Huggies", subtitle: "Earrings", material: "Solid Gold", style: "Huggies", collection: "Classic", price: 68000 },
    { title: "The Wave Ear Cuff", subtitle: "Ear Cuff · Single", material: "Sterling Silver", style: "Ear Cuffs", collection: "Sculptural", price: 22000 },
    { title: "The Garnet Studs", subtitle: "Earrings", material: "Gold Vermeil", style: "Studs", collection: "Natural Gems", price: 35000 },
    { title: "The Oval Hoops", subtitle: "Earrings · Pair", material: "Recycled Gold", style: "Hoops", collection: "Classic", price: 51000 },
    { title: "The Petal Drops", subtitle: "Earrings", material: "Gold Vermeil", style: "Drops", collection: "Sculptural", price: 45000 },
    { title: "The Seed Pearl Studs", subtitle: "Earrings", material: "Sterling Silver", style: "Studs", collection: "Natural Pearls", price: 28000 },
    { title: "The Signature Hoops", subtitle: "Earrings · Pair", material: "Solid Gold", style: "Hoops", collection: "Classic", price: 84000 },
];

export const jewelleryProducts: JewelleryProduct[] = baseProducts.map((product, index) => ({
    ...product,
    id: index + 1,
    image: productImageByTitle[product.title]
        ? productImage(productImageByTitle[product.title])
        : productImages[index % productImages.length],
}));

export const getJewelleryProduct = (id: number | string) =>
    jewelleryProducts.find((product) => product.id === Number(id));

export const defaultFinish = (product: JewelleryProduct) =>
    product.material === "Sterling Silver" ? "Silver" : "Gold";

export const defaultOption = (product: JewelleryProduct) =>
    product.style === "Ear Cuffs" ? null : "Pair";

export const getJewelleryGallery = (product: JewelleryProduct) => {
    const start = Math.max(0, productImages.indexOf(product.image));
    return Array.from({ length: 4 }, (_, i) => productImages[(start + i) % productImages.length]);
};

export const getRelatedJewellery = (product: JewelleryProduct, count = 4) => {
    const sameCollection = jewelleryProducts.filter(
        (p) => p.id !== product.id && p.collection === product.collection
    );
    const others = jewelleryProducts.filter(
        (p) => p.id !== product.id && p.collection !== product.collection
    );
    return [...sameCollection, ...others].slice(0, count);
};

const collectionStories: Record<JewelleryCollection, string> = {
    Classic: "Part of our Classic collection – pieces designed to be worn every day and layered with everything you own.",
    "Natural Gems": "Part of our Natural Gems collection – each stone is ethically sourced and hand-set, so no two pieces are exactly alike.",
    "Natural Pearls": "Part of our Natural Pearls collection – freshwater pearls chosen for their soft lustre and organic shape.",
    Sculptural: "Part of our Sculptural collection – organic forms cast from hand-carved wax models in our studio.",
};

const styleSizes: Record<JewelleryStyle, string> = {
    Hoops: "Outer diameter 28mm, thickness 4mm. Hinged click-top closure.",
    Studs: "Approx. 10mm × 8mm. Butterfly backs included.",
    Drops: "Total drop 32mm from the lobe. Hook fastening.",
    Huggies: "Inner diameter 9mm – sits close to the lobe. Hinged closure.",
    "Ear Cuffs": "Adjustable, fits most ears. No piercing required.",
};

const materialCare: Record<JewelleryMaterial, string> = {
    "Gold Vermeil": "18k gold vermeil – a thick layer of gold over recycled sterling silver. Remove before swimming or showering and store in the pouch provided.",
    "Solid Gold": "14k solid recycled gold. Built to last a lifetime – polish gently with a soft cloth to restore its shine.",
    "Sterling Silver": "Recycled 925 sterling silver. Silver naturally oxidises over time; polish with a silver cloth to brighten.",
    "Recycled Gold": "Recycled 18k gold plating over sterling silver. Avoid perfumes and lotions to keep the finish bright.",
};

export const getJewelleryDetails = (product: JewelleryProduct) => ({
    description: `${product.title.replace(/^The /, "")} in ${product.material.toLowerCase()}. ${collectionStories[product.collection]}`,
    size: styleSizes[product.style],
    care: materialCare[product.material],
    shipping:
        "Enquire about this piece and we’ll confirm today’s price on WhatsApp — pay in store or by bank transfer, then collect in Colombo. Sizing and fitting available in the shop.",
});

export const jewelleryFeatures: JewelleryFeature[] = [
    {
        id: "classic",
        title: "Classic",
        titleItalic: "Collection",
        description: "Timeless hoops and studs, hand-finished in recycled gold for everyday wear.",
        image: "/assets/img/jewellery/collection-earrings.jpg",
        href: "/shop",
        tone: "dark",
        insertBefore: 4,
        side: "right",
    },
    {
        id: "gems",
        title: "Natural",
        titleItalic: "Gems",
        description: "Ethically sourced stones set by hand, each one unique in colour and character.",
        image: "/assets/img/jewellery/promo-soltaire.jpg",
        href: "/shop",
        tone: "dark", 
        insertBefore: 12,
        side: "left",
    },
    {
        id: "pearls",
        title: "Natural Pearls",
        titleItalic: "Timeless Beauty",
        description: "Freshwater pearls paired with gold vermeil for a soft, luminous finish.",
        image: "/assets/img/jewellery/story-natural-lk.jpg",
        href: "/shop",
        tone: "light",
        insertBefore: 18,
        side: "right",
    },
];

export const jewelleryHeroLinks: JewelleryHeroLink[] = [
    { title: "Hoops", description: "Bold, sculpted and everyday hoops", href: "/shop" },
    { title: "Earrings", description: "Studs, drops and statement pieces", href: "/shop" },
    { title: "Rings", description: "Stackable bands and signet rings", href: "/shop" },
    { title: "Necklaces", description: "Delicate chains and pendants", href: "/shop" },
    { title: "Bracelets", description: "Bangles, cuffs and fine chains", href: "/shop" },
    { title: "Collections", description: "Classic, Gems, Pearls & Sculptural", href: "/shop" },
];

export const jewelleryMaterials: JewelleryMaterial[] = ["Gold Vermeil", "Solid Gold", "Sterling Silver", "Recycled Gold"];
export const jewelleryStyles: JewelleryStyle[] = ["Hoops", "Studs", "Drops", "Huggies", "Ear Cuffs"];
export const jewelleryCollections: JewelleryCollection[] = ["Classic", "Natural Gems", "Natural Pearls", "Sculptural"];

export const jewelleryPriceRanges = [
    { label: "Under Rs 30,000", min: 0, max: 30000 },
    { label: "Rs 30,000 – 50,000", min: 30000, max: 50000 },
    { label: "Rs 50,000 – 70,000", min: 50000, max: 70000 },
    { label: "Rs 70,000+", min: 70000, max: Infinity },
];
