import { homeLovedProductIds, homeLovedPromo } from "@/data/jewellery-home-data";
import JewelleryProductCard from "../JewelleryProductCard";
import { getJewelleryProduct, JewelleryProduct } from "@/data/jewellery-data";
import { getDictionary } from "@/i18n/get-dictionary";
import SmartLink from "@/components/common/SmartLink";
import HomeSectionHead from "./HomeSectionHead";
import Image from "next/image";
import styles from "./jewellery-home.module.scss";

const HomeLovedDesigns = async () => {
    const { home } = await getDictionary();
    const products = homeLovedProductIds
        .map((id) => getJewelleryProduct(id))
        .filter((p): p is JewelleryProduct => Boolean(p));

    return (
        <section className={styles.section}>
            <HomeSectionHead
                title={
                    <>
                        {home.lovedTitleA} <br />
                        <em>{home.lovedTitleB}</em> {home.lovedTitleC}
                    </>
                }
                ctaLabel={home.viewAll}
            />
            <div className={styles.lovedGrid}>
                <SmartLink href={homeLovedPromo.href} className={styles.lovedPromo}>
                    <span className={styles.lovedPromoText}>
                        <span className={styles.eyebrow}>{home.promoEyebrow}</span>
                        <span className={styles.lovedPromoTitle}>
                            {home.promoTitle} <em>{home.promoItalic}</em>
                        </span>
                        <span className={styles.lovedPromoCopy}>{home.promoText}</span>
                    </span>
                    <span className={styles.lovedPromoMedia}>
                        <Image src={homeLovedPromo.image} alt={home.promoTitle} fill sizes="(max-width: 991px) 100vw, 25vw" />
                    </span>
                </SmartLink>
                {products.map((product) => (
                    <JewelleryProductCard key={product.id} product={product} />
                ))}
            </div>
            <div className={styles.centerCta}>
                <SmartLink href="/shop" className={styles.solidBtn}>{home.shopNow}</SmartLink>
            </div>
        </section>
    );
};

export default HomeLovedDesigns;
