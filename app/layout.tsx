import { Bebas_Neue, JetBrains_Mono } from "next/font/google";
import NavBar from "./components/NavBar";
import SmoothScroll from "./components/SmoothScroll";
import TargetCursor from "./components/TargetCursor";
import { NavigationProvider } from "./components/NavigationProvider";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-body",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${jetbrainsMono.variable}`}>
      <body>
        <TargetCursor
          spinDuration={6}
          hideDefaultCursor
          parallaxOn
          hoverDuration={1.7}
          cursorColor="#ffffff"
          cursorColorOnTarget="#B497CF"
        />
        <NavigationProvider>
          <SmoothScroll>
            <NavBar />
            {children}
          </SmoothScroll>
        </NavigationProvider>
      </body>
    </html>
  );
}
