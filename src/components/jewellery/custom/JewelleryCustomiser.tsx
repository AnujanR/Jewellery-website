"use client";
import {
    bandOptions,
    bandWidthOptions,
    caratOptions,
    CustomDesign,
    ENGRAVING_MAX,
    estimateDesignPrice,
    metalOptions,
    parseDesign,
    pieceOptions,
    ringSizes,
    serializeDesign,
    settingOptions,
    shapeOptions,
    stoneOptions,
    tagSizeOptions,
    clusterOvalCount,
    coverageOptions,
    hasRingSize,
    isMetalOnly,
} from "@/data/jewellery-custom-data";
import FancySelect from "@/components/jewellery/form/FancySelect";
import JewelleryDesignInquiry from "./JewelleryDesignInquiry";
import { formatLkr } from "@/data/gold-rates";
import { useLocale } from "@/i18n/LocaleProvider";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { useSearchParams } from "next/navigation";
import { ReactNode, useCallback, useRef, useState } from "react";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";
import styles from "./jewellery-custom.module.scss";

const JewelleryViewer = dynamic(() => import("./JewelleryViewer"), {
    ssr: false,
    loading: () => <div className={styles.viewerLoading}>Preparing your studio…</div>,
});

const SNAPSHOT_SIZE = 900;

const Step = ({ index, title, value, children }: { index: number; title: string; value?: string; children: ReactNode }) => (
    <div className={styles.step}>
        <div className={styles.stepHead}>
            <span className={styles.stepIndex}>{String(index).padStart(2, "0")}</span>
            <span className={styles.stepTitle}>{title}</span>
            {value && <span className={styles.stepValue}>{value}</span>}
        </div>
        {children}
    </div>
);

const Pills = <T extends string | number>({
    options,
    value,
    onChange,
}: {
    options: { id: T; label: string }[];
    value: T;
    onChange: (value: T) => void;
}) => (
    <div className={styles.pills}>
        {options.map((option) => (
            <button
                key={option.id}
                type="button"
                aria-pressed={option.id === value}
                className={`${styles.pill} ${option.id === value ? styles.pillActive : ""}`}
                onClick={() => onChange(option.id)}
            >
                {option.label}
            </button>
        ))}
    </div>
);

const scrollToId = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    const smoother = ScrollSmoother.get();
    if (smoother) smoother.scrollTo(target, true, "top 110px");
    else target.scrollIntoView({ behavior: "smooth", block: "start" });
};

const JewelleryCustomiser = ({ children }: { children?: ReactNode }) => {
    const searchParams = useSearchParams();
    const { locale } = useLocale();
    const [design, setDesign] = useState<CustomDesign>(() => parseDesign(new URLSearchParams(searchParams.toString())));
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const update = (patch: Partial<CustomDesign>) => {
        const next = { ...design, ...patch };
        setDesign(next);
        window.history.replaceState(null, "", `?${serializeDesign(next)}`);
    };

    const getSnapshot = useCallback(() => {
        const source = canvasRef.current;
        if (!source) return null;
        const ratio = Math.min(1, SNAPSHOT_SIZE / Math.max(source.width, source.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(source.width * ratio);
        canvas.height = Math.round(source.height * ratio);
        canvas.getContext("2d")?.drawImage(source, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL("image/jpeg", 0.85);
    }, []);

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            toast.success("Design link copied");
        } catch {
            toast.error("Couldn't copy the link – copy it from the address bar instead");
        }
    };

    const price = estimateDesignPrice(design);
    const metal = metalOptions.find((m) => m.id === design.metal)!;
    const stone = stoneOptions.find((s) => s.id === design.stone)!;
    const isRing = design.piece === "ring";
    const isTag = design.piece === "tag";
    const isCluster = design.piece === "cluster";
    const isDeco = design.piece === "deco";
    const isBlossom = design.piece === "blossom";
    const isBypass = design.piece === "bypass";
    const isFlora = design.piece === "flora";
    const isLattice = design.piece === "lattice";
    const metalOnly = isMetalOnly(design.piece);
    const stoneTitle = isTag
        ? "Halo stones"
        : isCluster
          ? "Oval stones"
          : isDeco
            ? "Accent stones"
            : isBlossom
              ? "Petal stones"
              : isBypass
                ? "Rubies"
                : isFlora
                  ? "Flower accents"
                  : isLattice
                    ? "Lattice stones"
                    : "Gemstone";
    let step = 0;

    const engravingField = (
        <label className={styles.field}>
            <span>
                {isTag ? "Front engraving" : "Engraving"} <em>{design.engraving.length}/{ENGRAVING_MAX}</em>
            </span>
            <input
                type="text"
                value={design.engraving}
                maxLength={ENGRAVING_MAX}
                placeholder={isTag ? "e.g. Amara" : "e.g. Always & forever"}
                onChange={(e) => update({ engraving: e.target.value })}
            />
        </label>
    );

    return (
        <>
            <section className={styles.builder}>
                <div className={styles.viewerCol}>
                    <div className={styles.viewer}>
                        <JewelleryViewer design={design} onCanvasReady={(canvas) => (canvasRef.current = canvas)} />
                        <span className={styles.viewerHint}>Drag to rotate · Scroll to zoom</span>
                        <div className={styles.viewerPrice}>
                            <span>Estimated from</span>
                            <strong>{formatLkr(price, locale)}</strong>
                        </div>
                    </div>
                </div>

                <div className={styles.panel}>
                    <Step index={++step} title="Choose your piece">
                        <Pills
                            options={pieceOptions}
                            value={design.piece}
                            onChange={(piece) =>
                                update(
                                    piece === "bypass" || piece === "flora"
                                        ? { piece, stone: "ruby", metal: "yellow-gold" }
                                        : piece === "lattice"
                                          ? { piece, stone: "diamond", metal: "yellow-gold" }
                                          : { piece }
                                )
                            }
                        />
                    </Step>

                    <Step index={++step} title="Metal" value={metal.label}>
                        <div className={styles.swatches}>
                            {metalOptions.map((option) => (
                                <button
                                    key={option.id}
                                    type="button"
                                    aria-label={option.label}
                                    aria-pressed={option.id === design.metal}
                                    className={`${styles.swatch} ${option.id === design.metal ? styles.swatchActive : ""}`}
                                    onClick={() => update({ metal: option.id })}
                                >
                                    <span style={{ background: option.swatch }} />
                                </button>
                            ))}
                        </div>
                    </Step>

                    {!metalOnly && (
                        <Step index={++step} title={stoneTitle} value={stone.label}>
                            <div className={styles.swatches}>
                                {stoneOptions.map((option) => (
                                    <button
                                        key={option.id}
                                        type="button"
                                        aria-label={option.label}
                                        aria-pressed={option.id === design.stone}
                                        className={`${styles.swatch} ${styles.swatchGem} ${option.id === design.stone ? styles.swatchActive : ""}`}
                                        onClick={() => update({ stone: option.id })}
                                    >
                                        <span style={{ background: option.color }} />
                                    </button>
                                ))}
                            </div>
                        </Step>
                    )}

                    {isCluster && (
                        <Step index={++step} title="Coverage" value={`${clusterOvalCount(design.coverage)} oval stones`}>
                            <Pills options={coverageOptions} value={design.coverage} onChange={(coverage) => update({ coverage })} />
                        </Step>
                    )}

                    {metalOnly || isCluster || isDeco || isBlossom || isBypass || isFlora || isLattice ? null : isTag ? (
                        <>
                            <Step index={++step} title="Size">
                                <Pills
                                    options={tagSizeOptions.map((s) => ({ id: s, label: `${s} × ${s}mm` }))}
                                    value={design.tagSize}
                                    onChange={(tagSize) => update({ tagSize })}
                                />
                            </Step>

                            <Step index={++step} title="Engraving">
                                {engravingField}
                            </Step>
                        </>
                    ) : (
                        <>
                            <Step index={++step} title="Shape">
                                <Pills options={shapeOptions} value={design.shape} onChange={(shape) => update({ shape })} />
                            </Step>

                            <Step index={++step} title={design.piece === "earrings" ? "Carat (each)" : "Carat"}>
                                <Pills
                                    options={caratOptions.map((c) => ({ id: c, label: `${c}ct` }))}
                                    value={design.carat}
                                    onChange={(carat) => update({ carat })}
                                />
                            </Step>

                            <Step index={++step} title="Setting">
                                <Pills options={settingOptions} value={design.setting} onChange={(setting) => update({ setting })} />
                            </Step>
                        </>
                    )}

                    {isRing && (
                        <Step index={++step} title="Band">
                            <Pills options={bandOptions} value={design.band} onChange={(band) => update({ band })} />
                            <div className={styles.subOption}>
                                <span>Width</span>
                                <Pills
                                    options={bandWidthOptions.map((w) => ({ id: w, label: `${w}mm` }))}
                                    value={design.bandWidth}
                                    onChange={(bandWidth) => update({ bandWidth })}
                                />
                            </div>
                        </Step>
                    )}

                    {hasRingSize(design.piece) && (
                        <Step index={++step} title="Size & engraving">
                            <div className={styles.fieldRow}>
                                <label className={styles.field}>
                                    <span>Ring size</span>
                                    <FancySelect
                                        aria-label="Ring size"
                                        value={design.size}
                                        onChange={(size) => update({ size })}
                                        options={ringSizes.map((size) => ({ value: size, label: size }))}
                                    />
                                </label>
                                {engravingField}
                            </div>
                        </Step>
                    )}

                    <div className={styles.panelFoot}>
                        <div className={styles.panelPrice}>
                            <span>Estimated from</span>
                            <strong>{formatLkr(price, locale)}</strong>
                        </div>
                        <p className={styles.panelNote}>
                            Final pricing depends on stone grading and is confirmed during your consultation.
                        </p>
                        <button type="button" className={styles.btnDark} onClick={() => scrollToId("design-enquiry")}>
                            Enquire about this design
                        </button>
                        <button type="button" className={styles.btnLight} onClick={copyLink}>
                            Copy design link
                        </button>
                    </div>
                </div>
            </section>

            {children}

            <JewelleryDesignInquiry design={design} price={price} getSnapshot={getSnapshot} />
        </>
    );
};

export default JewelleryCustomiser;
