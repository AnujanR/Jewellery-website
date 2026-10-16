import SmartLink from "@/components/common/SmartLink";
import { homePurpose } from "@/data/jewellery-home-data";
import { whatsappHref } from "@/constant/contact";
import { getDictionary } from "@/i18n/get-dictionary";
import Image from "next/image";
import styles from "./jewellery-home.module.scss";

const HomePurpose = async () => {
    const dict = await getDictionary();
    const { home, whatsapp } = dict;

    return (
        <section className={`${styles.section} ${styles.close}`} aria-labelledby="close-title">
            <div className={styles.closeMedia}>
                <Image
                    src={homePurpose.image}
                    alt=""
                    fill
                    sizes="100vw"
                    priority={false}
                />
            </div>
            <div className={styles.closePanel}>
                <span className={styles.eyebrow}>{home.purposeEyebrow}</span>
                <h2 id="close-title" className={styles.closeTitle}>
                    {home.purposeTitle}
                </h2>
                <p className={styles.closeLead}>{home.purposeText}</p>
                <div className={styles.closeActions}>
                    <a
                        className={styles.solidBtn}
                        href={whatsappHref(whatsapp.general)}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {home.purposeCta}
                    </a>
                    <SmartLink href="/testing" className={styles.outlineBtn}>
                        {home.gallery1}
                    </SmartLink>
                    <SmartLink href="/sell-gold" className={styles.textLink}>
                        {home.gallery2}
                    </SmartLink>
                </div>
            </div>
        </section>
    );
};

export default HomePurpose;
