"use client";
import SmartLink from "@/components/common/SmartLink";
import { BRAND_MARK, BRAND_SUFFIX } from "@/constant/brand";
import { whatsappHref } from "@/constant/contact";
import { formatLkr } from "@/data/gold-rates";
import useJewelleryEnquiry, {
    ENQUIRY_HOLD_HOURS,
    removeEnquiry,
} from "@/hooks/useJewelleryEnquiry";
import { useLocale } from "@/i18n/LocaleProvider";
import Image from "next/image";
import styles from "./jewellery-shop.module.scss";

const STEPS = [
    {
        title: "Enquire about a piece",
        text: "Leave your name and WhatsApp number on any piece that interests you.",
    },
    {
        title: "We confirm on WhatsApp",
        text: "Our team checks availability and the final gold value, making charge, stones and tax.",
    },
    {
        title: "Pay & collect",
        text: "Pay in store or by bank transfer, then collect in Colombo. Sizing and fitting in the shop.",
    },
] as const;

const JewelleryEnquiryArea = () => {
    const { items, count } = useJewelleryEnquiry();
    const { locale } = useLocale();

    return (
        <section className={styles.check}>
            <header className={styles.checkHero}>
                <p className={styles.checkBrand}>
                    {BRAND_MARK} <em>{BRAND_SUFFIX}</em>
                </p>
                <h1 className={styles.checkTitle}>
                    Enquire, don&apos;t <em>checkout</em>
                </h1>
                <p className={styles.checkLead}>
                    Gold prices move every day. A cart total goes stale fast — so you enquire about a
                    piece, we confirm the real price on WhatsApp, and you pay when you collect.
                </p>
            </header>

            <ol className={styles.reserveSteps}>
                {STEPS.map((step, index) => (
                    <li key={step.title}>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <div>
                            <h2>{step.title}</h2>
                            <p>{step.text}</p>
                        </div>
                    </li>
                ))}
            </ol>

            <div className={styles.reserveWhy}>
                <h2 className={styles.checkBlockTitle}>Why not a normal checkout?</h2>
                <ul>
                    <li>The gold rate changes daily — a locked web total risks selling below the board.</li>
                    <li>Every piece has gold value, making charge, stones and tax — not one flat price.</li>
                    <li>High-value gold is better seen, tested and sized in person.</li>
                    <li>Shipping insured gold and cash-on-delivery carry real fraud risk.</li>
                </ul>
            </div>

            {count > 0 ? (
                <div className={styles.reserveHolds}>
                    <h2 className={styles.checkBlockTitle}>
                        Your enquiries <em>({count})</em>
                    </h2>
                    <ul className={styles.wishList}>
                        {items.map((item) => (
                            <li key={item.id} className={styles.wishItem}>
                                <SmartLink href={`/shop-details/${item.productId}`} className={styles.wishThumb}>
                                    <Image
                                        src={item.product.image}
                                        alt={item.product.title}
                                        fill
                                        sizes="120px"
                                    />
                                </SmartLink>
                                <div className={styles.wishInfo}>
                                    <div className={styles.wishItemTop}>
                                        <div>
                                            <h3 className={styles.wishItemTitle}>
                                                <SmartLink href={`/shop-details/${item.productId}`}>
                                                    {item.product.title}
                                                </SmartLink>
                                            </h3>
                                            <p className={styles.wishItemMeta}>
                                                {item.finish}
                                                {item.option ? ` · ${item.option}` : ""} · {item.id}
                                            </p>
                                            <p className={styles.wishItemMeta}>
                                                Sent{" "}
                                                {new Date(item.createdAt).toLocaleString("en-LK", {
                                                    dateStyle: "medium",
                                                    timeStyle: "short",
                                                })}
                                            </p>
                                        </div>
                                        <p className={styles.wishItemPrice}>
                                            {formatLkr(item.indicativePrice, locale)}
                                        </p>
                                    </div>
                                    <div className={styles.wishItemActions}>
                                        <a
                                            className={styles.wishAddBtn}
                                            href={whatsappHref(
                                                `Hello K.T.S Jewellery — following up on enquiry ${item.id} (${item.product.title})`
                                            )}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            WhatsApp
                                        </a>
                                        <button
                                            type="button"
                                            className={styles.wishRemove}
                                            onClick={() => removeEnquiry(item.id)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div className={styles.checkEmpty}>
                    <p className={styles.checkEmptyTitle}>No enquiries yet</p>
                    <p>
                        Pick a piece in the shop and tap Enquire — we&apos;ll confirm the indicative
                        price within {ENQUIRY_HOLD_HOURS} hours.
                    </p>
                    <SmartLink href="/shop" className={styles.checkBtnDark}>
                        Shop the collection
                    </SmartLink>
                </div>
            )}
        </section>
    );
};

export default JewelleryEnquiryArea;
