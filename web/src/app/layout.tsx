import type { Metadata } from "next";
import { Instrument_Serif, Manrope } from "next/font/google";
import "@/styles/globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-editorial"
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans"
});

export const metadata: Metadata = {
  title: {
    default: "FarmNomad",
    template: "%s | FarmNomad"
  },
  description: "UK AgriTech marketplace for local produce, surplus redistribution, and coordinated fulfilment."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB" className={`${instrumentSerif.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
