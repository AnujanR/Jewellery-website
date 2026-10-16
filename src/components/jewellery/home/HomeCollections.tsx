import SmartLink from "@/components/common/SmartLink";
import { homeCollections } from "@/data/jewellery-home-data";
import { getDictionary } from "@/i18n/get-dictionary";
import Image from "next/image";
import HomeSectionHead from "./HomeSectionHead";
import styles from "./jewellery-home.module.scss";

const HomeCollections = async () => {
    const dict = await getDictionary();
    const labels = [dict.footer.rings, dict.footer.necklaces, dict.footer.bracelets, dict.footer.earrings];

    return (
        <section className={styles.section}>
            <HomeSectionHead
                title={
                    <>
                        {dict.home.collectionsTitleA} <br />
                        <em>{dict.home.collectionsTitleB}</em> {dict.home.collectionsTitleC}
                    </>
                }
                ctaLabel={dict.home.shopAll}
            />
            <div className={styles.collectionGrid}>
                {homeCollections.map((item, index) => (
                    <SmartLink key={item.image} href={item.href} className={styles.collectionItem}>
                        <span className={styles.collectionMedia}>
                            <Image src={item.image} alt={labels[index]} fill sizes="(max-width: 767px) 50vw, 25vw" />
                        </span>
                        <span className={styles.collectionLabel}>{labels[index]}</span>
                    </SmartLink>
                ))}
            </div>
        </section>
    );
};

export default HomeCollections;
