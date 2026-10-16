import TestingPage from "@/components/jewellery/trust/TestingPage";
import { BRAND_NAME } from "@/constant/brand";
import { getDictionary } from "@/i18n/get-dictionary";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
    const dict = await getDictionary();
    return { title: `${dict.testing.metaTitle} – ${BRAND_NAME}`, description: dict.testing.intro };
}

export default function Page() {
    return (
        <main>
            <TestingPage />
        </main>
    );
}
