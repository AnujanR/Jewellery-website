"use client";

import { whatsappHref } from "@/constant/contact";
import { CARATS, formatGrams, formatLkr, indicativeBuy, SOVEREIGN_GRAMS, type Carat } from "@/data/gold-rates";
import { useLocale } from "@/i18n/LocaleProvider";
import type { Dictionary } from "@/i18n/types";
import { FormEvent, useMemo, useState } from "react";
import FancyDateField from "./FancyDateField";
import FancySelect from "./FancySelect";
import styles from "./trust.module.scss";

const errorText = (code: string, dict: Dictionary) => {
    if (code === "name") return dict.form.nameError;
    if (code === "phone") return dict.form.phoneError;
    if (code === "email") return dict.form.emailError;
    if (code === "service") return dict.form.serviceError;
    return dict.form.sendError;
};

const SellGoldPage = () => {
    const { locale, dict } = useLocale();
    const [weight, setWeight] = useState("");
    const [carat, setCarat] = useState<Carat>(22);
    const [date, setDate] = useState("");
    const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
    const [reference, setReference] = useState("");
    const [error, setError] = useState("");

    const grams = Number(weight);
    const valid = Number.isFinite(grams) && grams > 0 && grams <= 5000;
    const quote = useMemo(() => (valid ? indicativeBuy(grams, carat) : null), [valid, grams, carat]);
    const priceLabel = quote ? formatLkr(quote.total, locale) : "";
    const rateLabel = quote ? formatLkr(quote.perGram, locale) : "";
    const karatLabel = `${carat}K`;

    const bookVisit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        setStatus("sending");
        setError("");

        fetch("/api/booking", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                kind: "visit",
                name: data.get("name"),
                phone: data.get("phone"),
                email: data.get("email"),
                date,
                note: data.get("note"),
                weight: valid ? String(grams) : "",
                carat: String(carat),
                estimate: priceLabel,
            }),
        })
            .then(async (response) => {
                const result = await response.json().catch(() => ({}));
                if (!response.ok) throw new Error(result.error ?? "send");
                setReference(result.reference);
                setStatus("sent");
                form.reset();
                setDate("");
            })
            .catch((reason: unknown) => {
                setStatus("error");
                setError(errorText(reason instanceof Error ? reason.message : "send", dict));
            });
    };

    return (
        <div className={styles.page}>
            <header className={styles.hero}>
                <p className={styles.eyebrow}>{dict.estimator.eyebrow}</p>
                <h1 className={styles.title}>
                    {dict.estimator.title} <em>{dict.estimator.titleEm}</em>
                </h1>
                <p className={styles.lede}>{dict.estimator.intro}</p>
            </header>

            <section className={styles.section}>
                <div className={styles.split}>
                    <form onSubmit={(event) => event.preventDefault()}>
                        <label className={styles.field}>
                            <span>
                                {dict.estimator.weight} <em>{dict.estimator.grams}</em>
                            </span>
                            <input
                                inputMode="decimal"
                                min="0"
                                step="0.01"
                                value={weight}
                                onChange={(event) => setWeight(event.target.value)}
                                aria-label={dict.estimator.weight}
                            />
                        </label>
                        <div className={styles.chips}>
                            <button type="button" className={styles.chip} onClick={() => setWeight(String(SOVEREIGN_GRAMS))}>
                                {dict.estimator.oneSovereign}
                            </button>
                            <button type="button" className={styles.chip} onClick={() => setWeight(String(SOVEREIGN_GRAMS * 2))}>
                                {dict.estimator.twoSovereigns}
                            </button>
                        </div>
                        <label className={styles.field}>
                            <span>{dict.estimator.carat}</span>
                            <FancySelect
                                aria-label={dict.estimator.carat}
                                value={String(carat)}
                                onChange={(value) => setCarat(Number(value) as Carat)}
                                options={CARATS.map((value) => ({
                                    value: String(value),
                                    label: `${value}K`,
                                }))}
                            />
                        </label>
                    </form>

                    <div className={styles.result} aria-live="polite">
                        <p className={styles.resultLabel}>{dict.estimator.resultEyebrow}</p>
                        <p className={styles.resultPrice}>{quote ? priceLabel : "—"}</p>
                        {quote ? (
                            <p className={styles.resultMeta}>
                                {formatGrams(grams)} · {karatLabel}
                                <br />
                                {quote.basis === "board"
                                    ? dict.estimator.usingRate(karatLabel, rateLabel)
                                    : dict.estimator.usingScaled(karatLabel, rateLabel)}
                            </p>
                        ) : null}
                        <p className={styles.disclaimer}>{dict.estimator.disclaimer}</p>
                        <div className={styles.resultActions}>
                            <a className={styles.btnDark} href="#visit">
                                {dict.estimator.book}
                            </a>
                            <a
                                className={styles.btnWa}
                                href={whatsappHref(
                                    quote ? dict.whatsapp.sell(formatGrams(grams), karatLabel, priceLabel) : dict.whatsapp.visit
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {dict.estimator.whatsapp}
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <section id="visit" className={`${styles.section} ${styles.anchor}`}>
                <div className={styles.split}>
                    <div>
                        <p className={styles.eyebrow}>{dict.visit.eyebrow}</p>
                        <h2 className={styles.homeTitle}>
                            {dict.visit.title} <em>{dict.visit.titleEm}</em>
                        </h2>
                        <p className={styles.lede}>{dict.visit.intro}</p>
                    </div>

                    {status === "sent" ? (
                        <div className={styles.success} role="status">
                            <h2 className={styles.homeTitle}>{dict.visit.thanksTitle}</h2>
                            <p>{dict.visit.thanks}</p>
                            <p className={styles.reference}>
                                {dict.form.reference}
                                <strong>{reference}</strong>
                            </p>
                            <button type="button" className={styles.btnLight} onClick={() => setStatus("idle")}>
                                {dict.visit.another}
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={bookVisit}>
                            {quote ? (
                                <p className={styles.note}>
                                    {dict.visit.bringing}: {formatGrams(grams)} · {karatLabel} · {priceLabel}
                                </p>
                            ) : null}
                            <div className={styles.fieldRow}>
                                <label className={styles.field}>
                                    <span>{dict.form.name}</span>
                                    <input name="name" required maxLength={100} autoComplete="name" />
                                </label>
                                <label className={styles.field}>
                                    <span>{dict.form.phone}</span>
                                    <input name="phone" type="tel" required maxLength={30} autoComplete="tel" />
                                </label>
                            </div>
                            <div className={styles.fieldRow}>
                                <label className={styles.field}>
                                    <span>
                                        {dict.form.email} <em>{dict.form.optional}</em>
                                    </span>
                                    <input name="email" type="email" maxLength={200} autoComplete="email" />
                                </label>
                                <label className={styles.field}>
                                    <span>
                                        {dict.form.date} <em>{dict.form.optional}</em>
                                    </span>
                                    <FancyDateField
                                        aria-label={dict.form.date}
                                        value={date}
                                        onChange={setDate}
                                    />
                                </label>
                            </div>
                            <label className={styles.field}>
                                <span>
                                    {dict.form.note} <em>{dict.form.optional}</em>
                                </span>
                                <textarea name="note" maxLength={2000} />
                            </label>
                            {status === "error" ? <p className={styles.formError}>{error}</p> : null}
                            <button type="submit" className={styles.btnDark} disabled={status === "sending"}>
                                {status === "sending" ? dict.form.sending : dict.form.submitVisit}
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </div>
    );
};

export default SellGoldPage;
