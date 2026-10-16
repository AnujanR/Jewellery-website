"use client";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { usePathname } from "next/navigation";
import { useGSAP } from "@gsap/react";
import { useEffect, useState } from "react";
import { gsap } from "gsap";

const scrollToTop = () => {
    const smoother = ScrollSmoother.get();
    if (smoother) {
        smoother.scrollTo(0, false);
    }
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
};

export default function useScrollSmooth() {
    const [isScrollSmooth] = useState<boolean>(true);
    const pathname = usePathname();

    useGSAP(() => {
        gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

        const smoothWrapper = document.getElementById("smooth-wrapper");
        const smoothContent = document.getElementById("smooth-content");

        if (smoothWrapper && smoothContent && isScrollSmooth) {
            gsap.config({
                nullTargetWarn: false,
            });

            ScrollSmoother.get()?.kill();

            ScrollSmoother.create({
                wrapper: smoothWrapper,
                content: smoothContent,
                smooth: 2,
                effects: true,
                smoothTouch: 0.1,
                normalizeScroll: false,
                ignoreMobileResize: true,
            });

            scrollToTop();

            ScrollTrigger.create({
                trigger: ".shape",
                pin: true,
                start: "center center",
                end: "+=300",
                markers: false,
            });
        }
    }, [isScrollSmooth]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            window.history.scrollRestoration = "manual";
        }

        scrollToTop();
        const frame = requestAnimationFrame(() => {
            scrollToTop();
            ScrollTrigger.refresh();
        });

        return () => cancelAnimationFrame(frame);
    }, [pathname]);
}
