import { cookies } from "next/headers";
import { LOCALE_COOKIE, parseLocale } from "./config";
import { dictionaryFor } from "./dictionaries";
import type { Locale } from "./types";

export async function getLocale(): Promise<Locale> {
    const jar = await cookies();
    return parseLocale(jar.get(LOCALE_COOKIE)?.value);
}

export async function getDictionary() {
    return dictionaryFor(await getLocale());
}
