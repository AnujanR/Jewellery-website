import SellGoldPage from "@/components/jewellery/trust/SellGoldPage";
import { BRAND_NAME } from "@/constant/brand";
import { getDictionary } from "@/i18n/get-dictionary";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
    const dict = await getDictionary();
    return { title: `${dict.estimator.metaTitle} – ${BRAND_NAME}`, description: dict.estimator.intro };
}

export default function Page() {
    return (
        <main>
            <SellGoldPage />
        </main>
    );
}
