type IconProps = { size?: number };

const base = (size: number) => ({
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
});

export const SearchLineIcon = ({ size = 20 }: IconProps) => (
    <svg {...base(size)}><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.2-4.2" /></svg>
);

export const UserLineIcon = ({ size = 20 }: IconProps) => (
    <svg {...base(size)}><circle cx="12" cy="8" r="4" /><path d="M4.5 20.5c1.2-3.8 4-5.5 7.5-5.5s6.3 1.7 7.5 5.5" /></svg>
);

export const HeartLineIcon = ({ size = 20 }: IconProps) => (
    <svg {...base(size)}><path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z" /></svg>
);

export const BagLineIcon = ({ size = 20 }: IconProps) => (
    <svg {...base(size)}><path d="M5 8h14l-1 12.5H6L5 8z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></svg>
);

export const MenuLineIcon = ({ size = 22 }: IconProps) => (
    <svg {...base(size)}><path d="M3 7h18M3 12h18M3 17h12" /></svg>
);

export const CloseLineIcon = ({ size = 22 }: IconProps) => (
    <svg {...base(size)}><path d="M5 5l14 14M19 5L5 19" /></svg>
);

export const ArrowRightLineIcon = ({ size = 18 }: IconProps) => (
    <svg {...base(size)}><path d="M4 12h16M14 6l6 6-6 6" /></svg>
);

export const SocialIcon = ({ name, size = 18 }: IconProps & { name: "instagram" | "facebook" | "pinterest" | "tiktok" }) => {
    switch (name) {
        case "instagram":
            return <svg {...base(size)}><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" /></svg>;
        case "facebook":
            return <svg {...base(size)}><path d="M14 8.5h2.5V5H14c-2.2 0-3.5 1.5-3.5 3.7V11H8v3.4h2.5V21H14v-6.6h2.4l.6-3.4h-3V9.2c0-.4.3-.7.7-.7z" /></svg>;
        case "pinterest":
            return <svg {...base(size)}><circle cx="12" cy="12" r="8.5" /><path d="M10.5 20l1.8-7.5M10.4 13.6c.5 1 1.4 1.4 2.4 1.4 2.2 0 3.6-2 3.6-4.3 0-2.5-2-4.2-4.5-4.2-2.8 0-4.6 2-4.6 4.2 0 1 .4 1.9 1 2.3" /></svg>;
        case "tiktok":
            return <svg {...base(size)}><path d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5M14 4c.4 2.4 2 4 4.5 4.2" /></svg>;
    }
};
