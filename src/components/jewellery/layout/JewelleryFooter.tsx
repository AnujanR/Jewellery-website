"use client";
import { paymentMethods, socialLinks } from "@/data/jewellery-nav-data";
import { ArrowRightLineIcon, SocialIcon } from "./JewelleryIcons";
import SmartLink from "@/components/common/SmartLink";
import TextLogo from "@/components/common/TextLogo";
import { getCurrentYear } from "@/utils/getCurrentYear";
import { useLocale } from "@/i18n/LocaleProvider";
import { BRAND_NAME } from "@/constant/brand";
import { toast } from "react-toastify";
import { FormEvent, useState } from "react";
import styles from "./jewellery-layout.module.scss";

const JewelleryFooter = () => {
    const [email, setEmail] = useState("");
    const { dict } = useLocale();
    const copy = dict.footer;

    const sections = [
        {
            title: copy.shop,
            links: [
                { label: copy.rings, href: "/shop" },
                { label: copy.necklaces, href: "/shop" },
                { label: copy.bracelets, href: "/shop" },
                { label: copy.earrings, href: "/shop" },
            ],
        },
        {
            title: copy.collections,
            links: [
                { label: copy.classic, href: "/shop" },
                { label: copy.gems, href: "/shop" },
                { label: copy.pearls, href: "/shop" },
                { label: copy.sculptural, href: "/shop" },
            ],
        },
        {
            title: copy.about,
            links: [
                { label: copy.story, href: "/about-us" },
                { label: copy.sustainability, href: "#" },
                { label: copy.care, href: "#" },
                { label: copy.journal, href: "/blog" },
            ],
        },
        {
            title: copy.help,
            links: [
                { label: dict.nav.services, href: "/services" },
                { label: copy.rates, href: "/gold-rates" },
                { label: copy.sell, href: "/sell-gold" },
                { label: copy.testing, href: "/testing" },
                { label: copy.verify, href: "/verify" },
                { label: copy.contact, href: "/contact-us" },
            ],
        },
    ];

    const handleSubscribe = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        toast.success(copy.subscribeThanks);
        setEmail("");
    };

    return (
        <footer className={styles.footer}>
            <div className={styles.footerTop}>
                <div className={styles.footerBrand}>
                    <TextLogo size={40} />
                    <p>{copy.blurb}</p>
                    <div className={styles.socials}>
                        {socialLinks.map((s) => (
                            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                                <SocialIcon name={s.icon} />
                            </a>
                        ))}
                    </div>
                </div>

                <div className={styles.footerLinks}>
                    {sections.map((section) => (
                        <div key={section.title}>
                            <h4 className={styles.footerHeading}>{section.title}</h4>
                            <ul>
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        <SmartLink href={link.href}>{link.label}</SmartLink>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className={styles.newsletter}>
                    <h4 className={styles.newsletterTitle}>
                        {copy.newsletterLead} <em>{copy.newsletterEm}</em>
                    </h4>
                    <p>{copy.newsletterText}</p>
                    <form className={styles.newsletterForm} onSubmit={handleSubscribe}>
                        <input
                            type="email"
                            required
                            placeholder={copy.emailPlaceholder}
                            aria-label={copy.emailPlaceholder}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <button type="submit" aria-label={copy.subscribe}>
                            <ArrowRightLineIcon />
                        </button>
                    </form>
                </div>
            </div>

            <div className={styles.footerBottom}>
                <div className={styles.payments}>
                    {paymentMethods.map((method) => (
                        <span key={method}>{method}</span>
                    ))}
                </div>
                <div className={styles.footerLegal}>
                    <span>© {getCurrentYear()} {BRAND_NAME}</span>
                    <SmartLink href="#">{copy.terms}</SmartLink>
                    <SmartLink href="#">{copy.privacyShort}</SmartLink>
                    <SmartLink href="#">{copy.cookies}</SmartLink>
                </div>
            </div>
        </footer>
    );
};

export default JewelleryFooter;
