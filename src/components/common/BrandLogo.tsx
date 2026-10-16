import SmartLink from "@/components/common/SmartLink";
import TextLogo from "@/components/common/TextLogo";

type BrandLogoProps = {
    logo1Width?: number;
    logo2Width?: number;
    logo1Height?: number;
    logo2Height?: number;
};

const BrandLogo = ({
    logo1Height = 29,
    logo2Height = 29,
}: BrandLogoProps) => {
    return (
        <SmartLink href="/">
            <TextLogo className="logo-1" variant="dark" size={logo1Height} />
            <TextLogo className="logo-2" variant="light" size={logo2Height} />
        </SmartLink>
    );
};

export default BrandLogo;
