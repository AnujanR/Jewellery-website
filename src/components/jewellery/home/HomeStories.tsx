import SmartLink from "@/components/common/SmartLink";
import { homeFeatureStories, homeStories } from "@/data/jewellery-home-data";
import { getDictionary } from "@/i18n/get-dictionary";
import Image from "next/image";
import styles from "./jewellery-home.module.scss";

const StoryCard = ({ href, image, title, text, wide }: { href: string; image: string; title: string; text?: string; wide?: boolean }) => (
    <SmartLink href={href} className={styles.story}>
        <span className={`${styles.storyMedia} ${wide ? styles.storyMediaWide : ""}`}>
            <Image src={image} alt={title} fill sizes="(max-width: 767px) 100vw, 50vw" />
        </span>
        <span className={styles.storyTitle}>{title}</span>
        {text && <span className={styles.storyText}>{text}</span>}
    </SmartLink>
);

const HomeStories = async () => {
    const { home } = await getDictionary();
    const stories = [
        { href: homeStories[0].href, image: homeStories[0].image, title: home.story1Title, text: home.story1Text },
        { href: homeStories[1].href, image: homeStories[1].image, title: home.story2Title, text: home.story2Text },
        { href: homeStories[2].href, image: homeStories[2].image, title: home.story3Title, text: home.story3Text },
    ];
    const features = [
        { href: homeFeatureStories[0].href, image: homeFeatureStories[0].image, title: home.feature1Title, text: home.feature1Text, wide: true },
        { href: homeFeatureStories[1].href, image: homeFeatureStories[1].image, title: home.feature2Title, text: home.feature2Text, wide: true },
    ];

    return (
        <section className={styles.section}>
            <div className={styles.storyGrid3}>
                {stories.map((story) => (
                    <StoryCard key={story.title} {...story} />
                ))}
            </div>
            <div className={styles.storyGrid2}>
                {features.map((story) => (
                    <StoryCard key={story.title} {...story} />
                ))}
            </div>
        </section>
    );
};

export default HomeStories;
