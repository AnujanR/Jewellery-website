"use client";
import { defaultFinish, defaultOption, JewelleryProduct } from "@/data/jewellery-data";
import SmartLink from "@/components/common/SmartLink";
import useJewelleryWishlist from "@/hooks/useJewelleryWishlist";
import { setPendingEnquiry } from "@/hooks/useJewelleryEnquiry";
import useGlobalContext from "@/hooks/useContext";
import { formatLkr } from "@/data/gold-rates";
import { useLocale } from "@/i18n/LocaleProvider";
import Image from "next/image";
import styles from "./jewellery-shop.module.scss";

interface JewelleryProductCardProps {
    product: JewelleryProduct;
}

const JewelleryProductCard = ({ product }: JewelleryProductCardProps) => {
    const { has, toggle } = useJewelleryWishlist();
    const wishlisted = has(product.id);
    const { setOpenMiniCart } = useGlobalContext();
    const { locale } = useLocale();

    const openEnquire = () => {
        setPendingEnquiry({
            productId: product.id,
            finish: defaultFinish(product),
            option: defaultOption(product),
            indicativePrice: product.price,
        });
        setOpenMiniCart(true);
    };

    return (
        <article className={styles.card}>
            <div className={styles.cardMedia}>
                <SmartLink href={`/shop-details/${product.id}`}>
                    <Image src={product.image} alt={product.title} fill sizes="(max-width: 767px) 50vw, 20vw" />
                </SmartLink>
                {product.isNew && <span className={styles.cardBadge}>New</span>}
                <button type="button" className={styles.cardQuickAdd} onClick={openEnquire}>
                    Enquire
                </button>
            </div>
            <div className={styles.cardBody}>
                <div>
                    <h3 className={styles.cardTitle}>
                        <SmartLink href={`/shop-details/${product.id}`}>{product.title}</SmartLink>
                    </h3>
                    <p className={styles.cardMeta}>{product.subtitle} · {product.material}</p>
                    <p className={styles.cardPrice}>
                        <span className={styles.cardPriceNote}>From</span> {formatLkr(product.price, locale)}
                    </p>
                </div>
                <button
                    type="button"
                    aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    aria-pressed={wishlisted}
                    className={`${styles.cardWish} ${wishlisted ? styles.cardWishActive : ""}`}
                    onClick={() => toggle(product.id)}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z" />
                    </svg>
                </button>
            </div>
        </article>
    );
};

export default JewelleryProductCard;
