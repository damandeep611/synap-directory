import type { Metadata } from "next";
import { Inter, Roboto } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SynapDirectory",
  description: "Dev Tools library ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${roboto.variable} antialiased bg-black text-white`}>
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#0A0A0A',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              fontSize: '12px',
              borderRadius: '12px',
            },
          }}
        />
        <div className="flex h-screen w-full overflow-hidden font-sans">
          <Sidebar />
          <main className="flex-1 h-full relative ml-64 overflow-y-auto no-scrollbar">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
