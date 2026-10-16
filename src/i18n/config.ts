import type { Locale } from "./types";

export const LOCALE_COOKIE = "kts-locale";

export function parseLocale(value: string | undefined | null): Locale {
    if (value === "si" || value === "ta" || value === "en") return value;
    return "en";
}
