import { ToastContainer } from "react-toastify";
import { Cormorant_Garamond, Inter, Jost, Noto_Sans_Sinhala, Noto_Sans_Tamil } from "next/font/google";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { getLocale } from "@/i18n/get-dictionary";
import { BRAND_NAME } from "@/constant/brand";
import type { Metadata } from "next";
import "swiper/css/bundle";
import "./globals.scss";

// Inter font
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: false
});

// Jost font
const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  display: "swap",
  preload: false
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
  preload: false
});

const sinhala = Noto_Sans_Sinhala({
  subsets: ["sinhala"],
  weight: ["400", "500", "600"],
  variable: "--font-sinhala",
  display: "swap",
  preload: false,
});

const tamil = Noto_Sans_Tamil({
  subsets: ["tamil"],
  weight: ["400", "500", "600"],
  variable: "--font-tamil",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: BRAND_NAME,
  description: `${BRAND_NAME} – handcrafted jewellery in recycled gold and silver.`,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <html lang={locale} data-locale={locale}>
      <body className={`${inter.variable} ${jost.variable} ${cormorant.variable} ${sinhala.variable} ${tamil.variable}`}>
        <LocaleProvider initialLocale={locale}>{children}</LocaleProvider>
        <ToastContainer />
      </body>
    </html>
  );
}
