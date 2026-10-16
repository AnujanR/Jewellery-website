"use client";
import useJewelleryWishlist from "@/hooks/useJewelleryWishlist";
import { defaultFinish, defaultOption } from "@/data/jewellery-data";
import { setPendingEnquiry } from "@/hooks/useJewelleryEnquiry";
import useGlobalContext from "@/hooks/useContext";
import SmartLink from "@/components/common/SmartLink";
import { BRAND_MARK, BRAND_SUFFIX } from "@/constant/brand";
import { formatLkr } from "@/data/gold-rates";
import { useLocale } from "@/i18n/LocaleProvider";
import Image from "next/image";
import styles from "./jewellery-shop.module.scss";

const JewelleryWishlistArea = () => {
    const { items, count, remove } = useJewelleryWishlist();
    const { setOpenMiniCart } = useGlobalContext();
    const { locale } = useLocale();

    return (
        <section className={styles.wish}>
            <header className={styles.wishHero}>
                <p className={styles.wishBrand}>
                    {BRAND_MARK} <em>{BRAND_SUFFIX}</em>
                </p>
                <h1 className={styles.wishTitle}>
                    Your <em>wishlist</em>
                </h1>
                <p className={styles.wishLead}>
                    {count > 0
                        ? `${count} saved piece${count === 1 ? "" : "s"} — enquire when you are ready.`
                        : "Save pieces you love and enquire when you are ready."}
                </p>
            </header>

            {items.length === 0 ? (
                <div className={styles.wishEmpty}>
                    <p className={styles.wishEmptyTitle}>Nothing saved yet</p>
                    <p>Browse the collection and tap the heart on pieces that catch your eye.</p>
                    <SmartLink href="/shop" className={styles.wishBtnDark}>
                        Shop the collection
                    </SmartLink>
                </div>
            ) : (
                <ul className={styles.wishList}>
                    {items.map((product) => (
                        <li key={product.id} className={styles.wishItem}>
                            <SmartLink href={`/shop-details/${product.id}`} className={styles.wishThumb}>
                                <Image
                                    src={product.image}
                                    alt={product.title}
                                    fill
                                    sizes="(max-width: 767px) 30vw, 120px"
                                />
                            </SmartLink>
                            <div className={styles.wishInfo}>
                                <div className={styles.wishItemTop}>
                                    <div>
                                        <h2 className={styles.wishItemTitle}>
                                            <SmartLink href={`/shop-details/${product.id}`}>
                                                {product.title}
                                            </SmartLink>
                                        </h2>
                                        <p className={styles.wishItemMeta}>
                                            {product.subtitle} · {product.material}
                                        </p>
                                    </div>
                                    <p className={styles.wishItemPrice}>
                                        <span className={styles.cardPriceNote}>From</span>
                                        {formatLkr(product.price, locale)}
                                    </p>
                                </div>
                                <div className={styles.wishItemActions}>
                                    <button
                                        type="button"
                                        className={styles.wishAddBtn}
                                        onClick={() => {
                                            setPendingEnquiry({
                                                productId: product.id,
                                                finish: defaultFinish(product),
                                                option: defaultOption(product),
                                                indicativePrice: product.price,
                                            });
                                            setOpenMiniCart(true);
                                        }}
                                    >
                                        Enquire about this piece
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.wishRemove}
                                        onClick={() => remove(product.id)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
};

export default JewelleryWishlistArea;
