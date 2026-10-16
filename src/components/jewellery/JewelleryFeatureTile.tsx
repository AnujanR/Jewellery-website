import { JewelleryFeature } from "@/data/jewellery-data";
import SmartLink from "@/components/common/SmartLink";
import Image from "next/image";
import styles from "./jewellery-shop.module.scss";

interface JewelleryFeatureTileProps {
    feature: JewelleryFeature;
}

const JewelleryFeatureTile = ({ feature }: JewelleryFeatureTileProps) => {
    const sideCls = feature.side === "left" ? styles.featureLeft : styles.featureRight;
    const toneCls = feature.tone === "light" ? styles.featureLight : "";

    return (
        <SmartLink href={feature.href} className={`${styles.feature} ${sideCls} ${toneCls}`}>
            <Image src={feature.image} alt={`${feature.title} ${feature.titleItalic ?? ""}`} fill sizes="(max-width: 991px) 100vw, 40vw" />
            <span className={styles.featureContent}>
                <span className={styles.featureTitle}>
                    {feature.title} {feature.titleItalic && <em>{feature.titleItalic}</em>}
                </span>
                <span className={styles.featureText}>{feature.description}</span>
                <span className={styles.featureCta}>Discover</span>
            </span>
        </SmartLink>
    );
};

export default JewelleryFeatureTile;
