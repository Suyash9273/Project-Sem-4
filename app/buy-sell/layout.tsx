import BuySellNavBar from "@/components/BuySellNavBar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
      >
        <BuySellNavBar/>
        {children}
      </body>
    </html>
  );
}