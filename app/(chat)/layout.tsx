import ChatBar from "@/components/ChatBar";

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
      >
        <ChatBar/>
        {children}
      </body>
    </html>
  );
}