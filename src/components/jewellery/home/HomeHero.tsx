import SmartLink from "@/components/common/SmartLink";
import { homeHero } from "@/data/jewellery-home-data";
import { getDictionary } from "@/i18n/get-dictionary";
import HomeHeroSlider from "./HomeHeroSlider";
import styles from "./jewellery-home.module.scss";

const HomeHero = async () => {
    const { home } = await getDictionary();

    return (
        <section className={styles.hero}>
            <div className={styles.heroCopy}>
                <p className={styles.heroEyebrow}>{home.heroEyebrow}</p>
                <h1 className={styles.heroHeadline}>
                    {home.heroHeadline}
                    <em>{home.heroHeadlineEm}</em>
                </h1>
                <p className={styles.heroLead}>{home.heroLead}</p>
                <div className={styles.heroActions}>
                    <SmartLink href="/shop" className={styles.heroShop}>
                        {home.heroCta}
                    </SmartLink>
                    <SmartLink href="/gold-rates" className={styles.heroRates}>
                        {home.heroRates}
                    </SmartLink>
                </div>
            </div>
            <div className={styles.heroMedia}>
                <HomeHeroSlider images={homeHero.images} alt={home.heroHeadline} />
            </div>
        </section>
    );
};

export default HomeHero;
