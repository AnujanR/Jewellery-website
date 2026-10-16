"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./jewellery-home.module.scss";

const INTERVAL_MS = 6000;

const HomeHeroSlider = ({ images, alt }: { images: string[]; alt: string }) => {
    const [active, setActive] = useState(0);
    const [previous, setPrevious] = useState<number | null>(null);
    const [staged, setStaged] = useState<number | null>(null);
    const [paused, setPaused] = useState(false);

    // The incoming slide is parked below the frame for one paint so it always enters from the bottom.
    const goTo = (next: number) => {
        if (next === active || staged !== null) return;
        setStaged(next);
        requestAnimationFrame(() =>
            requestAnimationFrame(() => {
                setPrevious(active);
                setActive(next);
                setStaged(null);
            }),
        );
    };

    useEffect(() => {
        if (paused || images.length < 2) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const timer = window.setTimeout(() => goTo((active + 1) % images.length), INTERVAL_MS);
        return () => window.clearTimeout(timer);
    });

    const slideClass = (index: number) => {
        if (index === staged) return styles.heroSlideStaged;
        if (index === active) return styles.heroSlideActive;
        if (index === previous) return styles.heroSlidePrev;
        return styles.heroSlideStaged;
    };

    return (
        <div className={styles.heroSlides} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            {images.map((src, index) => (
                <div key={src} className={`${styles.heroSlide} ${slideClass(index)}`} aria-hidden={index !== active}>
                    <Image src={src} alt={alt} fill priority={index === 0} loading={index === 0 ? undefined : "eager"} sizes="100vw" />
                </div>
            ))}
            {images.length > 1 && (
                <div className={styles.heroDots}>
                    {images.map((src, index) => (
                        <button
                            key={src}
                            type="button"
                            aria-label={`Show image ${index + 1} of ${images.length}`}
                            aria-current={index === active ? "true" : undefined}
                            className={index === active ? styles.heroDotActive : undefined}
                            onClick={() => goTo(index)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default HomeHeroSlider;
