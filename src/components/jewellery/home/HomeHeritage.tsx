import { getDictionary } from "@/i18n/get-dictionary";
import styles from "./jewellery-home.module.scss";

const HomeHeritage = async () => {
    const { home } = await getDictionary();
    const stats = [
        { title: home.heritageStat1Title, text: home.heritageStat1Text },
        { title: home.heritageStat2Title, text: home.heritageStat2Text },
        { title: home.heritageStat3Title, text: home.heritageStat3Text },
    ];

    return (
        <section className={`${styles.section} ${styles.heritage}`}>
            <div className={styles.heritageIntro}>
                <div className={styles.heritageYears}>
                    <span className={styles.heritageNumber}>{home.heritageYears}</span>
                    <span className={styles.heritageYearsLabel}>{home.heritageYearsLabel}</span>
                </div>
                <div className={styles.heritageCopy}>
                    <span className={styles.eyebrow}>{home.heritageEyebrow}</span>
                    <h2 className={styles.heritageTitle}>{home.heritageTitle}</h2>
                    <p>{home.heritageText}</p>
                </div>
            </div>
            <ul className={styles.heritageStats}>
                {stats.map((stat) => (
                    <li key={stat.title}>
                        <h3 className={styles.benefitTitle}>{stat.title}</h3>
                        <p>{stat.text}</p>
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default HomeHeritage;
