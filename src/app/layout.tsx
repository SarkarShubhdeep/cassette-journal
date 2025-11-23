import type { Metadata } from "next";
import { Auth0Provider } from "@auth0/nextjs-auth0/client";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Geist } from "next/font/google";
import { Geist_Mono } from "next/font/google";

const font = Geist({
    subsets: ["latin"],
    variable: "--font-geist",
});

const monoFont = Geist_Mono({
    subsets: ["latin"],
    variable: "--font-geist-mono",
});

export const metadata: Metadata = {
    title: "Cassette Journal",
    description: "",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={font.className}>
                <Auth0Provider>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="dark"
                        enableSystem
                        storageKey="cassette-theme"
                    >
                        {children}
                    </ThemeProvider>
                </Auth0Provider>
            </body>
        </html>
    );
}
