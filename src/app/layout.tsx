import { Metadata } from "next";
import { Inter } from "next/font/google";
import "./app.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Daily Cash",
  description: "Your daily cash management application",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fira+Code&family=Inter:opsz,wght@14..32,100..900&family=Poppins:wght@300;400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.className} flex min-h-screen flex-col bg-[#FAFAFB] text-sm text-[#56565C]`}
      >
        {/* <Header /> */}
        <main className="flex-grow ">{children}</main>
        {/* <Footer /> */}
      </body>
    </html>
  );
}
