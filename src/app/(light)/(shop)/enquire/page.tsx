import JewelleryEnquiryArea from "@/components/jewellery/JewelleryEnquiryArea";
import { BRAND_NAME } from "@/constant/brand";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: `Enquire – ${BRAND_NAME}`,
    description:
        "Enquire about jewellery at today’s indicative price. We confirm on WhatsApp — pay in store or by bank transfer, then collect in Colombo.",
};

const page = () => {
    return (
        <main>
            <JewelleryEnquiryArea />
        </main>
    );
};

export default page;
