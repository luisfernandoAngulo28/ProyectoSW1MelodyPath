import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "MelodyPath — Aprende Música con IA",
  description:
    "Plataforma inteligente de aprendizaje musical gamificado con Inteligencia Artificial. Aprende piano, guitarra, batería y canto.",
  keywords: "música, aprendizaje, IA, gamificación, piano, guitarra",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#16161f",
              color: "#f1f0ff",
              border: "1px solid #2a2a3a",
              borderRadius: "10px",
              fontFamily: "var(--font-inter)",
            },
            success: { iconTheme: { primary: "#10b981", secondary: "#fff" } },
            error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
          }}
        />
      </body>
    </html>
  );
}
