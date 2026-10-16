import JewelleryServicesPage from "@/components/jewellery/JewelleryServicesPage";
import { BRAND_NAME } from "@/constant/brand";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: `Services – ${BRAND_NAME}`,
    description:
        "Forex, engraving, jewellery repair, corporate gifts, custom design, handwriting jewellery, and gold melting & thali-making at K.T.S Jewellery, Colombo.",
};

const page = () => {
    return (
        <main>
            <JewelleryServicesPage />
        </main>
    );
};

export default page;
