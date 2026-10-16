import "./globals.css";
//import Navbar from "@/app/components/navigation/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        {/* Prevent content from being hidden under the fixed navbar */}
        <main className="pt-20">{children}</main>
      </body>
    </html>
  );
}
