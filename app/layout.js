import "../styles/globals.css";
import AuthProvider from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: {
    default: "Codeion",
    template: "%s | Codeion",
  },
  description:
    "Collaborative coding platform to code, share, and grow together.",
  keywords: [
    "Codeion",
    "collaborative coding",
    "real-time editor",
    "online IDE",
    "pair programming",
  ],
  authors: [
    { name: "Vineet Kumar", url: "https://portfolio-navy-eight-58.vercel.app" },
  ],
  icons: {
    icon: "/favicon.ico",
  },
  metadataBase: new URL("https://yourdomain.com"),
  openGraph: {
    title: "Codeion",
    description: "Collaborative coding made fun and fast.",
    url: "https://yourdomain.com",
    siteName: "Codeion",
    type: "website",
    locale: "en_US",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <AuthProvider>
          <Navbar />
          <div className="pt-16">
            <main>{children}</main>
          </div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
