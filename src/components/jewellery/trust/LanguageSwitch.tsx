"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import styles from "./trust.module.scss";

const locales = ["en", "si", "ta"] as const;

const LanguageSwitch = () => {
    const { locale, dict, setLocale } = useLocale();

    return (
        <div className={styles.langSwitch} role="group" aria-label={dict.lang.label}>
            {locales.map((code) => (
                <button
                    key={code}
                    type="button"
                    aria-pressed={locale === code}
                    className={locale === code ? styles.langActive : undefined}
                    onClick={() => setLocale(code)}
                >
                    {dict.lang[code]}
                </button>
            ))}
        </div>
    );
};

export default LanguageSwitch;
