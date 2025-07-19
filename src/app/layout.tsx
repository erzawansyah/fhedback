import type { Metadata } from "next";
import { Space_Grotesk, Sora } from "next/font/google";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import "./globals.css";
import '@rainbow-me/rainbowkit/styles.css';

import AppHeader from "@/components/app-header";
import AppSidebar from "@/components/app-sidebar";
import Web3Provider from "@/lib/wagmi/providers";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Fhedback",
  description: "Confidential Surveys on Zama FHEVM",
};



const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${sora.variable} antialiased`}
      >
        <Web3Provider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <AppHeader />
              <main className="flex-1 px-4">
                {children}
              </main>
              <footer className="px-4 text-center text-sm text-gray-500">
                &copy; {new Date().getFullYear()} Fhedback. All rights reserved.
              </footer>
            </SidebarInset>
          </SidebarProvider>
        </Web3Provider>
      </body>
    </html>
  );
}

export default RootLayout;
