export type TestMethod = "xrf" | "fire" | "touchstone";
export type CertificateItem = "chain" | "bangles" | "ring";

export interface Certificate {
    code: string;
    carat: number;
    purityPercent: number;
    weightGrams: number;
    method: TestMethod;
    testedAt: string;
    item: CertificateItem;
    /** Photo of the issued certificate. Empty until an image is added. */
    image?: string;
}

/** Demonstration register. An admin screen can replace this later. */
export const certificates: Certificate[] = [
    {
        code: "KTS-A7K22-10482",
        carat: 22,
        purityPercent: 91.6,
        weightGrams: 32.4,
        method: "xrf",
        testedAt: "2026-10-02",
        item: "chain",
    },
    {
        code: "KTS-B2M24-11095",
        carat: 24,
        purityPercent: 99.9,
        weightGrams: 16.08,
        method: "fire",
        testedAt: "2026-09-18",
        item: "bangles",
    },
    {
        code: "KTS-C9P18-09811",
        carat: 18,
        purityPercent: 75,
        weightGrams: 4.62,
        method: "touchstone",
        testedAt: "2026-10-08",
        item: "ring",
    },
];

export function getCertificate(code: string) {
    const normalised = decodeURIComponent(code).trim().toUpperCase();
    return certificates.find((certificate) => certificate.code.toUpperCase() === normalised) ?? null;
}
