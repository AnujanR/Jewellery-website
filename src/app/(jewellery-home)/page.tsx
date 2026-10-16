import HomeLovedDesigns from "@/components/jewellery/home/HomeLovedDesigns";
import HomeCollections from "@/components/jewellery/home/HomeCollections";
import GoldRatesBoard from "@/components/jewellery/trust/GoldRatesBoard";
import HomeBenefits from "@/components/jewellery/home/HomeBenefits";
import HomeStories from "@/components/jewellery/home/HomeStories";
import HomeHeritage from "@/components/jewellery/home/HomeHeritage";
import HomePurpose from "@/components/jewellery/home/HomePurpose";
import HomeFind from "@/components/jewellery/home/HomeFind";
import HomeHero from "@/components/jewellery/home/HomeHero";
import { getDictionary } from "@/i18n/get-dictionary";
import { BRAND_NAME } from "@/constant/brand";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
    const dict = await getDictionary();
    return { title: `${BRAND_NAME} – ${dict.home.heroTitle}` };
}

const page = () => {
    return (
        <main>
            <HomeHero />
            <HomeFind />
            <GoldRatesBoard variant="home" />
            <HomeHeritage />
            <HomeCollections />
            <HomeLovedDesigns />
            <HomeStories />
            <HomeBenefits />
            <HomePurpose />
        </main>
    );
};

export default page;
