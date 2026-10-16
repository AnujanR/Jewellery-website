export type PieceType =
    | "ring"
    | "cluster"
    | "deco"
    | "blossom"
    | "pendant"
    | "earrings"
    | "tag"
    | "trishula"
    | "bypass"
    | "flora"
    | "lattice";
export type MetalId = "yellow-gold" | "rose-gold" | "white-gold" | "platinum";
export type StoneId = "diamond" | "sapphire" | "emerald" | "ruby" | "rhodolite" | "morganite" | "aquamarine";
export type ShapeId = "round" | "oval" | "princess" | "emerald-cut";
export type SettingId = "claw" | "bezel" | "halo";
export type BandId = "classic" | "flat" | "pave" | "twist";
export type CoverageId = "half" | "three-quarter" | "full";

export interface CustomDesign {
    piece: PieceType;
    metal: MetalId;
    stone: StoneId;
    shape: ShapeId;
    carat: number;
    setting: SettingId;
    band: BandId;
    bandWidth: number;
    size: string;
    tagSize: number;
    coverage: CoverageId;
    engraving: string;
}

interface Option<T extends string> {
    id: T;
    label: string;
}

/** Base prices in LKR. */
export const pieceOptions: (Option<PieceType> & { from: number })[] = [
    { id: "ring", label: "Ring", from: 180000 },
    { id: "cluster", label: "Cluster band", from: 580000 },
    { id: "deco", label: "Deco cocktail ring", from: 660000 },
    { id: "blossom", label: "Blossom ring", from: 276000 },
    { id: "pendant", label: "Pendant", from: 152000 },
    { id: "earrings", label: "Stud earrings", from: 208000 },
    { id: "tag", label: "Halo tag pendant", from: 216000 },
    { id: "trishula", label: "Trishula pendant", from: 312000 },
    { id: "bypass", label: "Ruby bypass bangle", from: 468000 },
    { id: "flora", label: "Flora bypass ring", from: 384000 },
    { id: "lattice", label: "Lattice bangle", from: 528000 },
];

/** Pieces that carry a single centre stone with a chosen shape, carat and setting. */
export const hasCentreStone = (piece: PieceType) => piece === "ring" || piece === "pendant" || piece === "earrings";
export const hasRingSize = (piece: PieceType) =>
    piece === "ring" || piece === "cluster" || piece === "deco" || piece === "blossom" || piece === "flora";
export const isEngravable = (piece: PieceType) => hasRingSize(piece) || piece === "tag";
/** Solid sculptural pieces with no gemstone options – metal only. */
export const isMetalOnly = (piece: PieceType) => piece === "trishula";

export const metalOptions: (Option<MetalId> & { color: string; swatch: string; multiplier: number })[] = [
    { id: "yellow-gold", label: "18ct Yellow Gold", color: "#e6c07a", swatch: "linear-gradient(135deg, #f3dc9f, #c9a052)", multiplier: 1 },
    { id: "rose-gold", label: "18ct Rose Gold", color: "#e9b59c", swatch: "linear-gradient(135deg, #f6cdb9, #c98a6f)", multiplier: 1 },
    { id: "white-gold", label: "18ct White Gold", color: "#e4e4e2", swatch: "linear-gradient(135deg, #fbfbfa, #b9b9b6)", multiplier: 1.05 },
    { id: "platinum", label: "Platinum", color: "#d6dade", swatch: "linear-gradient(135deg, #f2f4f6, #a4abb2)", multiplier: 1.35 },
];

export const stoneOptions: (Option<StoneId> & { color: string; perCarat: number })[] = [
    { id: "diamond", label: "Diamond", color: "#ffffff", perCarat: 720000 },
    { id: "sapphire", label: "Blue Sapphire", color: "#2350c4", perCarat: 380000 },
    { id: "emerald", label: "Emerald", color: "#1d9a5a", perCarat: 420000 },
    { id: "ruby", label: "Ruby", color: "#c8173c", perCarat: 460000 },
    { id: "rhodolite", label: "Rhodolite", color: "#b0127a", perCarat: 168000 },
    { id: "morganite", label: "Morganite", color: "#f0b2a2", perCarat: 128000 },
    { id: "aquamarine", label: "Aquamarine", color: "#8ed4e2", perCarat: 144000 },
];

export const shapeOptions: Option<ShapeId>[] = [
    { id: "round", label: "Round" },
    { id: "oval", label: "Oval" },
    { id: "princess", label: "Princess" },
    { id: "emerald-cut", label: "Emerald cut" },
];

export const settingOptions: (Option<SettingId> & { extra: number })[] = [
    { id: "claw", label: "Claw", extra: 0 },
    { id: "bezel", label: "Bezel", extra: 48000 },
    { id: "halo", label: "Halo", extra: 180000 },
];

export const bandOptions: (Option<BandId> & { extra: number })[] = [
    { id: "classic", label: "Classic", extra: 0 },
    { id: "flat", label: "Flat edge", extra: 16000 },
    { id: "pave", label: "Pavé", extra: 140000 },
    { id: "twist", label: "Twist", extra: 60000 },
];

/** How far around the cluster band the stones run, in degrees; the rest is open metal links. */
export const coverageOptions: (Option<CoverageId> & { degrees: number })[] = [
    { id: "half", label: "Half eternity", degrees: 190 },
    { id: "three-quarter", label: "Three-quarter", degrees: 290 },
    { id: "full", label: "Full eternity", degrees: 360 },
];

export const CLUSTER_COLUMNS = 16;
const CLUSTER_OVAL_CARAT = 0.25;
const CLUSTER_PAVE_CARAT_PER_OVAL = 0.06;

/** Angle of column `index` measured from the top of the ring, in (-π, π]. */
export const clusterColumnAngle = (index: number) => {
    const angle = (index / CLUSTER_COLUMNS) * Math.PI * 2;
    return angle > Math.PI ? angle - Math.PI * 2 : angle;
};

export const isClusterStoneColumn = (index: number, coverage: CoverageId) => {
    const degrees = coverageOptions.find((c) => c.id === coverage)!.degrees;
    return Math.abs(clusterColumnAngle(index)) <= ((degrees / 2) * Math.PI) / 180 + 1e-6;
};

export const clusterOvalCount = (coverage: CoverageId) =>
    Array.from({ length: CLUSTER_COLUMNS }, (_, i) => i).filter((i) => isClusterStoneColumn(i, coverage)).length * 2;

/** The deco ring carries a tapering cluster of six accent stones at each tip of its openwork pavé face. */
export const DECO_ACCENT_COUNT = 12;
const DECO_ACCENT_CARAT = 0.04;
const DECO_PAVE_CARAT = 0.65;

/** Five pavé petals around a raised cluster of seven diamonds. */
const BLOSSOM_PETAL_CARAT = 0.45;
const BLOSSOM_CENTRE_CARAT = 0.25;

/** Bypass bangle: four channel-set rails + four bezel accents. */
const BYPASS_PAVE_CARAT = 0.42;
const BYPASS_BEZEL_COUNT = 4;
const BYPASS_BEZEL_CARAT = 0.07;

/** Flora bypass ring: diamond-pavé split shank + ruby accents + emerald centres. */
const FLORA_PAVE_CARAT = 0.28;
const FLORA_ACCENT_COUNT = 12;
const FLORA_ACCENT_CARAT = 0.04;
const FLORA_CENTRE_COUNT = 2;
const FLORA_CENTRE_CARAT = 0.08;

/** Lattice bangle: openwork teardrop panels with diamond accents. */
const LATTICE_STONE_CARAT = 0.85;

export const caratOptions = [0.5, 0.75, 1, 1.5, 2];
export const bandWidthOptions = [2, 2.5, 3, 4];
export const ringSizes = ["H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W"];
export const tagSizeOptions = [12, 15, 18];
export const ENGRAVING_MAX = 20;

/** Approximate total weight of the pavé stones around a tag of the given size (mm). */
const tagHaloCarat = (tagSize: number) => Math.round(tagSize * 0.022 * 100) / 100;

export const defaultDesign: CustomDesign = {
    piece: "ring",
    metal: "yellow-gold",
    stone: "diamond",
    shape: "round",
    carat: 1,
    setting: "claw",
    band: "classic",
    bandWidth: 2.5,
    size: "L",
    tagSize: 15,
    coverage: "three-quarter",
    engraving: "",
};

const findLabel = <T extends string>(options: Option<T>[], id: T) =>
    options.find((o) => o.id === id)?.label ?? id;

const diamondPerCarat = () => stoneOptions.find((s) => s.id === "diamond")!.perCarat;

export const estimateDesignPrice = (design: CustomDesign) => {
    const piece = pieceOptions.find((p) => p.id === design.piece)!;
    const metal = metalOptions.find((m) => m.id === design.metal)!;
    const stone = stoneOptions.find((s) => s.id === design.stone)!;
    const setting = settingOptions.find((s) => s.id === design.setting)!;
    const stones = design.piece === "earrings" ? 2 : 1;
    const round = (value: number) => Math.round(value / 1000) * 1000;

    if (design.piece === "tag") {
        return round(
            piece.from * metal.multiplier +
            (design.tagSize - 12) * 12000 * metal.multiplier +
            stone.perCarat * tagHaloCarat(design.tagSize)
        );
    }

    if (design.piece === "cluster") {
        const ovals = clusterOvalCount(design.coverage);
        return round(
            piece.from * metal.multiplier +
            ovals * CLUSTER_OVAL_CARAT * stone.perCarat +
            ovals * CLUSTER_PAVE_CARAT_PER_OVAL * diamondPerCarat()
        );
    }

    if (design.piece === "deco") {
        return round(
            piece.from * metal.multiplier +
            DECO_ACCENT_COUNT * DECO_ACCENT_CARAT * stone.perCarat +
            DECO_PAVE_CARAT * diamondPerCarat()
        );
    }

    if (design.piece === "blossom") {
        return round(
            piece.from * metal.multiplier + BLOSSOM_PETAL_CARAT * stone.perCarat + BLOSSOM_CENTRE_CARAT * diamondPerCarat()
        );
    }

    if (design.piece === "trishula") {
        return round(piece.from * metal.multiplier);
    }

    if (design.piece === "bypass") {
        return round(
            piece.from * metal.multiplier +
                BYPASS_PAVE_CARAT * stone.perCarat +
                BYPASS_BEZEL_COUNT * BYPASS_BEZEL_CARAT * stone.perCarat
        );
    }

    if (design.piece === "flora") {
        const emerald = stoneOptions.find((s) => s.id === "emerald")!;
        return round(
            piece.from * metal.multiplier +
                FLORA_PAVE_CARAT * diamondPerCarat() +
                FLORA_ACCENT_COUNT * FLORA_ACCENT_CARAT * stone.perCarat +
                FLORA_CENTRE_COUNT * FLORA_CENTRE_CARAT * emerald.perCarat
        );
    }

    if (design.piece === "lattice") {
        return round(piece.from * metal.multiplier + LATTICE_STONE_CARAT * stone.perCarat);
    }

    let total = piece.from * metal.multiplier;
    total += stone.perCarat * design.carat * stones;
    total += setting.extra * stones;
    if (design.piece === "ring") {
        total += bandOptions.find((b) => b.id === design.band)!.extra;
        total += (design.bandWidth - 2) * 36000 * metal.multiplier;
    }
    return round(total);
};

export const describeDesign = (design: CustomDesign) => {
    const rows: [string, string][] = [
        ["Piece", findLabel(pieceOptions, design.piece)],
        ["Metal", findLabel(metalOptions, design.metal)],
    ];
    if (hasCentreStone(design.piece)) {
        rows.push(
            ["Stone", findLabel(stoneOptions, design.stone)],
            ["Shape", findLabel(shapeOptions, design.shape)],
            ["Carat", `${design.carat}ct${design.piece === "earrings" ? " each" : ""}`],
            ["Setting", findLabel(settingOptions, design.setting)],
        );
    } else if (design.piece === "cluster") {
        const ovals = clusterOvalCount(design.coverage);
        rows.push(
            ["Oval stones", `${ovals} × ${findLabel(stoneOptions, design.stone)}, approx. ${CLUSTER_OVAL_CARAT}ct each`],
            ["Pavé", `Diamond, approx. ${Math.round(ovals * CLUSTER_PAVE_CARAT_PER_OVAL * 100) / 100}ct total`],
            ["Coverage", findLabel(coverageOptions, design.coverage)],
        );
    } else if (design.piece === "deco") {
        rows.push(
            [
                "Accent stones",
                `${DECO_ACCENT_COUNT} × ${findLabel(stoneOptions, design.stone)}, approx. ${Math.round(DECO_ACCENT_COUNT * DECO_ACCENT_CARAT * 100) / 100}ct total`,
            ],
            ["Pavé", `Diamond, approx. ${DECO_PAVE_CARAT}ct total`],
        );
    } else if (design.piece === "blossom") {
        rows.push(
            ["Petal stones", `${findLabel(stoneOptions, design.stone)}, approx. ${BLOSSOM_PETAL_CARAT}ct total`],
            ["Centre", `Seven-diamond cluster, approx. ${BLOSSOM_CENTRE_CARAT}ct`],
        );
    } else if (design.piece === "trishula") {
        rows.push(["Finish", "Polished shaft with textured side prongs and damaru"]);
    } else if (design.piece === "bypass") {
        rows.push(
            ["Channel stones", `${findLabel(stoneOptions, design.stone)}, approx. ${BYPASS_PAVE_CARAT}ct total`],
            [
                "Bezel accents",
                `${BYPASS_BEZEL_COUNT} × ${findLabel(stoneOptions, design.stone)}, approx. ${Math.round(BYPASS_BEZEL_COUNT * BYPASS_BEZEL_CARAT * 100) / 100}ct total`,
            ]
        );
    } else if (design.piece === "flora") {
        rows.push(
            ["Rail pavé", `Diamond, approx. ${FLORA_PAVE_CARAT}ct total`],
            [
                "Flower accents",
                `${FLORA_ACCENT_COUNT} × ${findLabel(stoneOptions, design.stone)}, approx. ${Math.round(FLORA_ACCENT_COUNT * FLORA_ACCENT_CARAT * 100) / 100}ct total`,
            ],
            [
                "Centres",
                `${FLORA_CENTRE_COUNT} × Emerald, approx. ${Math.round(FLORA_CENTRE_COUNT * FLORA_CENTRE_CARAT * 100) / 100}ct total`,
            ]
        );
    } else if (design.piece === "lattice") {
        rows.push(
            ["Openwork stones", `${findLabel(stoneOptions, design.stone)}, approx. ${LATTICE_STONE_CARAT}ct total`],
            ["Finish", "Hinged double-rail lattice with teardrop panels"],
        );
    } else {
        rows.push(
            ["Halo stones", `${findLabel(stoneOptions, design.stone)}, approx. ${tagHaloCarat(design.tagSize)}ct total`],
            ["Size", `${design.tagSize} × ${design.tagSize}mm`],
        );
    }
    if (design.piece === "ring") {
        rows.push(["Band", `${findLabel(bandOptions, design.band)}, ${design.bandWidth}mm`]);
    }
    if (hasRingSize(design.piece)) rows.push(["Ring size", design.size]);
    if (isEngravable(design.piece) && design.engraving) rows.push(["Engraving", `“${design.engraving}”`]);
    return rows;
};

const pick = <T extends string | number>(value: string | null, allowed: readonly T[], fallback: T): T => {
    if (value === null) return fallback;
    const match = allowed.find((a) => String(a) === value);
    return match ?? fallback;
};

export const parseDesign = (params: URLSearchParams): CustomDesign => ({
    piece: pick(params.get("piece"), pieceOptions.map((o) => o.id), defaultDesign.piece),
    metal: pick(params.get("metal"), metalOptions.map((o) => o.id), defaultDesign.metal),
    stone: pick(params.get("stone"), stoneOptions.map((o) => o.id), defaultDesign.stone),
    shape: pick(params.get("shape"), shapeOptions.map((o) => o.id), defaultDesign.shape),
    carat: pick(params.get("carat"), caratOptions, defaultDesign.carat),
    setting: pick(params.get("setting"), settingOptions.map((o) => o.id), defaultDesign.setting),
    band: pick(params.get("band"), bandOptions.map((o) => o.id), defaultDesign.band),
    bandWidth: pick(params.get("width"), bandWidthOptions, defaultDesign.bandWidth),
    size: pick(params.get("size"), ringSizes, defaultDesign.size),
    tagSize: pick(params.get("tagsize"), tagSizeOptions, defaultDesign.tagSize),
    coverage: pick(params.get("coverage"), coverageOptions.map((o) => o.id), defaultDesign.coverage),
    engraving: (params.get("engraving") ?? "").slice(0, ENGRAVING_MAX),
});

export const serializeDesign = (design: CustomDesign) => {
    const params = new URLSearchParams({
        piece: design.piece,
        metal: design.metal,
        stone: design.stone,
    });
    if (hasCentreStone(design.piece)) {
        params.set("shape", design.shape);
        params.set("carat", String(design.carat));
        params.set("setting", design.setting);
    }
    if (design.piece === "tag") params.set("tagsize", String(design.tagSize));
    if (design.piece === "cluster") params.set("coverage", design.coverage);
    if (design.piece === "ring") {
        params.set("band", design.band);
        params.set("width", String(design.bandWidth));
    }
    if (hasRingSize(design.piece)) params.set("size", design.size);
    if (isEngravable(design.piece) && design.engraving) params.set("engraving", design.engraving);
    return params.toString();
};

export const inquiryTimelines = ["As soon as possible", "Within 1 month", "1–3 months", "3+ months", "Just exploring"];
export const inquiryBudgets = [
    "Under Rs 400,000",
    "Rs 400,000 – 1,000,000",
    "Rs 1,000,000 – 2,000,000",
    "Rs 2,000,000 – 4,000,000",
    "Rs 4,000,000+",
];
