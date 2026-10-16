import type { Locale } from "@/i18n/types";

/**
 * Shop board rates in LKR.
 * Buy = what the shop pays for old gold. Sell = what the shop charges.
 * A Sri Lankan sovereign is 8 grams.
 * Replace these figures from the admin screen later.
 */
export const SOVEREIGN_GRAMS = 8;

export const goldRates = {
    updatedAt: "2026-10-12T09:00:00+05:30",
    k24: { buyPerGram: 50400, sellPerGram: 52800 },
    k22: { buyPerGram: 46200, sellPerGram: 48400 },
} as const;

export const CARATS = [24, 22, 21, 18, 14] as const;
export type Carat = (typeof CARATS)[number];

const MONTHS: Record<Locale, string[]> = {
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    si: ["ජනවාරි", "පෙබරවාරි", "මාර්තු", "අප්‍රේල්", "මැයි", "ජූනි", "ජූලි", "අගෝස්තු", "සැප්තැම්බර්", "ඔක්තෝබර්", "නොවැම්බර්", "දෙසැම්බර්"],
    ta: ["ஜனவரி", "பிப்ரவரி", "மார்ச்", "ஏப்ரல்", "மே", "ஜூன்", "ஜூலை", "ஆகஸ்ட்", "செப்டம்பர்", "அக்டோபர்", "நவம்பர்", "டிசம்பர்"],
};

/** Colombo calendar parts. en-GB numeric output matches in Node and the browser. */
function colomboParts(iso: string) {
    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Colombo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).formatToParts(new Date(iso));
    const read = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
    return {
        year: read("year"),
        month: Number(read("month")),
        day: String(Number(read("day"))),
        hour: read("hour"),
        minute: read("minute"),
    };
}

export function formatLkr(amount: number, locale: Locale) {
    const n = new Intl.NumberFormat("en-LK", { maximumFractionDigits: 0 }).format(Math.round(amount));
    if (locale === "si") return `රු. ${n}`;
    if (locale === "ta") return `ரூ. ${n}`;
    return `Rs ${n}`;
}

export function formatGrams(grams: number) {
    return `${grams.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} g`;
}

export function formatBoardStamp(iso: string, locale: Locale) {
    const { day, month, year, hour, minute } = colomboParts(iso);
    return `${day} ${MONTHS[locale][month - 1]} ${year}, ${hour}:${minute}`;
}

export function formatTestDate(iso: string, locale: Locale) {
    const { day, month, year } = colomboParts(iso);
    return `${day} ${MONTHS[locale][month - 1]} ${year}`;
}

export function sovereignPrice(perGram: number) {
    return perGram * SOVEREIGN_GRAMS;
}

/** Indicative amount the shop would pay, before the in-shop test. */
export function indicativeBuy(grams: number, carat: number) {
    if (carat === 24) return { total: grams * goldRates.k24.buyPerGram, perGram: goldRates.k24.buyPerGram, basis: "board" as const };
    if (carat === 22) return { total: grams * goldRates.k22.buyPerGram, perGram: goldRates.k22.buyPerGram, basis: "board" as const };
    const perGram = (carat / 24) * goldRates.k24.buyPerGram;
    return { total: grams * perGram, perGram, basis: "scaled" as const };
}
