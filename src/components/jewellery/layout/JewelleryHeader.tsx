"use client";
import { BagLineIcon, CloseLineIcon, HeartLineIcon, MenuLineIcon, SearchLineIcon, SocialIcon, UserLineIcon } from "./JewelleryIcons";
import { mainNav, socialLinks } from "@/data/jewellery-nav-data";
import LanguageSwitch from "@/components/jewellery/trust/LanguageSwitch";
import WhatsAppButton from "@/components/jewellery/trust/WhatsAppButton";
import { formatLkr, goldRates } from "@/data/gold-rates";
import { useLocale } from "@/i18n/LocaleProvider";
import SmartLink from "@/components/common/SmartLink";
import TextLogo from "@/components/common/TextLogo";
import useStickyHeader from "@/hooks/useStickyHeader";
import useGlobalContext from "@/hooks/useContext";
import useJewelleryEnquiry, { setPendingEnquiry } from "@/hooks/useJewelleryEnquiry";
import useJewelleryWishlist from "@/hooks/useJewelleryWishlist";
import { usePathname } from "next/navigation";
import JewelleryEnquiry from "./JewelleryEnquiry";
import { useState } from "react";
import styles from "./jewellery-layout.module.scss";

const JewelleryHeader = () => {
    const { toggleSearch, setOpenMiniCart } = useGlobalContext();
    const { count } = useJewelleryEnquiry();
    const { count: wishCount } = useJewelleryWishlist();
    const isScrolled = useStickyHeader(40);
    const [menuOpen, setMenuOpen] = useState(false);
    const pathname = usePathname();
    const { locale, dict } = useLocale();
    const isActive = (href: string) => (href === "/verify" ? pathname.startsWith("/verify") : pathname === href);

    const openEnquiries = () => {
        setPendingEnquiry(null);
        setOpenMiniCart(true);
    };

    return (
        <>
            <header className={`${styles.header} ${isScrolled ? styles.headerScrolled : ""}`}>
                <SmartLink href="/gold-rates" className={styles.announcement}>
                    {dict.announcement(formatLkr(goldRates.k22.sellPerGram, locale), formatLkr(goldRates.k22.buyPerGram, locale))}
                </SmartLink>
                <div className={styles.headerMain}>
                    <div className={styles.headerLeft}>
                        <button
                            type="button"
                            className={`${styles.iconBtn} ${styles.menuToggle}`}
                            aria-label={dict.nav.openMenu}
                            onClick={() => setMenuOpen(true)}
                        >
                            <MenuLineIcon />
                        </button>
                        <nav className={styles.nav} aria-label="Main">
                            {mainNav.map((link) => (
                                <SmartLink
                                    key={link.key}
                                    href={link.href}
                                    className={`${styles.navLink} ${isActive(link.href) ? styles.navLinkActive : ""}`}
                                >
                                    {dict.nav[link.key]}
                                </SmartLink>
                            ))}
                        </nav>
                    </div>

                    <SmartLink href="/" className={styles.headerLogo}>
                        <TextLogo size={30} />
                    </SmartLink>

                    <div className={styles.headerRight}>
                        <LanguageSwitch />
                        <button type="button" className={styles.iconBtn} aria-label={dict.nav.search} onClick={toggleSearch}>
                            <SearchLineIcon />
                        </button>
                        <SmartLink href="/login" className={`${styles.iconBtn} ${styles.hideSm}`}>
                            <UserLineIcon />
                            <span className={styles.srOnly}>{dict.nav.account}</span>
                        </SmartLink>
                        <SmartLink
                            href="/wishlist"
                            className={`${styles.iconBtn} ${styles.hideSm}`}
                            aria-label={wishCount > 0 ? `${dict.nav.wishlist} (${wishCount})` : dict.nav.wishlist}
                        >
                            <HeartLineIcon />
                            <span className={styles.srOnly}>{dict.nav.wishlist}</span>
                            {wishCount > 0 && <span className={styles.badge}>{wishCount}</span>}
                        </SmartLink>
                        <button
                            type="button"
                            className={styles.iconBtn}
                            aria-label={count > 0 ? dict.nav.bagCount(count) : dict.nav.bag}
                            onClick={openEnquiries}
                        >
                            <BagLineIcon />
                            {count > 0 && <span className={styles.badge}>{count}</span>}
                        </button>
                    </div>
                </div>
            </header>

            <div
                className={`${styles.drawerOverlay} ${menuOpen ? styles.drawerOverlayOpen : ""}`}
                onClick={() => setMenuOpen(false)}
            />
            <aside className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ""}`} inert={!menuOpen}>
                <div className={styles.drawerTop}>
                    <TextLogo size={26} />
                    <button type="button" className={styles.iconBtn} aria-label={dict.nav.closeMenu} onClick={() => setMenuOpen(false)}>
                        <CloseLineIcon />
                    </button>
                </div>
                <div className={styles.drawerLang}>
                    <LanguageSwitch />
                </div>
                <nav className={styles.drawerNav} aria-label="Mobile">
                    {mainNav.map((link) => (
                        <SmartLink key={link.key} href={link.href} onClick={() => setMenuOpen(false)}>
                            {dict.nav[link.key]}
                        </SmartLink>
                    ))}
                </nav>
                <div className={styles.drawerFooter}>
                    <SmartLink href="/login">{dict.nav.account}</SmartLink>
                    <SmartLink href="/wishlist">{dict.nav.wishlist}</SmartLink>
                    <SmartLink href="/about-us">{dict.nav.story}</SmartLink>
                    <div className={styles.socials}>
                        {socialLinks.map((s) => (
                            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                                <SocialIcon name={s.icon} />
                            </a>
                        ))}
                    </div>
                </div>
            </aside>

            <JewelleryEnquiry />
            <WhatsAppButton />
        </>
    );
};

export default JewelleryHeader;
