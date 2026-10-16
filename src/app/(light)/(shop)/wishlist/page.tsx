import JewelleryWishlistArea from "@/components/jewellery/JewelleryWishlistArea";
import { BRAND_NAME } from "@/constant/brand";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: `Wishlist – ${BRAND_NAME}`,
    description: "Saved jewellery pieces from K.T.S Jewellery.",
};

const page = () => {
    return (
        <main>
            <JewelleryWishlistArea />
        </main>
    );
};

export default page;
