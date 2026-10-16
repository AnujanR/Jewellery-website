export interface NavLink {
    label: string;
    href: string;
}

export const mainNav: {
    key: "shop" | "rates" | "sell" | "testing" | "verify" | "bespoke" | "services";
    href: string;
}[] = [
    { key: "shop", href: "/shop" },
    { key: "services", href: "/services" },
    { key: "rates", href: "/gold-rates" },
    { key: "sell", href: "/sell-gold" },
    { key: "testing", href: "/testing" },
    { key: "verify", href: "/verify" },
    { key: "bespoke", href: "/customise" },
];

export const socialLinks: (NavLink & { icon: "instagram" | "facebook" | "pinterest" | "tiktok" })[] = [
    { label: "Instagram", href: "https://instagram.com", icon: "instagram" },
    { label: "Facebook", href: "https://facebook.com", icon: "facebook" },
    { label: "Pinterest", href: "https://pinterest.com", icon: "pinterest" },
    { label: "TikTok", href: "https://tiktok.com", icon: "tiktok" },
];

export const paymentMethods = ["Visa", "Mastercard", "Amex", "PayPal", "Apple Pay", "Klarna"];

export const legalLinks: NavLink[] = [
    { label: "Terms", href: "#" },
    { label: "Privacy", href: "#" },
    { label: "Cookies", href: "#" },
];
