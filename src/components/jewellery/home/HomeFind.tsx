import HomeFindSlider from "./HomeFindSlider";
import { getDictionary } from "@/i18n/get-dictionary";
import styles from "./jewellery-home.module.scss";

const HomeFind = async () => {
    const dict = await getDictionary();
    const items = [
        { label: dict.footer.rings, image: "/assets/img/jewellery/icon-rings.jpg", href: "/shop" },
        { label: dict.footer.necklaces, image: "/assets/img/jewellery/icon-necklaces.jpg", href: "/shop" },
        { label: dict.footer.bracelets, image: "/assets/img/jewellery/icon-bracelets.jpg", href: "/shop" },
        { label: dict.footer.earrings, image: "/assets/img/jewellery/icon-earrings.jpg", href: "/shop" },
        { label: dict.home.findTesting, image: "/assets/img/jewellery/icon-testing-v3.jpg", href: "/testing" },
        { label: dict.home.findSell, image: "/assets/img/jewellery/icon-sell-v2.jpg", href: "/sell-gold" },
        { label: dict.home.findRates, image: "/assets/img/jewellery/icon-rates-v2.jpg", href: "/gold-rates" },
        { label: dict.home.findServices, image: "/assets/img/jewellery/purpose-hero-v2.jpg", href: "/services" },
    ];

    return (
        <section className={`${styles.section} ${styles.find}`} aria-labelledby="find-title">
            <h2 id="find-title" className={styles.findTitle}>
                {dict.home.findTitle}
            </h2>
            <HomeFindSlider items={items} />
        </section>
    );
};

export default HomeFind;
