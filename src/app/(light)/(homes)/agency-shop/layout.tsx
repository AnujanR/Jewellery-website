"use client";
import CursorAndBackgroundProvider from "@/provider/CustomCursorProvider";
import ScrollSmoothProvider from "@/provider/ScrollSmoothProvider";
import AnimationWrapper from "@/components/shared/animation/AnimationWrapper";
import HeaderSearch from "@/layouts/headers/subComponents/HeaderSearch";
import SubscribePopup from "@/components/popup/ShopSubscribePopup";
import BackToTop from "@/components/shared/BackToTop/BackToTop";
import BootstrapLoader from "@/layouts/BootstrapLoader";
import JewelleryHeader from "@/components/jewellery/layout/JewelleryHeader";
import JewelleryFooter from "@/components/jewellery/layout/JewelleryFooter";
import AppProvider from "@/provider/AppProvider";
import { useState, useEffect } from "react";

export default function AgencyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        // Only show popup if not closed before
        const hasClosed = localStorage.getItem("subscribePopupClosed");
        if (!hasClosed) {
            const timer = setTimeout(() => {
                setShowPopup(true);
            }, 50); // slight delay
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClosePopup = () => {
        setShowPopup(false);
        localStorage.setItem("subscribePopupClosed", "true"); // remember user closed popup
    };

    return (
        <ScrollSmoothProvider>
            <CursorAndBackgroundProvider>
                <AnimationWrapper>
                    <AppProvider>
                        <BootstrapLoader>
                            <div id="magic-cursor" className="cursor-black-bg">
                                <div id="ball"></div>
                            </div>
                            <BackToTop />
                            <HeaderSearch />
                            <JewelleryHeader />
                            {/* Auto-open Subscribe Popup */}
                            <SubscribePopup isOpen={showPopup} onClose={handleClosePopup} />
                            <div id="smooth-wrapper">
                                <div id="smooth-content">
                                    {children}
                                    <JewelleryFooter />
                                </div>
                            </div>
                        </BootstrapLoader>
                    </AppProvider>
                </AnimationWrapper>
            </CursorAndBackgroundProvider>
        </ScrollSmoothProvider>
    );
}
