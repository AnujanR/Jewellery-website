import GoldRatesBoard from "@/components/jewellery/trust/GoldRatesBoard";
import { BRAND_NAME } from "@/constant/brand";
import { getDictionary } from "@/i18n/get-dictionary";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
    const dict = await getDictionary();
    return { title: `${dict.rates.metaTitle} – ${BRAND_NAME}`, description: dict.rates.intro };
}

export default function GoldRatesPage() {
    return (
        <main>
            <GoldRatesBoard />
        </main>
    );
}
