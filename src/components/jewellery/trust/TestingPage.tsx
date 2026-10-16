"use client";

import { whatsappHref } from "@/constant/contact";
import { audiences, getTestingService, testingServices, type Audience, type TestingServiceId } from "@/data/testing-services";
import { formatLkr } from "@/data/gold-rates";
import { useLocale } from "@/i18n/LocaleProvider";
import type { Dictionary } from "@/i18n/types";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { FormEvent, MouseEvent, useState } from "react";
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

const scrollToBooking = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const target = document.getElementById("book");
    if (!target) return;
    const smoother = ScrollSmoother.get();
    if (smoother) smoother.scrollTo(target, true, "top 130px");
    else target.scrollIntoView({ behavior: "smooth", block: "start" });
};

const TestingPage = ({ initialService = "certificate" }: { initialService?: TestingServiceId }) => {
    const { locale, dict } = useLocale();
    const copy = dict.testing;
    const [service, setService] = useState<TestingServiceId>(initialService);
    const [audience, setAudience] = useState<Audience>("family");
    const [date, setDate] = useState("");
    const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
    const [reference, setReference] = useState("");
    const [error, setError] = useState("");
    const chosen = getTestingService(service);

    const book = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        setStatus("sending");
        setError("");

        fetch("/api/booking", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                kind: "testing",
                name: data.get("name"),
                phone: data.get("phone"),
                email: data.get("email"),
                date,
                note: data.get("note"),
                audience,
                service,
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
                <p className={styles.eyebrow}>{copy.eyebrow}</p>
                <h1 className={styles.title}>
                    {copy.title} <em>{copy.titleEm}</em>
                </h1>
                <p className={styles.lede}>{copy.intro}</p>
            </header>

            <section className={styles.section}>
                <h2 className={styles.homeTitle}>{copy.whoTitle}</h2>
                <div className={styles.who}>
                    <article>
                        <h3>{copy.jewellerTitle}</h3>
                        <p>{copy.jewellerText}</p>
                    </article>
                    <article>
                        <h3>{copy.pawnTitle}</h3>
                        <p>{copy.pawnText}</p>
                    </article>
                    <article>
                        <h3>{copy.familyTitle}</h3>
                        <p>{copy.familyText}</p>
                    </article>
                </div>
            </section>

            <section className={styles.section} aria-labelledby="testing-prices">
                <h2 id="testing-prices" className={styles.homeTitle}>
                    {copy.pricesTitle}
                </h2>
                <div className={styles.testGrid}>
                    {testingServices.map((item) => (
                        <article key={item.id} className={styles.testCard}>
                            <p className={styles.testTurn}>{copy.turnarounds[item.turnaround]}</p>
                            <h3 className={styles.testName}>{copy.services[item.id].name}</h3>
                            <p className={styles.testPrice}>{formatLkr(item.price, locale)}</p>
                            <p className={styles.testDetail}>{copy.services[item.id].detail}</p>
                            <a
                                className={styles.testBook}
                                href="#book"
                                onClick={(event) => {
                                    setService(item.id);
                                    scrollToBooking(event);
                                }}
                            >
                                {copy.book}
                            </a>
                        </article>
                    ))}
                </div>
            </section>

            <section id="book" className={`${styles.section} ${styles.anchor}`}>
                <div className={styles.split}>
                    <div>
                        <p className={styles.eyebrow}>{copy.formEyebrow}</p>
                        <h2 className={styles.homeTitle}>
                            {copy.formTitle} <em>{copy.formEm}</em>
                        </h2>
                        <p className={styles.lede}>{copy.formIntro}</p>
                    </div>

                    {status === "sent" ? (
                        <div className={styles.success} role="status">
                            <h2 className={styles.homeTitle}>{copy.thanksTitle}</h2>
                            <p>{copy.thanks}</p>
                            <p className={styles.reference}>
                                {dict.form.reference}
                                <strong>{reference}</strong>
                            </p>
                            <button type="button" className={styles.btnLight} onClick={() => setStatus("idle")}>
                                {copy.another}
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={book}>
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
                                    <span>{copy.audience}</span>
                                    <FancySelect
                                        aria-label={copy.audience}
                                        value={audience}
                                        onChange={(value) => setAudience(value as Audience)}
                                        options={audiences.map((item) => ({
                                            value: item,
                                            label: copy.audiences[item],
                                        }))}
                                    />
                                </label>
                                <label className={styles.field}>
                                    <span>{copy.serviceField}</span>
                                    <FancySelect
                                        aria-label={copy.serviceField}
                                        value={service}
                                        onChange={(value) => setService(value as TestingServiceId)}
                                        options={testingServices.map((item) => ({
                                            value: item.id,
                                            label: copy.services[item.id].name,
                                        }))}
                                    />
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
                            {chosen ? (
                                <p className={styles.chosenBar}>
                                    <span>{copy.services[chosen.id].name}</span>
                                    <strong>{formatLkr(chosen.price, locale)}</strong>
                                    <em>{copy.turnarounds[chosen.turnaround]}</em>
                                </p>
                            ) : null}
                            {status === "error" ? <p className={styles.formError}>{error}</p> : null}
                            <button type="submit" className={styles.btnDark} disabled={status === "sending"}>
                                {status === "sending" ? dict.form.sending : dict.form.submitTest}
                            </button>
                            <a
                                className={styles.btnLight}
                                href={whatsappHref(dict.whatsapp.testing(copy.services[service].name))}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {copy.whatsapp}
                            </a>
                        </form>
                    )}
                </div>
            </section>
        </div>
    );
};

export default TestingPage;
