import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WhatsApp AI Auto-Reply Platform | Automated Customer Support',
  description: 'Connect your WhatsApp Business number and automate AI customer replies powered by DeepSeek API & Baileys.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
