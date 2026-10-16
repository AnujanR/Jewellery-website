import { BRAND_MARK, BRAND_NAME, BRAND_SUFFIX } from "@/constant/brand";
import { jewelleryHeroLinks } from "@/data/jewellery-data";
import SmartLink from "@/components/common/SmartLink";
import Image from "next/image";
import styles from "./jewellery-shop.module.scss";

interface JewelleryShopHeroProps {
    image?: string;
}

const JewelleryShopHero = ({
    image = "/assets/img/jewellery/shop-hero-saree.jpg",
}: JewelleryShopHeroProps) => {
    return (
        <section className={styles.hero}>
            <div className={styles.heroMedia}>
                <Image src={image} alt="Woman in a gold silk saree wearing a traditional gold necklace" fill priority sizes="(max-width: 991px) 100vw, 55vw" />
            </div>
            <div className={styles.heroInner}>
                <h1 className={styles.heroBrand} aria-label={BRAND_NAME}>
                    {BRAND_MARK}
                    <span className={styles.heroBrandSuffix}>{BRAND_SUFFIX}</span>
                </h1>
                <ul className={styles.heroLinks}>
                    {jewelleryHeroLinks.map((link) => (
                        <li key={link.title}>
                            <SmartLink href={link.href}>
                                <span className={styles.heroLinkTitle}>{link.title}</span>
                                <span className={styles.heroLinkText}>{link.description}</span>
                            </SmartLink>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
};

export default JewelleryShopHero;
