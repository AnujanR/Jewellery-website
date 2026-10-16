import { BRAND_NAME } from "@/constant/brand";

/** Shop WhatsApp. Digits only, country code included, no plus sign. */
export const WHATSAPP_E164 = "94770000000";
export const WHATSAPP_DISPLAY = "+94 77 000 0000";
export const SHOP_PLACE = "Colombo";
export const SHOP_EMAIL = "hello@ktsjewellery.lk";
export const SHOP_ADDRESS_LINES = [
    "K.T.S Jewellery",
    "42 Galle Road",
    "Colombo 03",
    "Sri Lanka",
] as const;
export const SHOP_HOURS = [
    { day: "Monday – Saturday", time: "10:00 – 18:30" },
    { day: "Sunday", time: "10:00 – 14:00" },
] as const;

export function whatsappHref(message: string) {
    return `https://wa.me/${WHATSAPP_E164}?text=${encodeURIComponent(message)}`;
}

export const whatsappGreeting = `Hello ${BRAND_NAME}`;
