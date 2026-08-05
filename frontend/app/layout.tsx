import type { Metadata, Viewport } from 'next';
import LiveSupportWidget from '@/components/LiveSupportWidget';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://whatsapp-automation.vercel.app';

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Free WhatsApp Business AI Automation Platform | Auto Reply Bot',
    template: '%s | WpAutoAI WhatsApp Automation',
  },
  description:
    '100% Free WhatsApp Business AI Auto Reply Automation Platform. Connect your WhatsApp number via QR code scan and automate DeepSeek AI customer support replies for products, prices, and FAQs.',
  keywords: [
    'WhatsApp free automation',
    'free WhatsApp auto reply bot',
    'WhatsApp AI customer support',
    'WhatsApp Business API free',
    'DeepSeek WhatsApp bot',
    'WhatsApp automation Bangladesh',
    'Baileys WhatsApp multi session',
    'free WhatsApp chatbot SaaS',
    'automated WhatsApp customer service',
    'WhatsApp marketing & auto reply',
  ],
  authors: [{ name: 'WpAutoAI Team' }],
  creator: 'WpAutoAI',
  publisher: 'WpAutoAI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: 'Free WhatsApp Business AI Automation Platform | WpAutoAI',
    description:
      'Automate your WhatsApp Business customer service 24/7 with DeepSeek AI & Baileys socket. Free QR scan setup—no paid Meta API required.',
    url: siteUrl,
    siteName: 'WpAutoAI',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free WhatsApp Business AI Automation Platform',
    description: 'Automate WhatsApp customer support 24/7 with DeepSeek AI. Free QR scan setup.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'googleac6a232a81a9a8f3',
  },
};

import { Suspense } from 'react';
import PageProgressBar from '@/components/PageProgressBar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // JSON-LD Schema for Google Search Rich Snippets
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'WpAutoAI - WhatsApp Business AI Automation',
    operatingSystem: 'All',
    applicationCategory: 'BusinessApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description:
      'Free multi-tenant SaaS platform enabling business owners to connect WhatsApp via QR code scan and automate customer support replies using DeepSeek AI and Baileys.',
  };

  return (
    <html lang="en" className="light">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased selection:bg-blue-600 selection:text-white bg-slate-50 text-slate-900">
        <Suspense fallback={null}>
          <PageProgressBar />
        </Suspense>
        <Toaster position="top-right" />
        {children}
        <LiveSupportWidget />
      </body>
    </html>
  );
}
