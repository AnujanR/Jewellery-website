import JewelleryProductDetails from "@/components/jewellery/JewelleryProductDetails";
import { jewelleryProducts } from "@/data/jewellery-data";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: `${jewelleryProducts[0].title} - ${jewelleryProducts[0].material}`,
};

const page = () => {
    return (
        <main>
            <JewelleryProductDetails product={jewelleryProducts[0]} />
        </main>
    );
};

export default page;
