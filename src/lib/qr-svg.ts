import QRCode from "qrcode";
import { headers } from "next/headers";

export async function requestOrigin() {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
    const proto = h.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
    return `${proto}://${host}`;
}

export async function qrSvg(value: string, size = 180) {
    const svg = await QRCode.toString(value, {
        type: "svg",
        margin: 1,
        width: size,
        errorCorrectionLevel: "M",
        color: { dark: "#1f1c19", light: "#ffffff" },
    });
    return svg.replace(/<\?xml[^>]*>\s*/i, "");
}
