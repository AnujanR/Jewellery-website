"use client";
import SmartLink from "@/components/common/SmartLink";
import { WHATSAPP_DISPLAY, WHATSAPP_E164, whatsappHref } from "@/constant/contact";
import { formatLkr } from "@/data/gold-rates";
import { getJewelleryProduct } from "@/data/jewellery-data";
import useGlobalContext from "@/hooks/useContext";
import useJewelleryEnquiry, {
    ENQUIRY_HOLD_HOURS,
    removeEnquiry,
} from "@/hooks/useJewelleryEnquiry";
import { useLocale } from "@/i18n/LocaleProvider";
import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { CloseLineIcon } from "./JewelleryIcons";
import styles from "./jewellery-layout.module.scss";

const JewelleryEnquiry = () => {
    const { openMiniCart, setOpenMiniCart } = useGlobalContext();
    const { items, count, pending, setPending, add } = useJewelleryEnquiry();
    const { locale } = useLocale();
    const close = () => {
        setOpenMiniCart(false);
        setPending(null);
    };

    const product = pending ? getJewelleryProduct(pending.productId) : null;
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [note, setNote] = useState("");

    useEffect(() => {
        if (!openMiniCart) return;
        const onKey = (event: KeyboardEvent) => {
            if (event.key !== "Escape") return;
            setOpenMiniCart(false);
            setPending(null);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [openMiniCart, setOpenMiniCart, setPending]);

    useEffect(() => {
        if (pending) {
            setName("");
            setPhone("");
            setNote("");
        }
    }, [pending?.productId, pending?.finish, pending?.option, pending?.indicativePrice]);

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        if (!pending || !product) return;
        if (!name.trim() || !phone.trim()) {
            toast.error("Please leave your name and WhatsApp number.");
            return;
        }

        const entry = add({
            productId: pending.productId,
            finish: pending.finish,
            option: pending.option,
            indicativePrice: pending.indicativePrice,
            name: name.trim(),
            phone: phone.trim(),
            note: note.trim(),
        });

        const message = [
            `Hello K.T.S Jewellery — enquiry ${entry.id}`,
            `${entry.name} · ${entry.phone}`,
            product.title,
            `${entry.finish}${entry.option ? ` · ${entry.option}` : ""}`,
            `Indicative today: ${formatLkr(entry.indicativePrice, locale)}`,
            `Please confirm availability and the final price (gold, making, stones, tax).`,
            `Happy to visit the shop or pay by bank transfer and collect in Colombo.`,
            entry.note ? `Note: ${entry.note}` : "",
        ]
            .filter(Boolean)
            .join("\n");

        window.open(whatsappHref(message), "_blank", "noopener,noreferrer");
        toast.success("Enquiry sent — we’ll confirm on WhatsApp");
        setOpenMiniCart(true);
    };

    return (
        <>
            <div
                className={`${styles.drawerOverlay} ${openMiniCart ? styles.drawerOverlayOpen : ""}`}
                onClick={close}
            />
            <aside
                className={`${styles.bag} ${openMiniCart ? styles.bagOpen : ""}`}
                inert={!openMiniCart}
                aria-label={product ? "Enquire about this piece" : "Your enquiries"}
            >
                <div className={styles.bagHead}>
                    <h2 className={styles.bagTitle}>
                        {product ? (
                            <>
                                Enquire <em>about this piece</em>
                            </>
                        ) : (
                            <>
                                Your <em>enquiries</em>
                                {count > 0 && <span>({count})</span>}
                            </>
                        )}
                    </h2>
                    <button type="button" className={styles.iconBtn} aria-label="Close" onClick={close}>
                        <CloseLineIcon />
                    </button>
                </div>

                <div className={styles.bagDelivery}>
                    <p>
                        Gold moves daily, so we don&apos;t take online checkout. Leave your details —
                        we confirm the final price on WhatsApp within{" "}
                        <strong>{ENQUIRY_HOLD_HOURS} hours</strong>, then you pay in store or by bank
                        transfer and collect in Colombo.
                    </p>
                </div>

                <div className={styles.bagBody}>
                    {product && pending ? (
                        <form className={styles.reserveForm} onSubmit={handleSubmit}>
                            <SmartLink
                                href={`/shop-details/${product.id}`}
                                className={styles.reserveProduct}
                                onClick={close}
                            >
                                <span className={styles.reserveThumb}>
                                    <Image src={product.image} alt={product.title} fill sizes="72px" />
                                </span>
                                <span>
                                    <strong>{product.title}</strong>
                                    <em>
                                        {pending.finish}
                                        {pending.option ? ` · ${pending.option}` : ""}
                                    </em>
                                    <em>{formatLkr(pending.indicativePrice, locale)} indicative</em>
                                </span>
                            </SmartLink>

                            <label className={styles.reserveField}>
                                <span>Your name</span>
                                <input
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    autoComplete="name"
                                    required
                                />
                            </label>
                            <label className={styles.reserveField}>
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
                            <label className={styles.reserveField}>
                                <span>Note <em>optional</em></span>
                                <textarea
                                    value={note}
                                    onChange={(event) => setNote(event.target.value)}
                                    rows={3}
                                    placeholder="Sizing, visit time, gift…"
                                />
                            </label>

                            <button type="submit" className={styles.bagBtnDark}>
                                Enquire on WhatsApp
                            </button>
                            <a
                                className={styles.bagBtnLight}
                                href={`tel:+${WHATSAPP_E164}`}
                            >
                                Contact us at {WHATSAPP_DISPLAY}
                            </a>
                            <p className={styles.bagNote}>
                                No online payment. We confirm gold value, making charge and availability
                                before you pay.
                            </p>
                        </form>
                    ) : items.length === 0 ? (
                        <div className={styles.bagEmpty}>
                            <p className={styles.bagEmptyTitle}>No enquiries yet</p>
                            <p>Enquire about a piece and we&apos;ll confirm today&apos;s price on WhatsApp.</p>
                            <SmartLink href="/shop" className={styles.bagBtnDark} onClick={close}>
                                Browse the collection
                            </SmartLink>
                        </div>
                    ) : (
                        <ul className={styles.bagList}>
                            {items.map((item) => (
                                <li key={item.id} className={styles.bagItem}>
                                    <SmartLink
                                        href={`/shop-details/${item.productId}`}
                                        className={styles.bagThumb}
                                        onClick={close}
                                    >
                                        <Image
                                            src={item.product.image}
                                            alt={item.product.title}
                                            fill
                                            sizes="88px"
                                        />
                                    </SmartLink>
                                    <div className={styles.bagItemInfo}>
                                        <div className={styles.bagItemTop}>
                                            <SmartLink
                                                href={`/shop-details/${item.productId}`}
                                                className={styles.bagItemTitle}
                                                onClick={close}
                                            >
                                                {item.product.title}
                                            </SmartLink>
                                            <span className={styles.bagItemPrice}>
                                                {formatLkr(item.indicativePrice, locale)}
                                            </span>
                                        </div>
                                        <p className={styles.bagItemMeta}>
                                            {item.finish}
                                            {item.option ? ` · ${item.option}` : ""} · {item.id}
                                        </p>
                                        <p className={styles.bagItemMeta}>
                                            Sent{" "}
                                            {new Date(item.createdAt).toLocaleString("en-LK", {
                                                dateStyle: "medium",
                                                timeStyle: "short",
                                            })}
                                        </p>
                                        <div className={styles.bagItemActions}>
                                            <a
                                                className={styles.bagBtnLight}
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
                                                className={styles.bagRemove}
                                                onClick={() => removeEnquiry(item.id)}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {!product && items.length > 0 && (
                    <div className={styles.bagFoot}>
                        <p className={styles.bagNote}>
                            Pay in store or by bank transfer after we confirm — then collect in Colombo.
                        </p>
                        <SmartLink href="/enquire" className={styles.bagBtnDark} onClick={close}>
                            How enquiries work
                        </SmartLink>
                    </div>
                )}
            </aside>
        </>
    );
};

export default JewelleryEnquiry;
