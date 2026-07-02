import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata = {
  title: "Price Wise",
  description: "Compare prices across Amazon, Flipkart, Myntra, Nykaa and 20+ Indian retailers. AI-powered price predictions and instant alerts.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
