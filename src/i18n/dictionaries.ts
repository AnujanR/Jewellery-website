import { en } from "./en";
import { si } from "./si";
import { ta } from "./ta";
import type { Locale } from "./types";

export const dictionaries = { en, si, ta } as const;

export function dictionaryFor(locale: Locale) {
    return dictionaries[locale];
}
