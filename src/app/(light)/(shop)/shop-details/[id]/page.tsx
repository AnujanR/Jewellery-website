import JewelleryProductDetails from "@/components/jewellery/JewelleryProductDetails";
import { getJewelleryProduct, jewelleryProducts } from "@/data/jewellery-data";
import { PageParamsProps } from "@/types/custom-dt";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export function generateStaticParams() {
    return jewelleryProducts.map((product) => ({ id: String(product.id) }));
}

export async function generateMetadata(props: PageParamsProps): Promise<Metadata> {
    const { id } = await props.params;
    const product = getJewelleryProduct(id);
    return { title: product ? `${product.title} - ${product.material}` : "Product not found" };
}

export default async function ShopDetails(props: PageParamsProps) {
    const { id } = await props.params;
    const product = getJewelleryProduct(id);
    if (!product) notFound();

    return (
        <main>
            <JewelleryProductDetails key={product.id} product={product} />
        </main>
    );
}
