import { homeBenefits } from "@/data/jewellery-home-data";
import { getDictionary } from "@/i18n/get-dictionary";
import styles from "./jewellery-home.module.scss";

const icons: Record<(typeof homeBenefits)[number]["icon"], React.ReactNode> = {
    gem: <path d="M6 3h12l3 6-9 12L3 9l3-6zM3 9h18M9 3l3 18 3-18" />,
    box: <path d="M3 8l9-5 9 5v8l-9 5-9-5V8zm0 0l9 5 9-5M12 13v8" />,
    shield: <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3zm-3 9l2 2 4-4" />,
};

const HomeBenefits = async () => {
    const { home } = await getDictionary();
    const items = [
        { icon: "gem" as const, title: home.benefit1Title, text: home.benefit1Text },
        { icon: "box" as const, title: home.benefit2Title, text: home.benefit2Text },
        { icon: "shield" as const, title: home.benefit3Title, text: home.benefit3Text },
    ];

    return (
        <section className={styles.benefits}>
            {items.map((item) => (
                <div key={item.title} className={styles.benefit}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" aria-hidden="true">
                        {icons[item.icon]}
                    </svg>
                    <h3 className={styles.benefitTitle}>{item.title}</h3>
                    <p>{item.text}</p>
                </div>
            ))}
        </section>
    );
};

export default HomeBenefits;
