"use client";
import SmartLink from "@/components/common/SmartLink";
import { BRAND_MARK, BRAND_SUFFIX } from "@/constant/brand";
import { WHATSAPP_DISPLAY, WHATSAPP_E164, whatsappHref } from "@/constant/contact";
import { jewelleryServices, serviceWhatsAppMessage } from "@/data/jewellery-services-data";
import styles from "./jewellery-shop.module.scss";

const JewelleryServicesPage = () => {
    return (
        <div className={styles.services}>
            <header className={styles.servicesHero}>
                <div className={styles.servicesHeroCopy}>
                    <p className={styles.servicesBrand}>
                        {BRAND_MARK} <em>{BRAND_SUFFIX}</em>
                    </p>
                    <h1 className={styles.servicesTitle}>
                        What we do
                        <em> in Colombo</em>
                    </h1>
                    <p className={styles.servicesLead}>
                        Seven in-shop services — from forex at the counter to thali-making for
                        Hindu weddings. Enquire on WhatsApp; we confirm the details before you visit.
                    </p>
                </div>
                <nav className={styles.servicesIndex} aria-label="Services">
                    <ol>
                        {jewelleryServices.map((service, index) => (
                            <li key={service.id}>
                                <a href={`#${service.id}`}>
                                    <span>{String(index + 1).padStart(2, "0")}</span>
                                    {service.title}
                                </a>
                            </li>
                        ))}
                    </ol>
                </nav>
            </header>

            <div className={styles.servicesList}>
                {jewelleryServices.map((service, index) => {
                    const dark = index % 2 === 1;
                    return (
                        <article
                            key={service.id}
                            id={service.id}
                            className={`${styles.serviceRow} ${dark ? styles.serviceRowDark : ""}`}
                        >
                            <div className={styles.serviceRowInner}>
                                <p className={styles.serviceIndex}>{String(index + 1).padStart(2, "0")}</p>
                                <div className={styles.serviceHead}>
                                    <h2>
                                        {service.title}
                                        {service.titleEm ? <em>{service.titleEm}</em> : null}
                                    </h2>
                                </div>
                                <div className={styles.serviceBody}>
                                    <p>{service.summary}</p>
                                    <ul>
                                        {service.points.map((point) => (
                                            <li key={point}>{point}</li>
                                        ))}
                                    </ul>
                                    <div className={styles.serviceLinks}>
                                        {service.href ? (
                                            <SmartLink href={service.href}>{service.cta ?? "Learn more"}</SmartLink>
                                        ) : (
                                            <a
                                                href={whatsappHref(serviceWhatsAppMessage(service))}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Enquire on WhatsApp
                                            </a>
                                        )}
                                        <a href={`tel:+${WHATSAPP_E164}`}>Call {WHATSAPP_DISPLAY}</a>
                                    </div>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>

            <aside className={styles.servicesClose}>
                <h2>
                    Visit the shop — <em>or message first</em>
                </h2>
                <p>
                    Prefer a call or WhatsApp before you come in? We&apos;ll confirm timing and what to bring.
                </p>
                <div className={styles.serviceLinks}>
                    <SmartLink href="/contact-us">Contact us</SmartLink>
                    <a href={`tel:+${WHATSAPP_E164}`}>Call {WHATSAPP_DISPLAY}</a>
                    <SmartLink href="/enquire">How enquiries work</SmartLink>
                </div>
            </aside>
        </div>
    );
};

export default JewelleryServicesPage;
