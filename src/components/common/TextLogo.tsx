import { BRAND_MARK, BRAND_NAME, BRAND_SUFFIX } from "@/constant/brand";

type TextLogoProps = {
    className?: string;
    variant?: "dark" | "light";
    size?: number;
};

const TextLogo = ({ className = "", variant = "dark", size = 30 }: TextLogoProps) => {
    return (
        <span
            className={`brand-text-logo brand-text-logo--${variant} ${className}`}
            style={{ fontSize: size }}
            aria-label={BRAND_NAME}
        >
            <span className="brand-text-logo__mark">{BRAND_MARK}</span>
            <span className="brand-text-logo__suffix">{BRAND_SUFFIX}</span>
        </span>
    );
};

export default TextLogo;
