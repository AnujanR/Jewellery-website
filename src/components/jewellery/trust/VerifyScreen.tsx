"use client";

import type { Certificate } from "@/data/certificates";
import { formatGrams, formatTestDate } from "@/data/gold-rates";
import { useLocale } from "@/i18n/LocaleProvider";
import SmartLink from "@/components/common/SmartLink";
import { whatsappHref } from "@/constant/contact";
import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import styles from "./trust.module.scss";

export interface SampleCertificate {
    code: string;
    item: Certificate["item"];
    qr: string;
}

const VerifyScreen = ({ samples }: { samples: SampleCertificate[] }) => {
    const { dict } = useLocale();
    const router = useRouter();
    const [code, setCode] = useState("");
    const copy = dict.verify;

    const submit = (event: FormEvent) => {
        event.preventDefault();
        const next = code.trim();
        if (!next) return;
        router.push(`/verify/${encodeURIComponent(next.toUpperCase())}`);
    };

    return (
        <div className={styles.page}>
            <header className={styles.hero}>
                <p className={styles.eyebrow}>{copy.eyebrow}</p>
                <h1 className={styles.title}>
                    {copy.title} <em>{copy.titleEm}</em>
                </h1>
                <p className={styles.lede}>{copy.intro}</p>
            </header>

            <section className={styles.section}>
                <form onSubmit={submit} className={styles.lookup}>
                    <label className={styles.field}>
                        <span>{copy.label}</span>
                        <input
                            className={styles.codeInput}
                            value={code}
                            onChange={(event) => setCode(event.target.value)}
                            placeholder={copy.placeholder}
                            autoCapitalize="characters"
                            autoCorrect="off"
                            spellCheck={false}
                            maxLength={40}
                            required
                        />
                    </label>
                    <button type="submit" className={styles.btnDark}>
                        {copy.submit}
                    </button>
                </form>

                <h2 className={styles.homeTitle}>{copy.samples}</h2>
                <p className={styles.note}>{copy.samplesNote}</p>
                <div className={styles.samples}>
                    {samples.map((sample) => (
                        <SmartLink key={sample.code} href={`/verify/${sample.code}`} className={styles.sample}>
                            <span className={styles.qr} dangerouslySetInnerHTML={{ __html: sample.qr }} />
                            <span>
                                <strong>{sample.code}</strong>
                                <span>{copy.items[sample.item]}</span>
                            </span>
                        </SmartLink>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default VerifyScreen;

const CertificatePhoto = ({ src, alt }: { src?: string; alt: string }) => (
    <div className={styles.certPhoto}>
        {src ? <img src={src} alt={alt} /> : null}
    </div>
);

export const CertificateView = ({ cert, qrSvg }: { cert: Certificate; qrSvg: string }) => {
    const { locale, dict } = useLocale();
    const copy = dict.verify;
    const purity = `${cert.carat}K · ${cert.purityPercent}%`;
    const [open, setOpen] = useState(false);
    const [zoom, setZoom] = useState(1);

    useEffect(() => {
        if (!open) return;
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
            if (event.key === "+" || event.key === "=") setZoom((value) => Math.min(2.5, value + 0.25));
            if (event.key === "-" || event.key === "_") setZoom((value) => Math.max(1, value - 0.25));
        };
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = previous;
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    const openViewer = () => {
        setZoom(1);
        setOpen(true);
    };

    return (
        <div className={styles.page}>
            <header className={styles.hero}>
                <p className={styles.eyebrow}>{copy.issued}</p>
                <h1 className={styles.title}>
                    {copy.number}
                    <br />
                    {cert.code}
                </h1>
            </header>
            <section className={styles.section}>
                <div
                    className={styles.certOpen}
                    role="button"
                    tabIndex={0}
                    aria-label={copy.view}
                    onClick={openViewer}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            openViewer();
                        }
                    }}
                >
                    <CertificatePhoto src={cert.image} alt={copy.view} />
                    <span className={styles.certOpenLabel}>{copy.view}</span>
                </div>
                <article className={styles.certificate}>
                    <div>
                        <span className={styles.verified}>{copy.verified}</span>
                        <dl className={styles.certList}>
                            <div>
                                <dt>{copy.number}</dt>
                                <dd>{cert.code}</dd>
                            </div>
                            <div>
                                <dt>{copy.item}</dt>
                                <dd>{copy.items[cert.item]}</dd>
                            </div>
                            <div>
                                <dt>{copy.purity}</dt>
                                <dd>{purity}</dd>
                            </div>
                            <div>
                                <dt>{copy.weight}</dt>
                                <dd>{formatGrams(cert.weightGrams)}</dd>
                            </div>
                            <div>
                                <dt>{copy.method}</dt>
                                <dd>{copy.methods[cert.method]}</dd>
                            </div>
                            <div>
                                <dt>{copy.date}</dt>
                                <dd>{formatTestDate(cert.testedAt, locale)}</dd>
                            </div>
                        </dl>
                    </div>
                    <div className={styles.qrBlock}>
                        <div className={styles.qr} dangerouslySetInnerHTML={{ __html: qrSvg }} />
                        <p>{copy.qrCaption}</p>
                    </div>
                </article>
            </section>
            {open
                ? createPortal(
                <div className={styles.viewer} role="dialog" aria-modal="true" aria-label={copy.view}>
                    <div className={styles.viewerBar}>
                        <button type="button" onClick={() => setZoom((value) => Math.max(1, value - 0.25))}>
                            {copy.zoomOut}
                        </button>
                        <button type="button" onClick={() => setZoom((value) => Math.min(2.5, value + 0.25))}>
                            {copy.zoomIn}
                        </button>
                        <button type="button" onClick={() => setOpen(false)}>
                            {copy.close}
                        </button>
                    </div>
                    <div
                        className={styles.viewerStage}
                        onClick={(event) => {
                            if (event.target === event.currentTarget) setOpen(false);
                        }}
                    >
                        <div className={styles.viewerFrame} style={zoom === 1 ? undefined : { width: 720 * zoom }}>
                            <CertificatePhoto src={cert.image} alt={copy.view} />
                        </div>
                    </div>
                </div>,
                document.body,
            ) : null}
        </div>
    );
};

export const CertificateMissing = ({ code }: { code: string }) => {
    const { dict } = useLocale();
    const copy = dict.verify;

    return (
        <div className={styles.page}>
            <header className={`${styles.hero} ${styles.missing}`}>
                <p className={styles.eyebrow}>{copy.eyebrow}</p>
                <h1 className={styles.title}>{copy.notFoundTitle}</h1>
                <p className={styles.lede}>{copy.notFound}</p>
                <p className={styles.note}>{code}</p>
                <div className={styles.actions}>
                    <a className={styles.btnWa} href={whatsappHref(dict.whatsapp.verify(code))} target="_blank" rel="noopener noreferrer">
                        {copy.whatsapp}
                    </a>
                    <SmartLink href="/verify" className={styles.btnLight}>
                        {copy.submit}
                    </SmartLink>
                </div>
            </header>
        </div>
    );
};
