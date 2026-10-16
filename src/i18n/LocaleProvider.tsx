"use client";

import { dictionaryFor } from "@/i18n/dictionaries";
import { LOCALE_COOKIE, parseLocale } from "@/i18n/config";
import type { Dictionary, Locale } from "@/i18n/types";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

interface LocaleContextValue {
    locale: Locale;
    dict: Dictionary;
    setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

const htmlLang = (locale: Locale) => locale;

export function LocaleProvider({ initialLocale, children }: { initialLocale: Locale; children: React.ReactNode }) {
    const router = useRouter();
    const [locale, setLocaleState] = useState<Locale>(initialLocale);

    useEffect(() => {
        setLocaleState(initialLocale);
    }, [initialLocale]);

    const setLocale = (next: Locale) => {
        const safe = parseLocale(next);
        document.cookie = `${LOCALE_COOKIE}=${safe};path=/;max-age=31536000;SameSite=Lax`;
        document.documentElement.lang = htmlLang(safe);
        document.documentElement.dataset.locale = safe;
        setLocaleState(safe);
        router.refresh();
    };

    const value = useMemo<LocaleContextValue>(
        () => ({ locale, dict: dictionaryFor(locale), setLocale }),
        // setLocale is stable enough for this provider; locale is the real dependency.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [locale, router]
    );

    return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
    const value = useContext(LocaleContext);
    if (!value) throw new Error("useLocale must be used within LocaleProvider");
    return value;
}
