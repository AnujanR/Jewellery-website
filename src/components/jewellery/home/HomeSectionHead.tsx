import SmartLink from "@/components/common/SmartLink";
import styles from "./jewellery-home.module.scss";

interface HomeSectionHeadProps {
    title: React.ReactNode;
    ctaLabel?: string;
    ctaHref?: string;
}

const HomeSectionHead = ({ title, ctaLabel, ctaHref = "/shop" }: HomeSectionHeadProps) => {
    return (
        <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>{title}</h2>
            {ctaLabel && (
                <SmartLink href={ctaHref} className={styles.outlineBtn}>
                    {ctaLabel}
                </SmartLink>
            )}
        </div>
    );
};

export default HomeSectionHead;
