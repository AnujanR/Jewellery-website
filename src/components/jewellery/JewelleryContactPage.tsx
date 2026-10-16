"use client";
import FancySelect from "@/components/jewellery/form/FancySelect";
import SmartLink from "@/components/common/SmartLink";
import { BRAND_MARK, BRAND_SUFFIX } from "@/constant/brand";
import {
    SHOP_ADDRESS_LINES,
    SHOP_EMAIL,
    SHOP_HOURS,
    SHOP_PLACE,
    WHATSAPP_DISPLAY,
    WHATSAPP_E164,
    whatsappHref,
    whatsappGreeting,
} from "@/constant/contact";
import { FormEvent, useState } from "react";
import { toast } from "react-toastify";
import styles from "./jewellery-shop.module.scss";

const TOPICS = [
    { value: "jewellery", label: "Jewellery enquiry" },
    { value: "rates", label: "Gold rates" },
    { value: "sell", label: "Sell or exchange gold" },
    { value: "testing", label: "Purity testing" },
    { value: "bespoke", label: "Bespoke / custom design" },
    { value: "other", label: "Something else" },
];

const JewelleryContactPage = () => {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [topic, setTopic] = useState("jewellery");
    const [message, setMessage] = useState("");

    const topicLabel = TOPICS.find((item) => item.value === topic)?.label ?? topic;

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        if (!name.trim() || !phone.trim() || !message.trim()) {
            toast.error("Please add your name, WhatsApp number and a short message.");
            return;
        }

        const body = [
            `${whatsappGreeting} — contact form`,
            `${name.trim()} · ${phone.trim()}`,
            email.trim() ? email.trim() : null,
            `Topic: ${topicLabel}`,
            "",
            message.trim(),
        ]
            .filter(Boolean)
            .join("\n");

        window.open(whatsappHref(body), "_blank", "noopener,noreferrer");
        toast.success("Opening WhatsApp — we’ll reply from the shop");
        setMessage("");
    };

    return (
        <section className={styles.contact}>
            <header className={styles.checkHero}>
                <p className={styles.checkBrand}>
                    {BRAND_MARK} <em>{BRAND_SUFFIX}</em>
                </p>
                <h1 className={styles.checkTitle}>
                    Contact <em>us</em>
                </h1>
                <p className={styles.checkLead}>
                    Message us on WhatsApp, call the shop, or leave a note below. Visit us in {SHOP_PLACE}{" "}
                    for rates, testing, or to see a piece in person.
                </p>
            </header>

            <div className={styles.contactLayout}>
                <div className={styles.contactMain}>
                    <section className={styles.checkBlock}>
                        <h2 className={styles.checkBlockTitle}>Send a message</h2>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.checkFieldRow}>
                                <label className={styles.checkField}>
                                    <span>Your name</span>
                                    <input
                                        value={name}
                                        onChange={(event) => setName(event.target.value)}
                                        autoComplete="name"
                                        required
                                    />
                                </label>
                                <label className={styles.checkField}>
                                    <span>WhatsApp number</span>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(event) => setPhone(event.target.value)}
                                        autoComplete="tel"
                                        placeholder="+94"
                                        required
                                    />
                                </label>
                            </div>
                            <label className={styles.checkField}>
                                <span>
                                    Email <em>optional</em>
                                </span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    autoComplete="email"
                                />
                            </label>
                            <label className={styles.checkField}>
                                <span>Topic</span>
                                <FancySelect
                                    aria-label="Topic"
                                    value={topic}
                                    onChange={setTopic}
                                    options={TOPICS}
                                />
                            </label>
                            <label className={styles.checkField}>
                                <span>Message</span>
                                <textarea
                                    value={message}
                                    onChange={(event) => setMessage(event.target.value)}
                                    rows={5}
                                    placeholder="How can we help?"
                                    required
                                />
                            </label>
                            <button type="submit" className={styles.checkBtnDark}>
                                Send on WhatsApp
                            </button>
                            <p className={styles.checkNote}>
                                Opens WhatsApp with your message ready to send. No online checkout —
                                we confirm prices and appointments from the shop.
                            </p>
                        </form>
                    </section>
                </div>

                <aside className={styles.contactAside}>
                    <div className={styles.contactCard}>
                        <h2 className={styles.checkBlockTitle}>Visit the shop</h2>
                        <address className={styles.contactAddress}>
                            {SHOP_ADDRESS_LINES.map((line) => (
                                <span key={line}>{line}</span>
                            ))}
                        </address>
                        <dl className={styles.contactHours}>
                            {SHOP_HOURS.map((row) => (
                                <div key={row.day}>
                                    <dt>{row.day}</dt>
                                    <dd>{row.time}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>

                    <div className={styles.contactCard}>
                        <h2 className={styles.checkBlockTitle}>Reach us</h2>
                        <ul className={styles.contactLinks}>
                            <li>
                                <span>WhatsApp / phone</span>
                                <a href={`tel:+${WHATSAPP_E164}`}>{WHATSAPP_DISPLAY}</a>
                            </li>
                            <li>
                                <span>Email</span>
                                <a href={`mailto:${SHOP_EMAIL}`}>{SHOP_EMAIL}</a>
                            </li>
                        </ul>
                        <div className={styles.contactActions}>
                            <a
                                className={styles.checkBtnDark}
                                href={whatsappHref(whatsappGreeting)}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Chat on WhatsApp
                            </a>
                            <a className={styles.checkBtnGhost} href={`tel:+${WHATSAPP_E164}`}>
                                Call {WHATSAPP_DISPLAY}
                            </a>
                        </div>
                    </div>

                    <div className={styles.contactCard}>
                        <h2 className={styles.checkBlockTitle}>Quick links</h2>
                        <ul className={styles.contactQuick}>
                            <li>
                                <SmartLink href="/gold-rates">Today&apos;s gold rates</SmartLink>
                            </li>
                            <li>
                                <SmartLink href="/sell-gold">Sell or exchange gold</SmartLink>
                            </li>
                            <li>
                                <SmartLink href="/testing">Book a purity test</SmartLink>
                            </li>
                            <li>
                                <SmartLink href="/services">Our services</SmartLink>
                            </li>
                            <li>
                                <SmartLink href="/shop">Shop the collection</SmartLink>
                            </li>
                            <li>
                                <SmartLink href="/enquire">How enquiries work</SmartLink>
                            </li>
                        </ul>
                    </div>
                </aside>
            </div>
        </section>
    );
};

export default JewelleryContactPage;
