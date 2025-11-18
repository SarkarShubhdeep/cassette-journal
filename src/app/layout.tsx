import type { Metadata } from "next";
import { Auth0Provider } from "@auth0/nextjs-auth0/client";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

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
            <body>
                <Auth0Provider>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="dark"
                        // enableSystem
                    >
                        {children}
                    </ThemeProvider>
                </Auth0Provider>
            </body>
        </html>
    );
}
