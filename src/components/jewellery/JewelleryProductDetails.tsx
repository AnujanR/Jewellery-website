"use client";
import {
    getJewelleryDetails,
    getJewelleryGallery,
    getRelatedJewellery,
    JewelleryProduct,
} from "@/data/jewellery-data";
import JewelleryProductCard from "./JewelleryProductCard";
import SmartLink from "@/components/common/SmartLink";
import useJewelleryWishlist from "@/hooks/useJewelleryWishlist";
import { setPendingEnquiry } from "@/hooks/useJewelleryEnquiry";
import useGlobalContext from "@/hooks/useContext";
import { formatLkr } from "@/data/gold-rates";
import { useLocale } from "@/i18n/LocaleProvider";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./jewellery-shop.module.scss";

interface JewelleryProductDetailsProps {
    product: JewelleryProduct;
}

const finishes = [
    { name: "Gold", swatch: "linear-gradient(135deg, #e9cf8f, #b8913f)" },
    { name: "Silver", swatch: "linear-gradient(135deg, #f1f1f1, #a9a9a9)" },
];

const quantities = ["Pair", "Single"];

const JewelleryProductDetails = ({ product }: JewelleryProductDetailsProps) => {
    const gallery = getJewelleryGallery(product);
    const details = getJewelleryDetails(product);
    const related = getRelatedJewellery(product);
    const { setOpenMiniCart } = useGlobalContext();
    const { has, toggle } = useJewelleryWishlist();
    const wishlisted = has(product.id);
    const { locale } = useLocale();

    const [activeImage, setActiveImage] = useState(0);
    const [finish, setFinish] = useState(product.material === "Sterling Silver" ? "Silver" : "Gold");
    const [option, setOption] = useState(quantities[0]);
    const [openPanel, setOpenPanel] = useState<string | null>("Description");
    const mainTrackRef = useRef<HTMLDivElement>(null);
    const thumbsRef = useRef<HTMLDivElement>(null);
    const syncingFromThumb = useRef(false);

    const unitPrice = option === "Single" ? Math.round(product.price * 0.55) : product.price;

    const goToImage = useCallback((index: number, fromThumb = false) => {
        const next = Math.max(0, Math.min(gallery.length - 1, index));
        setActiveImage(next);
        const track = mainTrackRef.current;
        if (track) {
            if (fromThumb) syncingFromThumb.current = true;
            track.scrollTo({ left: next * track.clientWidth, behavior: fromThumb ? "smooth" : "auto" });
            if (fromThumb) {
                window.setTimeout(() => {
                    syncingFromThumb.current = false;
                }, 400);
            }
        }
        const thumb = thumbsRef.current?.children[next] as HTMLElement | undefined;
        thumb?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }, [gallery.length]);

    useEffect(() => {
        setActiveImage(0);
        const track = mainTrackRef.current;
        if (track) track.scrollLeft = 0;
    }, [product.id]);

    useEffect(() => {
        const track = mainTrackRef.current;
        if (!track) return;

        const onScroll = () => {
            if (syncingFromThumb.current) return;
            const width = track.clientWidth || 1;
            const index = Math.round(track.scrollLeft / width);
            setActiveImage((current) => {
                if (current === index) return current;
                const thumb = thumbsRef.current?.children[index] as HTMLElement | undefined;
                thumb?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                return index;
            });
        };

        track.addEventListener("scroll", onScroll, { passive: true });
        return () => track.removeEventListener("scroll", onScroll);
    }, [gallery.length]);

    const panels = [
        { title: "Description", body: details.description },
        { title: "Materials & care", body: details.care },
        { title: "Size & fit", body: details.size },
        { title: "Delivery & returns", body: details.shipping },
    ];

    const handleEnquire = () => {
        setPendingEnquiry({
            productId: product.id,
            finish,
            option: product.style === "Ear Cuffs" ? null : option,
            indicativePrice: unitPrice,
        });
        setOpenMiniCart(true);
    };

    return (
        <>
            <section className={styles.pdp}>
                <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                    <SmartLink href="/shop">Shop</SmartLink>
                    <span>/</span>
                    <SmartLink href="/shop">{product.subtitle.split(" · ")[0]}</SmartLink>
                    <span>/</span>
                    <span>{product.title}</span>
                </nav>

                <div className={styles.pdpLayout}>
                    <div className={styles.pdpGallery}>
                        <div className={styles.pdpThumbs} ref={thumbsRef}>
                            {gallery.map((src, index) => (
                                <button
                                    key={`${src}-${index}`}
                                    type="button"
                                    aria-label={`View image ${index + 1}`}
                                    aria-current={activeImage === index}
                                    className={`${styles.pdpThumb} ${activeImage === index ? styles.pdpThumbActive : ""}`}
                                    onClick={() => goToImage(index, true)}
                                >
                                    <Image src={src} alt="" fill sizes="80px" />
                                </button>
                            ))}
                        </div>
                        <div className={styles.pdpMainImage}>
                            <div
                                className={styles.pdpMainTrack}
                                ref={mainTrackRef}
                                role="region"
                                aria-roledescription="carousel"
                                aria-label={`${product.title} images`}
                            >
                                {gallery.map((src, index) => (
                                    <div
                                        key={`${src}-slide-${index}`}
                                        className={styles.pdpMainSlide}
                                        aria-hidden={activeImage !== index}
                                    >
                                        <Image
                                            src={src}
                                            alt={index === 0 ? product.title : `${product.title} view ${index + 1}`}
                                            fill
                                            priority={index === 0}
                                            sizes="(max-width: 991px) 100vw, 55vw"
                                            draggable={false}
                                        />
                                    </div>
                                ))}
                            </div>
                            {product.isNew && <span className={styles.cardBadge}>New</span>}
                            {gallery.length > 1 && (
                                <div className={styles.pdpDots} aria-hidden>
                                    {gallery.map((_, index) => (
                                        <span
                                            key={`dot-${index}`}
                                            className={activeImage === index ? styles.pdpDotActive : undefined}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.pdpInfo}>
                        <p className={styles.pdpEyebrow}>{product.collection} Collection</p>
                        <h1 className={styles.pdpTitle}>{product.title}</h1>
                        <p className={styles.pdpMeta}>{product.subtitle} · {product.material}</p>
                        <p className={styles.pdpPrice}>
                            <span className={styles.pdpPriceNote}>Indicative today</span>
                            {formatLkr(unitPrice, locale)}
                        </p>

                        <div className={styles.pdpOption}>
                            <span className={styles.pdpOptionLabel}>
                                Finish <em>{finish}</em>
                            </span>
                            <div className={styles.pdpSwatches}>
                                {finishes.map((f) => (
                                    <button
                                        key={f.name}
                                        type="button"
                                        aria-label={f.name}
                                        aria-pressed={finish === f.name}
                                        className={`${styles.pdpSwatch} ${finish === f.name ? styles.pdpSwatchActive : ""}`}
                                        onClick={() => setFinish(f.name)}
                                    >
                                        <span style={{ background: f.swatch }} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {product.style !== "Ear Cuffs" && (
                            <div className={styles.pdpOption}>
                                <span className={styles.pdpOptionLabel}>Buy as</span>
                                <div className={styles.pills}>
                                    {quantities.map((q) => (
                                        <button
                                            key={q}
                                            type="button"
                                            className={`${styles.pill} ${option === q ? styles.pillActive : ""}`}
                                            onClick={() => setOption(q)}
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className={styles.pdpActions}>
                            <button type="button" className={styles.pdpAddBtn} onClick={handleEnquire}>
                                Enquire about this piece
                            </button>
                            <button
                                type="button"
                                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                                aria-pressed={wishlisted}
                                className={`${styles.pdpWishBtn} ${wishlisted ? styles.cardWishActive : ""}`}
                                onClick={() => toggle(product.id)}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z" />
                                </svg>
                            </button>
                        </div>

                        <ul className={styles.pdpPerks}>
                            <li>We confirm today&apos;s price on WhatsApp</li>
                            <li>Pay in store or by bank transfer</li>
                            <li>Collect in Colombo · sizing available in shop</li>
                        </ul>

                        <div className={styles.pdpAccordion}>
                            {panels.map((panel) => {
                                const isOpen = openPanel === panel.title;
                                return (
                                    <div key={panel.title} className={styles.pdpPanel}>
                                        <button
                                            type="button"
                                            aria-expanded={isOpen}
                                            className={styles.pdpPanelHead}
                                            onClick={() => setOpenPanel(isOpen ? null : panel.title)}
                                        >
                                            {panel.title}
                                            <span>{isOpen ? "−" : "+"}</span>
                                        </button>
                                        {isOpen && <p className={styles.pdpPanelBody}>{panel.body}</p>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.related}>
                <h2 className={styles.relatedTitle}>
                    Complete the <em>look</em>
                </h2>
                <div className={styles.relatedGrid}>
                    {related.map((item) => (
                        <JewelleryProductCard key={item.id} product={item} />
                    ))}
                </div>
            </section>
        </>
    );
};

export default JewelleryProductDetails;
