import { CertificateMissing, CertificateView } from "@/components/jewellery/trust/VerifyScreen";
import { getCertificate } from "@/data/certificates";
import { BRAND_NAME } from "@/constant/brand";
import { getDictionary } from "@/i18n/get-dictionary";
import { qrSvg, requestOrigin } from "@/lib/qr-svg";
import { Metadata } from "next";

interface PageProps {
    params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { code } = await params;
    const certificate = getCertificate(code);
    const dict = await getDictionary();
    return {
        title: certificate
            ? `${dict.verify.number} ${certificate.code} – ${BRAND_NAME}`
            : `${dict.verify.notFoundTitle} – ${BRAND_NAME}`,
    };
}

export default async function Page({ params }: PageProps) {
    const { code } = await params;
    const certificate = getCertificate(code);

    if (!certificate) {
        return (
            <main>
                <CertificateMissing code={decodeURIComponent(code).toUpperCase()} />
            </main>
        );
    }

    const url = `${await requestOrigin()}/verify/${certificate.code}`;
    const qr = await qrSvg(url, 220);

    return (
        <main>
            <CertificateView cert={certificate} qrSvg={qr} />
        </main>
    );
}
