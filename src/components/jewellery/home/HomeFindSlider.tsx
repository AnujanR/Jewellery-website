"use client";

import SmartLink from "@/components/common/SmartLink";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./jewellery-home.module.scss";

export type FindSlide = {
    label: string;
    image: string;
    href: string;
};

const INTERVAL_MS = 3000;

const HomeFindSlider = ({ items }: { items: FindSlide[] }) => {
    const trackRef = useRef<HTMLDivElement>(null);
    const [page, setPage] = useState(0);
    const [pages, setPages] = useState(1);
    const [paused, setPaused] = useState(false);
    const pageRef = useRef(0);
    const pagesRef = useRef(1);

    pageRef.current = page;
    pagesRef.current = pages;

    const measure = useCallback(() => {
        const track = trackRef.current;
        if (!track) return;
        // Mobile uses a wrapping grid — no slider pages.
        if (window.matchMedia("(max-width: 767px)").matches) {
            setPages(1);
            setPage(0);
            return;
        }
        const max = track.scrollWidth - track.clientWidth;
        const count = max <= 8 ? 1 : Math.min(items.length, Math.ceil(track.scrollWidth / track.clientWidth));
        setPages(Math.max(1, count));
        const next = max <= 0 ? 0 : Math.round((track.scrollLeft / max) * (count - 1));
        setPage(Math.min(count - 1, Math.max(0, next)));
    }, [items.length]);

    const goTo = useCallback((index: number) => {
        const track = trackRef.current;
        const total = pagesRef.current;
        if (!track || total <= 1) return;
        const max = track.scrollWidth - track.clientWidth;
        const left = total === 1 ? 0 : (index / (total - 1)) * max;
        track.scrollTo({ left, behavior: "smooth" });
    }, []);

    useEffect(() => {
        measure();
        const track = trackRef.current;
        if (!track) return;
        const onScroll = () => measure();
        track.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", measure);
        return () => {
            track.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", measure);
        };
    }, [measure]);

    useEffect(() => {
        if (paused || pages <= 1) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        if (window.matchMedia("(max-width: 767px)").matches) return;

        const timer = window.setInterval(() => {
            const total = pagesRef.current;
            if (total <= 1) return;
            goTo((pageRef.current + 1) % total);
        }, INTERVAL_MS);

        return () => window.clearInterval(timer);
    }, [paused, pages, goTo]);

    return (
        <div
            className={styles.findSlider}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                    setPaused(false);
                }
            }}
        >
            <div ref={trackRef} className={styles.findTrack} tabIndex={0} aria-label="Shop and services">
                {items.map((item) => (
                    <SmartLink key={item.href + item.label} href={item.href} className={styles.findCard}>
                        <span className={styles.findMedia}>
                            <Image src={item.image} alt="" fill sizes="(max-width: 767px) 50vw, 248px" />
                        </span>
                        <span className={styles.findLabel}>{item.label}</span>
                    </SmartLink>
                ))}
            </div>

            {pages > 1 && (
                <div className={styles.findDots} role="tablist" aria-label="Slide pages">
                    {Array.from({ length: pages }, (_, index) => (
                        <button
                            key={index}
                            type="button"
                            role="tab"
                            aria-selected={page === index}
                            aria-label={`Page ${index + 1}`}
                            className={`${styles.findDot} ${page === index ? styles.findDotActive : ""}`}
                            onClick={() => goTo(index)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default HomeFindSlider;
