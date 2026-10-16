"use client";

import { formatBoardStamp, formatLkr, goldRates, sovereignPrice } from "@/data/gold-rates";
import { useLocale } from "@/i18n/LocaleProvider";
import SmartLink from "@/components/common/SmartLink";
import styles from "./trust.module.scss";

const rows = [
    { karat: "k22" as const, buy: goldRates.k22.buyPerGram, sell: goldRates.k22.sellPerGram, featured: true },
    { karat: "k24" as const, buy: goldRates.k24.buyPerGram, sell: goldRates.k24.sellPerGram, featured: false },
];

const RateCards = ({ locale, copy }: { locale: "en" | "si" | "ta"; copy: ReturnType<typeof useLocale>["dict"]["rates"] }) => (
    <div className={styles.rateGrid}>
        {rows.map((row) => (
            <article key={row.karat} className={`${styles.rateCard} ${row.featured ? styles.rateCardFeatured : ""}`}>
                <h3 className={styles.rateKarat}>{copy[row.karat]}</h3>
                <div className={styles.ratePair}>
                    <div>
                        <p className={styles.rateKind}>{copy.weSell}</p>
                        <p className={styles.rateFigure}>{formatLkr(row.sell, locale)}</p>
                        <p className={styles.rateUnit}>{copy.perGram}</p>
                        <p className={styles.rateSov}>{formatLkr(sovereignPrice(row.sell), locale)}</p>
                        <p className={styles.rateUnit}>{copy.perSovereign}</p>
                    </div>
                    <div>
                        <p className={styles.rateKind}>{copy.weBuy}</p>
                        <p className={styles.rateFigure}>{formatLkr(row.buy, locale)}</p>
                        <p className={styles.rateUnit}>{copy.perGram}</p>
                        <p className={styles.rateSov}>{formatLkr(sovereignPrice(row.buy), locale)}</p>
                        <p className={styles.rateUnit}>{copy.perSovereign}</p>
                    </div>
                </div>
            </article>
        ))}
    </div>
);

const GoldRatesBoard = ({ variant = "page" }: { variant?: "home" | "page" }) => {
    const { locale, dict } = useLocale();
    const copy = dict.rates;
    const stamp = formatBoardStamp(goldRates.updatedAt, locale);

    const board = (
        <>
            <RateCards locale={locale} copy={copy} />
            <p className={styles.rateNote}>
                {copy.note} {copy.sovereignNote}
            </p>
            <div className={styles.rateActions}>
                <SmartLink href="/sell-gold" className={styles.rateBtn}>
                    {copy.sellCta}
                </SmartLink>
                <SmartLink href="/testing" className={styles.rateBtnGhost}>
                    {copy.testCta}
                </SmartLink>
            </div>
        </>
    );

    if (variant === "home") {
        return (
            <section className={styles.homeBoard} aria-labelledby="gold-rates-heading">
                <div className={styles.rateStage}>
                    <div className={styles.rateHead}>
                        <div>
                            <p className={styles.live}>
                                <span className={styles.liveDot} aria-hidden="true" />
                                {copy.eyebrow}
                            </p>
                            <h2 id="gold-rates-heading" className={styles.rateTitle}>
                                {copy.homeTitle}
                            </h2>
                            <p className={styles.rateLede}>{copy.homeText}</p>
                        </div>
                        <p className={styles.rateStamp}>
                            {copy.updated}
                            <strong>{stamp}</strong>
                        </p>
                    </div>
                    {board}
                </div>
            </section>
        );
    }

    return (
        <section className={styles.pageBoard} aria-labelledby="gold-rates-heading">
            <div className={styles.boardHead}>
                <div>
                    <p className={styles.eyebrow}>{copy.eyebrow}</p>
                    <h1 id="gold-rates-heading" className={styles.title}>
                        {copy.title} <em>{copy.titleEm}</em>
                    </h1>
                    <p className={styles.lede}>{copy.intro}</p>
                </div>
                <p className={styles.stamp}>
                    {copy.updated} {stamp}
                </p>
            </div>
            <div className={styles.rateStageInset}>{board}</div>
        </section>
    );
};

export default GoldRatesBoard;
