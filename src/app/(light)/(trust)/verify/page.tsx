import VerifyScreen from "@/components/jewellery/trust/VerifyScreen";
import { certificates } from "@/data/certificates";
import { BRAND_NAME } from "@/constant/brand";
import { getDictionary } from "@/i18n/get-dictionary";
import { qrSvg, requestOrigin } from "@/lib/qr-svg";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
    const dict = await getDictionary();
    return { title: `${dict.verify.metaTitle} – ${BRAND_NAME}`, description: dict.verify.intro };
}

export default async function Page() {
    const origin = await requestOrigin();
    const samples = await Promise.all(
        certificates.map(async (certificate) => ({
            code: certificate.code,
            item: certificate.item,
            qr: await qrSvg(`${origin}/verify/${certificate.code}`, 112),
        }))
    );

    return (
        <main>
            <VerifyScreen samples={samples} />
        </main>
    );
}
