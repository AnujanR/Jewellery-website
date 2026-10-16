import JewelleryContactPage from "@/components/jewellery/JewelleryContactPage";
import { BRAND_NAME } from "@/constant/brand";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: `Contact us – ${BRAND_NAME}`,
    description:
        "Contact K.T.S Jewellery in Colombo by WhatsApp, phone or visit. Gold rates, jewellery enquiries, testing and sell-or-exchange.",
};

const page = () => {
    return (
        <main>
            <JewelleryContactPage />
        </main>
    );
};

export default page;
