import JewelleryShopIntro from "@/components/jewellery/JewelleryShopIntro";
import JewelleryShopHero from "@/components/jewellery/JewelleryShopHero";
import JewelleryShopArea from "@/components/jewellery/JewelleryShopArea";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Shop Earrings - Handcrafted Jewellery",
};

const page = () => {
    return (
        <main>
            <JewelleryShopHero />
            <JewelleryShopArea />
            <JewelleryShopIntro />
        </main>
    );
};

export default page;
