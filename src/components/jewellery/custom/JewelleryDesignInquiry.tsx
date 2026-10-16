"use client";
import FancySelect from "@/components/jewellery/form/FancySelect";
import { CustomDesign, describeDesign, inquiryBudgets, inquiryTimelines, serializeDesign } from "@/data/jewellery-custom-data";
import { BRAND_NAME } from "@/constant/brand";
import { formatLkr } from "@/data/gold-rates";
import { useLocale } from "@/i18n/LocaleProvider";
import { FormEvent, useState } from "react";
import styles from "./jewellery-custom.module.scss";

interface JewelleryDesignInquiryProps {
    design: CustomDesign;
    price: number;
    getSnapshot: () => string | null;
}

type Status = { state: "idle" } | { state: "sending" } | { state: "sent"; reference: string } | { state: "error"; message: string };

const JewelleryDesignInquiry = ({ design, price, getSnapshot }: JewelleryDesignInquiryProps) => {
    const { locale } = useLocale();
    const [status, setStatus] = useState<Status>({ state: "idle" });
    const [preview, setPreview] = useState<string | null>(null);
    const [contactMethod, setContactMethod] = useState("Email");
    const [timeline, setTimeline] = useState("");
    const [budget, setBudget] = useState("");
    const rows = describeDesign(design);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        const image = getSnapshot();
        setPreview(image);
        setStatus({ state: "sending" });

        try {
            const response = await fetch("/api/design-inquiry", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: data.get("name"),
                    email: data.get("email"),
                    phone: data.get("phone"),
                    contactMethod: data.get("contactMethod"),
                    timeline: data.get("timeline"),
                    budget: data.get("budget"),
                    message: data.get("message"),
                    design: serializeDesign(design),
                    image,
                }),
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result.error ?? "Something went wrong. Please try again.");
            setStatus({ state: "sent", reference: result.reference });
            form.reset();
            setContactMethod("Email");
            setTimeline("");
            setBudget("");
        } catch (error) {
            setStatus({ state: "error", message: error instanceof Error ? error.message : "Something went wrong." });
        }
    };

    return (
        <section id="design-enquiry" className={styles.enquiry}>
            <div className={styles.enquiryIntro}>
                <p className={styles.eyebrow}>Bespoke enquiry</p>
                <h2 className={styles.enquiryTitle}>
                    Let&apos;s bring your design <em>to life</em>
                </h2>
                <p className={styles.enquiryText}>
                    Send us your design and one of our goldsmiths will be in touch within two working days to talk
                    through stones, sizing and timings – with no obligation.
                </p>

                <div className={styles.summary}>
                    {preview && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={preview} alt="Your design" className={styles.summaryImage} />
                    )}
                    <dl>
                        {rows.map(([label, value]) => (
                            <div key={label}>
                                <dt>{label}</dt>
                                <dd>{value}</dd>
                            </div>
                        ))}
                        <div className={styles.summaryTotal}>
                            <dt>Estimated from</dt>
                            <dd>{formatLkr(price, locale)}</dd>
                        </div>
                    </dl>
                </div>
            </div>

            {status.state === "sent" ? (
                <div className={styles.enquirySuccess} role="status">
                    <p className={styles.enquiryTitle}>
                        Thank <em>you</em>
                    </p>
                    <p>We&apos;ve received your design and will be in touch shortly.</p>
                    <p className={styles.reference}>
                        Your reference <strong>{status.reference}</strong>
                    </p>
                    <button type="button" className={styles.btnLight} onClick={() => setStatus({ state: "idle" })}>
                        Send another enquiry
                    </button>
                </div>
            ) : (
                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.fieldRow}>
                        <label className={styles.field}>
                            <span>Full name *</span>
                            <input name="name" type="text" required maxLength={100} autoComplete="name" />
                        </label>
                        <label className={styles.field}>
                            <span>Email *</span>
                            <input name="email" type="email" required maxLength={200} autoComplete="email" />
                        </label>
                    </div>
                    <div className={styles.fieldRow}>
                        <label className={styles.field}>
                            <span>Phone</span>
                            <input name="phone" type="tel" maxLength={30} autoComplete="tel" />
                        </label>
                        <label className={styles.field}>
                            <span>Preferred contact</span>
                            <FancySelect
                                name="contactMethod"
                                aria-label="Preferred contact"
                                value={contactMethod}
                                onChange={setContactMethod}
                                options={[
                                    { value: "Email", label: "Email" },
                                    { value: "Phone", label: "Phone" },
                                    { value: "WhatsApp", label: "WhatsApp" },
                                    { value: "Studio appointment", label: "Studio appointment" },
                                ]}
                            />
                        </label>
                    </div>
                    <div className={styles.fieldRow}>
                        <label className={styles.field}>
                            <span>Timeline</span>
                            <FancySelect
                                name="timeline"
                                aria-label="Timeline"
                                value={timeline}
                                onChange={setTimeline}
                                placeholder="Select…"
                                options={inquiryTimelines.map((t) => ({ value: t, label: t }))}
                            />
                        </label>
                        <label className={styles.field}>
                            <span>Budget</span>
                            <FancySelect
                                name="budget"
                                aria-label="Budget"
                                value={budget}
                                onChange={setBudget}
                                placeholder="Select…"
                                options={inquiryBudgets.map((b) => ({ value: b, label: b }))}
                            />
                        </label>
                    </div>
                    <label className={styles.field}>
                        <span>Tell us more</span>
                        <textarea
                            name="message"
                            rows={5}
                            maxLength={2000}
                            placeholder="The occasion, inspiration, anything you'd like to change…"
                        />
                    </label>
                    <label className={styles.consent}>
                        <input type="checkbox" name="consent" required />
                        <span>I agree to {BRAND_NAME} contacting me about this enquiry.</span>
                    </label>

                    {status.state === "error" && (
                        <p className={styles.formError} role="alert">{status.message}</p>
                    )}

                    <button type="submit" className={styles.btnDark} disabled={status.state === "sending"}>
                        {status.state === "sending" ? "Sending…" : "Send my design"}
                    </button>
                </form>
            )}
        </section>
    );
};

export default JewelleryDesignInquiry;
